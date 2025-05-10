export const getTower = (args: {
  label: string
  disks: number
  pegHeight: number
}) => {
  const tower = document.createElement('div')
  tower.classList.add('puzzle__tower')

  const platform = document.createElement('button')
  platform.classList.add('puzzle__platform')
  platform.setAttribute('id', `platform-${args.label}`)
  platform.setAttribute('data-platform-id', args.label)

  const peg = document.createElement('div')
  peg.classList.add('puzzle__peg')
  peg.setAttribute('style', `height: ${args.pegHeight}px;`)

  const base = document.createElement('div')
  base.classList.add('puzzle__base')

  const pegLabel = document.createElement('div')
  pegLabel.classList.add('puzzle__peg-label')
  pegLabel.textContent = args.label

  const disks = document.createElement('div')
  disks.classList.add('puzzle__disks')

  for (let i = 1; i <= args.disks; i++) {
    const disk = document.createElement('div')
    disk.classList.add('puzzle__disk')
    disk.setAttribute('id', `disk-${i}`)
    disk.setAttribute('data-disk-id', `${i}`)
    disk.setAttribute('style', `width: ${getWidth(args.disks, i)}px;`)

    disks.appendChild(disk)
  }

  // the order of the elements is important
  platform.appendChild(disks)
  platform.appendChild(peg)
  platform.appendChild(base)

  // the order of the elements is important
  tower.appendChild(platform)
  tower.appendChild(pegLabel)

  return tower
}

const getWidth = (totalDisks: number, position: number) => {
  const truncatedMaxWidth = 100
  const minWidth = 18

  if (totalDisks <= 1) return truncatedMaxWidth

  const widthRange = truncatedMaxWidth - minWidth
  const normalizedPosition = (position - 1) / (totalDisks - 1)
  const calculatedWidth = minWidth + normalizedPosition * widthRange
  return calculatedWidth
}
