import * as Phaser from "phaser";

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    // preload minimal assets here if needed
  }

  create() {
    this.scene.start('AvatarCreator')
  }
}
