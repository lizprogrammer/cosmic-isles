import * as Phaser from "phaser";

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    console.log("🚀 Boot Scene: Preloading splash image...");
    // Only load the splash image needed for MainMenu
    // Don't preload everything here - let scenes load their own assets on demand
    this.load.image('splash', '/splash.png');
    
    this.load.once('complete', () => {
      console.log("✅ Boot Scene: Assets loaded");
    });
  }

  create() {
    console.log("✅ Boot Scene: Starting, transitioning to MainMenu...");
    // Immediately transition to MainMenu (no delays)
    this.scene.start('MainMenu');
    console.log("✅ Boot Scene: Transition complete");
  }
}
