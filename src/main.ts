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

  initBoard({
    board,
    disks: Number(disks),
    originLabel,
    destinationLabel,
    helperLabel,
  })
}

function initBoard(args: {
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
  board.appendChild(destinationTower)
  board.appendChild(helperTower)
}

if (board) {
  initBoard({
    board,
    disks: Number((disksInput as HTMLInputElement)?.value),
    originLabel,
    destinationLabel,
    helperLabel,
  })
}

const pegOrigin = document.querySelector('#peg-' + originLabel)
const pegDestination = document.querySelector('#peg-' + destinationLabel)
const pegHelper = document.querySelector('#peg-' + helperLabel)

const performPlay = (fromPeg: HTMLElement, toPeg: HTMLElement) => {
  const diskAtTopFromPeg = fromPeg.querySelector('.puzzle__disk')

  if (!diskAtTopFromPeg) return

  const diskAtTopToPeg = toPeg.querySelector('.puzzle__disk')

  const diskIdFromPeg = diskAtTopFromPeg.getAttribute('data-disk-id')
    ? Number(diskAtTopFromPeg.getAttribute('data-disk-id'))
    : -1
  const diskIdToPeg = diskAtTopToPeg?.getAttribute('data-disk-id')
    ? Number(diskAtTopToPeg.getAttribute('data-disk-id'))
    : -1

  if (diskIdToPeg === -1) {
    toPeg.appendChild(diskAtTopFromPeg)
  } else if (diskIdFromPeg < diskIdToPeg) {
    toPeg.appendChild(diskAtTopFromPeg)
  } else {
    console.log('Invalid move')
  }
}

let state: any[] = []

function onePlay(e: Event) {
  // the current target is the platform that was clicked
  const target = e.target as HTMLElement

  // if there is no disk in the platform, the state is empty
  // if (!target.querySelector('.puzzle__disk')) {
  //   state = []
  //   return
  // }
  console.log(target)
  console.log(state)

  // if (state.length === 0) {
  //   state.push(target)
  // } else if (state.length === 1 && state[0] !== target) {
  //   state.push(target)
  // } else if (state.length === 1 && state[0] === target) {
  //   state = []
  // } else if (state.length === 2) {
  //   performPlay(state[0], state[1])
  // } else {
  //   state = []
  // }
}

pegOrigin?.addEventListener('click', onePlay)
pegDestination?.addEventListener('click', onePlay)
pegHelper?.addEventListener('click', onePlay)
