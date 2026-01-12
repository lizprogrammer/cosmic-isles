import * as Phaser from 'phaser';
import { questState } from '../state/QuestState';
import { gameState, getTotalPlayTime } from '../state/GameState';
import { playerState } from '../state/PlayerState';
import { DialogueManager } from '../components/DialogueManager';
import { ensurePixelTexture } from '../components/Collectible';
import { AssetGenerator } from '../utils/AssetGenerator';
import { ISLANDS } from '../utils/constants';

/**
 * Star Sanctum - Final scene after completing all 5 islands
 * Shows the reformed star and transitions to NFT mint
 */
export default class StarSanctum extends Phaser.Scene {
  private dialogueManager!: DialogueManager;
  private starFragments: Phaser.GameObjects.Graphics[] = [];
  private reformedStar?: Phaser.GameObjects.Graphics;
  private generator?: AssetGenerator;

  constructor() {
    super('StarSanctum');
  }

  preload() {
    // Initialize Generator
    this.generator = new AssetGenerator(this);
    this.generator.generateGlobalAssets();
    this.generator.generateStarSanctumAssets();
  }

  create() {
    console.log('⭐ Star Sanctum - Meta Quest Complete!');
    ensurePixelTexture(this);

    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    const cy = height / 2;

    // Dark mystical background (Procedural)
    this.add.image(cx, cy, 'terrain-sanctum').setDepth(0).setDisplaySize(width, height);
    
    // Add some cosmic particles
    const particles = this.add.particles(0, 0, 'pixel', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      speed: { min: 5, max: 20 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 3000,
      frequency: 100,
      tint: [0xFFD700, 0x9D4EDD, 0x4CC9F0],
      blendMode: Phaser.BlendModes.ADD
    });
    particles.setDepth(1);

    this.dialogueManager = new DialogueManager(this);

    // Show title
    const title = this.add.text(cx, height * 0.1, '⭐ THE STAR SANCTUM ⭐', {
      fontSize: '36px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    // Create star fragments (one from each island)
    this.createStarFragments();

    // Animate fragments coming together
    this.time.delayedCall(1000, () => this.animateStarReformation());
  }

  private createStarFragments(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    const fragmentPositions = [
      { x: width * 0.25, y: height * 0.3, color: ISLANDS.ISLAND_1.color },
      { x: width * 0.75, y: height * 0.3, color: ISLANDS.ISLAND_2.color },
      { x: width * 0.5, y: height * 0.7, color: ISLANDS.ISLAND_3.color }
    ];

    fragmentPositions.forEach((data) => {
      const fragment = this.add.graphics();
      fragment.fillStyle(data.color, 1);
      fragment.fillCircle(0, 0, 30); // Draw at 0,0 relative to object
      fragment.setPosition(data.x, data.y);
      fragment.lineStyle(2, 0xffffff, 1);
      fragment.strokeCircle(0, 0, 30);
      fragment.setDepth(10);
      this.starFragments.push(fragment);

      // Pulse animation
      this.tweens.add({
        targets: fragment,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    });
  }

  private animateStarReformation(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.dialogueManager.show('The star fragments resonate with cosmic energy...', 3000);

    // Move all fragments to center
    this.starFragments.forEach((fragment, index) => {
      this.tweens.add({
        targets: fragment,
        x: cx,
        y: cy,
        duration: 2000,
        delay: index * 200,
        ease: 'Power2',
        onComplete: () => {
          if (index === this.starFragments.length - 1) {
            this.time.delayedCall(500, () => this.createReformedStar());
          }
        }
      });
    });
  }

  private createReformedStar(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Hide fragments
    this.starFragments.forEach(f => f.setVisible(false));

    // Create magnificent reformed star
    this.reformedStar = this.add.graphics();
    this.reformedStar.setPosition(cx, cy); // Use position
    this.reformedStar.setDepth(20);

    // Multi-layered star
    const colors = [
      ISLANDS.ISLAND_1.color,
      ISLANDS.ISLAND_2.color,
      ISLANDS.ISLAND_3.color
    ];

    colors.forEach((color, index) => {
      const size = 80 - (index * 10);
      this.reformedStar!.fillStyle(color, 0.8);
      this.reformedStar!.fillCircle(0, 0, size);
    });

    // Add white core
    this.reformedStar.fillStyle(0xffffff, 1);
    this.reformedStar.fillCircle(0, 0, 20);

    // Glow effect
    this.tweens.add({
      targets: this.reformedStar,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Particle burst
    const particles = this.add.particles(cx, cy, 'pixel', {
      speed: { min: 50, max: 200 },
      scale: { start: 3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      tint: colors,
      blendMode: Phaser.BlendModes.ADD,
      frequency: 50
    });
    particles.setDepth(15);

    this.showCompletionMessage();
  }

  private showCompletionMessage(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const height = this.scale.height;

    this.dialogueManager.show('🌟 THE SHATTERED STAR HAS BEEN REFORGED! 🌟', 4000);

    // Show completion stats
    const playTime = getTotalPlayTime();
    const badges = questState.getBadgeCount();

    const statsText = this.add.text(cx, height * 0.75, 
      `Journey Complete!\n` +
      `Badges Earned: ${badges}/3\n` +
      `Time: ${playTime} minutes\n` +
      `Completion: ${gameState.completionSpeed || 'normal'}`,
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.tweens.add({
      targets: statsText,
      alpha: 1,
      duration: 1000,
      delay: 2000
    });

    // Mint button
    const mintButton = this.add.text(cx, height * 0.9, '✨ Mint Your Achievement NFT ✨', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(100).setAlpha(0).setInteractive();

    this.tweens.add({
      targets: mintButton,
      alpha: 1,
      duration: 1000,
      delay: 4000
    });

    mintButton.on('pointerdown', () => {
      this.scene.start('MintScreen');
    });

    mintButton.on('pointerover', () => {
      mintButton.setScale(1.1);
    });

    mintButton.on('pointerout', () => {
      mintButton.setScale(1);
    });
  }

  shutdown() {
    if (this.dialogueManager) this.dialogueManager.destroy();
  }
}
