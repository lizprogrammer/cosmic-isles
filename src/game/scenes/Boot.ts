import * as Phaser from "phaser";

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    // 1. Splash Screen
    this.load.image('splash', '/splash.png');

    // 2. Avatar Assets (Common)
    const avatarAssets = [
      'base-blue', 'base-green',
      'outfit-1', 'outfit-2', 'outfit-3',
      'antenna', 'glasses', 'hat'
    ];
    avatarAssets.forEach(asset => {
      this.load.image(asset, `/sprites/avatar/${asset}.png`);
    });

    // 3. Common Game Assets (Used in Island1 and beyond)
    // Preloading these here ensures smooth transitions
    const commonAssets = [
      { key: 'npc-guidebot', path: '/sprites/npc-guidebot.png' },
      { key: 'npc-villager', path: '/sprites/npc-villager.png' },
      { key: 'npc-starsage', path: '/sprites/npc-starsage.png' },
      { key: 'portal', path: '/sprites/portal.png' },
      { key: 'door-locked', path: '/sprites/door-locked.png' },
      { key: 'door-open', path: '/sprites/door-open.png' },
      { key: 'bushes', path: '/sprites/bushes.png' },
      { key: 'flower-pile', path: '/sprites/flower-pile.png' },
      { key: 'floating-ember-core', path: '/sprites/floating-ember-core.png' },
      { key: 'star-fragment', path: '/sprites/star-fragment.png' }
    ];

    commonAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });

    // Loading Bar UI
    const width = this.scale.width;
    const height = this.scale.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading Cosmic Isles...', {
      font: '20px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 5);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      console.log('✅ Assets Loaded');
      this.scene.start('MainMenu');
    });
  }

  create() {
    // Scene start is handled in on('complete')
  }
}
