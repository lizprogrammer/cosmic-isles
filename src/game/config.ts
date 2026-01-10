import * as Phaser from "phaser"
import { Boot } from './scenes/Boot'
import AvatarCreator from './scenes/AvatarCreator'
import RoomA from './scenes/RoomA'
import RoomB from './scenes/RoomB'
import RoomC from './scenes/RoomC'

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  scene: [Boot, AvatarCreator, RoomA, RoomB, RoomC]
}
