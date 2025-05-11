import './style.css'

import { config } from './config'
import {
  type HanoiApiRequest,
  type HanoiSolution,
  type HanoiStep,
} from './entities/api'
import { getTower } from './tower/get-tower'

let currentDisks = 3
let currentOriginLabel = config.originLabel
let currentDestinationLabel = config.destinationLabel
let currentHelperLabel = config.helperLabel
let solution: HanoiSolution | null = null

const form = document.querySelector('form')
const originInput = document.querySelector('#origin')
const destinationInput = document.querySelector('#destination')
const helperInput = document.querySelector('#helper')
const disksInput = document.querySelector('#disks')
const board = document.querySelector('.puzzle__board') as HTMLElement
const getSolutionButton = document.querySelector('#get-solution-button')
const solvePuzzleButton = document.querySelector('#solve-puzzle-button')

disksInput?.setAttribute('value', currentDisks as any)
originInput?.setAttribute('value', currentOriginLabel)
destinationInput?.setAttribute('value', currentDestinationLabel)
helperInput?.setAttribute('value', currentHelperLabel)

form?.addEventListener('submit', applyFormChanges)

function applyFormChanges(e: Event) {
  e.preventDefault()

  const solutionFinalContainer = document.querySelector(
    '#hanoi-solution-container'
  ) as HTMLElement

  if (solutionFinalContainer) {
    solutionFinalContainer.innerHTML = ''
  }

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

  const pegHeight = args.disks * 23 + 20

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

  solvePuzzleButton?.classList.add('button-hidden')

  getSolutionButton?.removeEventListener('click', renderSolutionSteps)
  getSolutionButton?.addEventListener('click', renderSolutionSteps)

  solvePuzzleButton?.removeEventListener('click', autoSolve)
  solvePuzzleButton?.addEventListener('click', autoSolve)
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
  const transitiveState: {
    originPlatformId: string | null
    fromDiskId: number | null
  } = {
    originPlatformId: null,
    fromDiskId: null,
  }
  const originPlatformClickableEle = document.querySelector(
    '#platform-' + currentOriginLabel
  ) as HTMLButtonElement
  const destinationPlatformClickableEle = document.querySelector(
    '#platform-' + currentDestinationLabel
  ) as HTMLButtonElement
  const helperPlatformClickableEle = document.querySelector(
    '#platform-' + currentHelperLabel
  ) as HTMLButtonElement

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
        // clear the state
        Reflect.set(target, prop, null)
        Reflect.set(target, 'fromDiskId', null)

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

  originPlatformClickableEle?.addEventListener('click', (e) =>
    setState(e, originPlatformClickableEle, gameStateProxy)
  )
  destinationPlatformClickableEle?.addEventListener('click', (e) =>
    setState(e, destinationPlatformClickableEle, gameStateProxy)
  )
  helperPlatformClickableEle?.addEventListener('click', (e) =>
    setState(e, helperPlatformClickableEle, gameStateProxy)
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
    isFinished(numOfDisks, currentDestinationLabel)
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

async function renderSolutionSteps(e: Event) {
  e.preventDefault()

  getSolutionButton?.setAttribute('disabled', 'true')

  solution = await getSolution({
    disks: currentDisks,
    origin: currentOriginLabel,
    destiny: currentDestinationLabel,
    helper: currentHelperLabel,
  })

  if (!solution || solution.totalMoves < 0) {
    alert(config.errorGettingSolutionMessage)
    return
  }

  const solutionContainerTemplate = document.querySelector(
    '#hanoi-solution-template'
  ) as HTMLTemplateElement
  const solutionFinalContainer = document.querySelector(
    '#hanoi-solution-container'
  ) as HTMLElement
  const solutionToRender = solutionContainerTemplate.content.cloneNode(
    true
  ) as HTMLElement
  const minimumMovesEle = solutionToRender.querySelector(
    '#hanoi-solution-moves'
  ) as HTMLElement | null
  const solutionList = solutionToRender.querySelector(
    '#hanoi-solution-list'
  ) as HTMLElement
  const partialSolutionDisclaimer = solutionToRender.querySelector(
    '#hanoi-partial-solution-disclaimer'
  ) as HTMLElement | null

  if (solution.solution.length >= solution.totalMoves) {
    partialSolutionDisclaimer?.remove()
  }

  minimumMovesEle &&
    (minimumMovesEle.innerText = solution.totalMoves.toLocaleString())
  solution.solution.forEach((step) => setSolutionStep(step, solutionList))

  solutionFinalContainer.innerHTML = ''
  solutionFinalContainer.appendChild(solutionToRender)

  solvePuzzleButton?.classList.remove('button-hidden')
  getSolutionButton?.removeAttribute('disabled')
}

function setSolutionStep(step: HanoiStep, container: HTMLElement) {
  const item = document.createElement('li')
  item.classList.add('solution__item')

  item.innerText = `Move disk ${step.disk} from ${step.from} to ${step.to}`

  container.appendChild(item)
}

function getSolution(request: HanoiApiRequest): Promise<HanoiSolution> {
  return fetch(`${config.baseUrl}/api/v1/hanoi`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error ?? res.statusText)
      }

      return await res.json()
    })
    .then((data) => data.data)
    .catch((err) => {
      console.warn(err)

      return {
        totalMoves: -1,
        time: 0,
        solution: [],
      }
    })
}

let startTime: number | null = null
let stepIndex = 0

function animateSolution(timestamp: number) {
  if (!startTime) {
    startTime = timestamp
  }

  const elapsed = timestamp - startTime
  const elapsedSeconds = Number((elapsed / 1000).toFixed(2))

  if (elapsedSeconds >= 0.75 && solution) {
    performMove(
      solution.solution[stepIndex].disk,
      solution.solution[stepIndex].from,
      solution.solution[stepIndex].to,
      currentDisks
    )

    stepIndex++
    startTime = timestamp
  }

  if (stepIndex < (solution?.solution.length ?? 0)) {
    requestAnimationFrame(animateSolution)
  } else {
    getSolutionButton?.removeAttribute('disabled')
    solvePuzzleButton?.removeAttribute('disabled')
    form?.querySelector('button')?.removeAttribute('disabled')

    document
      .querySelector('#platform-' + currentOriginLabel)
      ?.removeAttribute('disabled')
    document
      .querySelector('#platform-' + currentDestinationLabel)
      ?.removeAttribute('disabled')
    document
      .querySelector('#platform-' + currentHelperLabel)
      ?.removeAttribute('disabled')
  }
}

function autoSolve() {
  if (!solution) return

  getSolutionButton?.setAttribute('disabled', 'true')
  solvePuzzleButton?.setAttribute('disabled', 'true')
  form?.querySelector('button')?.setAttribute('disabled', 'true')

  document
    .querySelector('#platform-' + currentOriginLabel)
    ?.setAttribute('disabled', 'true')
  document
    .querySelector('#platform-' + currentDestinationLabel)
    ?.setAttribute('disabled', 'true')
  document
    .querySelector('#platform-' + currentHelperLabel)
    ?.setAttribute('disabled', 'true')

  requestAnimationFrame(animateSolution)
}
