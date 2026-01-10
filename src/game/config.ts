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
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    // Add these for better mobile support
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 1920,
      height: 1440
    }
  },
  scene: [Boot, AvatarCreator, RoomA, RoomB, RoomC]
}
