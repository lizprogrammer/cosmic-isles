import * as Phaser from "phaser"
import { Boot } from './scenes/Boot'
import MainMenu from './scenes/MainMenu'
import AvatarCreator from './scenes/AvatarCreator'
import Island1 from './scenes/Island1'
import Island2 from './scenes/Island2'
import Island3 from './scenes/Island3'
import StarSanctum from './scenes/StarSanctum'
import MintScreen from './scenes/MintScreen'

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',

  // ⭐ Mobile input fix
  input: {
    activePointers: 3,   // allow multi-touch
    touch: true,         // enable touch input
    mouse: true          // keep mouse enabled for desktop
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    min: {
      width: 320,
      height: 180
    }
  },

  scene: [Boot, MainMenu, AvatarCreator, Island1, StarSanctum, MintScreen]
}
