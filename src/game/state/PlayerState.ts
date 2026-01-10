export interface PlayerState {
  hasStone: boolean
  bodyColor: string
  outfit: string
  accessory: string | null
}

export const playerState: PlayerState = {
  hasStone: false,
  bodyColor: "base-blue",
  outfit: "outfit1",
  accessory: null
}
