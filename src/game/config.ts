import * as Phaser from "phaser"
import { Boot } from './scenes/Boot'
import AvatarCreator from './scenes/AvatarCreator'
import RoomA from './scenes/RoomA'
import RoomB from './scenes/RoomB'
import RoomC from './scenes/RoomC'

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [Boot, AvatarCreator, RoomA, RoomB, RoomC]
}
