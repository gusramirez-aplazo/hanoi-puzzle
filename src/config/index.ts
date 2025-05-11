const DEFAULT_ORIGIN_LABEL = 'Origin'
const DEFAULT_DESTINATION_LABEL = 'Destination'
const DEFAULT_HELPER_LABEL = 'Helper'
const EMPTY_PLATFORM_ERROR_MESSAGE = 'There are no disks in the chosen platform'
const INVALID_MOVE_ERROR_MESSAGE =
  'You cannot move a larger disk on top of a smaller one'
const FINISH_SUCCESS_MESSAGE =
  'Congratulations! You have completed the game. Do you want to restart?'
const BASE_URL = 'https://hanoi.gusramirez.dev'

export const config = {
  originLabel: DEFAULT_ORIGIN_LABEL,
  destinationLabel: DEFAULT_DESTINATION_LABEL,
  helperLabel: DEFAULT_HELPER_LABEL,
  emptyPlatformErrorMessage: EMPTY_PLATFORM_ERROR_MESSAGE,
  invalidMoveErrorMessage: INVALID_MOVE_ERROR_MESSAGE,
  finishSuccessMessage: FINISH_SUCCESS_MESSAGE,
  baseUrl: BASE_URL,
}
