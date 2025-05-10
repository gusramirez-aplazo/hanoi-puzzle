import './style.css'
import { getTower } from './tower/get-tower'

let disks = 3
let originLabel = 'Origén'
let destinationLabel = 'Destino'
let helperLabel = 'Auxiliar'

const form = document.querySelector('form')
const originInput = document.querySelector('#origin')
const destinationInput = document.querySelector('#destination')
const helperInput = document.querySelector('#helper')
const disksInput = document.querySelector('#disks')
const board = document.querySelector('.puzzle__board') as HTMLElement

disksInput?.setAttribute('value', disks as any)
originInput?.setAttribute('value', originLabel)
destinationInput?.setAttribute('value', destinationLabel)
helperInput?.setAttribute('value', helperLabel)

form?.addEventListener('submit', applyFormChanges)

function applyFormChanges(e: Event) {
  e.preventDefault()

  const target = e.target as HTMLFormElement
  const formData = new FormData(target)
  const { disks, origin, destination, helper } = Object.fromEntries(formData)

  originLabel = (origin as string) || 'origin'
  destinationLabel = (destination as string) || 'destination'
  helperLabel = (helper as string) || 'helper'

  run({
    board,
    disks: Number(disks),
    originLabel,
    destinationLabel,
    helperLabel,
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

  listenButtons()
}

if (board) {
  run({
    board,
    disks: Number((disksInput as HTMLInputElement)?.value),
    originLabel,
    destinationLabel,
    helperLabel,
  })
}

function listenButtons() {
  const originPlatform = document.querySelector(
    '#platform-' + originLabel
  ) as HTMLElement
  const destinationPlatform = document.querySelector(
    '#platform-' + destinationLabel
  ) as HTMLElement
  const helperPlatform = document.querySelector(
    '#platform-' + helperLabel
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
          alert('No hay discos en la plataforma seleccionada')

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
        alert('No se puede mover un disco más grande sobre uno más pequeño')
        return true
      }

      // if a different platform is clicked, move the disk
      performMove(
        target.fromDiskId as number,
        target.originPlatformId as string,
        value as string
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

function performMove(diskId: number, from: string, to: string) {
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
}
