export interface PlayerState {
  hasStone: boolean
  bodyColor: string
  outfit: string
  accessory: string | null
  score: number
  choices: string[]
  itemsCollected: string[]
  playstyle: "explorer" | "warrior" | "diplomat" | null
  playerName: string | null
}

export const playerState: PlayerState = {
  hasStone: false,
  bodyColor: "base-blue",
  outfit: "outfit1",
  accessory: null,
  score: 0,
  choices: [],
  itemsCollected: [],
  playstyle: null,
  playerName: null
}
