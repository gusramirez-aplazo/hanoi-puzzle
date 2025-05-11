import { config } from './config'
import './style.css'
import { getTower } from './tower/get-tower'

let currentDisks = 3
let currentOriginLabel = config.originLabel
let currentDestinationLabel = config.destinationLabel
let currentHelperLabel = config.helperLabel

const form = document.querySelector('form')
const originInput = document.querySelector('#origin')
const destinationInput = document.querySelector('#destination')
const helperInput = document.querySelector('#helper')
const disksInput = document.querySelector('#disks')
const board = document.querySelector('.puzzle__board') as HTMLElement

disksInput?.setAttribute('value', currentDisks as any)
originInput?.setAttribute('value', currentOriginLabel)
destinationInput?.setAttribute('value', currentDestinationLabel)
helperInput?.setAttribute('value', currentHelperLabel)

form?.addEventListener('submit', applyFormChanges)

function applyFormChanges(e: Event) {
  e.preventDefault()

  const target = e.target as HTMLFormElement
  const formData = new FormData(target)
  const { disks, origin, destination, helper } = Object.fromEntries(formData)

  currentDisks = Number(disks)
  currentOriginLabel = String(origin)
  currentDestinationLabel = String(destination)
  currentHelperLabel = String(helper)

  run({
    board,
    disks: currentDisks,
    originLabel: currentOriginLabel,
    destinationLabel: currentDestinationLabel,
    helperLabel: currentHelperLabel,
  })
}

function run(args: {
  board: HTMLElement
  disks: number
  originLabel: string
  destinationLabel: string
  helperLabel: string
}) {
  if (!board) return

  board.innerHTML = ''

  const pegHeight = args.disks * 12 + 20

  const originTower = getTower({
    label: args.originLabel,
    disks: args.disks,
    pegHeight,
  })
  const destinationTower = getTower({
    label: args.destinationLabel,
    disks: 0,
    pegHeight,
  })
  const helperTower = getTower({
    label: args.helperLabel,
    disks: 0,
    pegHeight,
  })

  board.appendChild(originTower)
  board.appendChild(helperTower)
  board.appendChild(destinationTower)

  listenButtons(currentDisks)
}

if (board) {
  run({
    board,
    disks: Number((disksInput as HTMLInputElement)?.value),
    originLabel: currentOriginLabel,
    destinationLabel: currentDestinationLabel,
    helperLabel: currentHelperLabel,
  })
}

function listenButtons(disks: number) {
  const originPlatform = document.querySelector(
    '#platform-' + currentOriginLabel
  ) as HTMLElement
  const destinationPlatform = document.querySelector(
    '#platform-' + currentDestinationLabel
  ) as HTMLElement
  const helperPlatform = document.querySelector(
    '#platform-' + currentHelperLabel
  ) as HTMLElement

  const transitiveState: {
    originPlatformId: string | null
    fromDiskId: number | null
  } = {
    originPlatformId: null,
    fromDiskId: null,
  }

  const gameStateHandler: ProxyHandler<typeof transitiveState> = {
    set(target, prop, value) {
      if (prop !== 'originPlatformId') {
        return Reflect.set(target, prop, value)
      }

      // not origin platform is set
      if (target[prop] == null) {
        Reflect.set(target, prop, value)

        const platformEle = document.querySelector(
          '[data-platform-id="' + value + '"]'
        )
        const disk = platformEle?.querySelector('.puzzle__disk') ?? null
        const diskId = Number(disk?.getAttribute('data-disk-id') ?? Infinity)

        if (!disk) {
          Reflect.set(target, prop, null)
          alert(config.emptyPlatformErrorMessage)

          return true
        }

        Reflect.set(target, 'fromDiskId', diskId)
        return true
      }

      // here the originPlatformId is already set

      // if the same platform is clicked again, reset the state
      if (target.originPlatformId === value) {
        Reflect.set(target, prop, null)
        Reflect.set(target, 'fromDiskId', null)
        return true
      }

      // find the disk on top at the destination platform
      const destinationPlatformEle = document.querySelector(
        '[data-platform-id="' + value + '"]'
      )
      const destinationDiskAtTop =
        destinationPlatformEle?.querySelector('.puzzle__disk') ?? null
      const diskId = destinationDiskAtTop
        ? Number(destinationDiskAtTop.getAttribute('data-disk-id'))
        : Infinity

      // validate the move
      if ((target.fromDiskId ?? Infinity) >= diskId) {
        alert(config.invalidMoveErrorMessage)
        return true
      }

      // if a different platform is clicked, move the disk
      performMove(
        target.fromDiskId as number,
        target.originPlatformId as string,
        value as string,
        disks
      )

      // clear the state
      Reflect.set(target, prop, null)
      Reflect.set(target, 'fromDiskId', null)

      return true
    },
  }

  const gameStateProxy = new Proxy(transitiveState, gameStateHandler)

  originPlatform?.addEventListener('click', (e) =>
    setState(e, originPlatform, gameStateProxy)
  )
  destinationPlatform?.addEventListener('click', (e) =>
    setState(e, destinationPlatform, gameStateProxy)
  )
  helperPlatform?.addEventListener('click', (e) =>
    setState(e, helperPlatform, gameStateProxy)
  )
}

function setState(
  e: Event,
  target: HTMLElement,
  proxy: { originPlatformId: string | null; fromDiskId: number | null }
) {
  e.preventDefault()

  proxy.originPlatformId = target.getAttribute('data-platform-id') || null
}

function performMove(
  diskId: number,
  from: string,
  to: string,
  numOfDisks: number
) {
  const diskToMove = document.querySelector(
    `[data-disk-id="${diskId}"`
  ) as HTMLElement
  const destinationPlatform = document.querySelector(
    `[data-platform-id="${to}"]`
  )

  const destinationDisksContainer = destinationPlatform?.querySelector(
    '.puzzle__disks'
  ) as HTMLElement

  destinationDisksContainer?.prepend(diskToMove)

  setTimeout(() => {
    isFinished(numOfDisks, to)
  }, 0)
}

function isFinished(numOfDisks: number, destination: string) {
  const destinationPlatform = document.querySelector(
    `[data-platform-id="${destination}"]`
  )

  const destinationDisksContainer = destinationPlatform?.querySelector(
    '.puzzle__disks'
  ) as HTMLElement

  const disks = destinationDisksContainer?.querySelectorAll(
    '.puzzle__disk'
  ) as NodeListOf<HTMLElement>

  if (disks.length === numOfDisks) {
    if (confirm(config.finishSuccessMessage)) {
      location.reload()
    }
  }
}
