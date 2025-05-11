export interface HanoiStep {
  disk: number
  from: string
  to: string
}

export interface HanoiSolution {
  totalMoves: number
  time: number
  solution: HanoiStep[]
}

export interface HanoiApiResponse {
  data: HanoiSolution
  ok: boolean
  error: null
}

export interface HanoiApiRequest {
  disks: number
  origin: string
  destiny: string
  helper: string
}
