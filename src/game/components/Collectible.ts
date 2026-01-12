import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../utils/constants';

/**
 * Reusable collectible item with glow/pulse animation
 */
export class Collectible extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Graphics;
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private glowTween?: Phaser.Tweens.Tween;
  public collected: boolean = false;
  public itemId: string;
  public itemType: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    type: string,
    id: string
  ) {
    super(scene, x, y);
    
    this.itemType = type;
    this.itemId = id;

    // Create visual representation
    this.sprite = scene.add.graphics();
    this.createShape(color);
    this.add(this.sprite);

    // Add glow animation
    this.glowTween = scene.tweens.add({
      targets: this,
      scaleX: GAME_CONFIG.COLLECTIBLE_GLOW_SCALE,
      scaleY: GAME_CONFIG.COLLECTIBLE_GLOW_SCALE,
      alpha: 0.7,
      duration: GAME_CONFIG.COLLECTIBLE_PULSE_DURATION,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add particle effect
    this.addParticles(color);

    scene.add.existing(this);
    this.setDepth(15);
  }

  private createShape(color: number): void {
    // Create a glowing geometric shape
    this.sprite.clear();
    this.sprite.fillStyle(color, 1);
    this.sprite.fillCircle(0, 0, 20);
    
    // Add glow effect
    this.sprite.lineStyle(3, color, 0.5);
    this.sprite.strokeCircle(0, 0, 25);
    this.sprite.strokeCircle(0, 0, 30);
  }

  private addParticles(color: number): void {
    // Create subtle particle glow
    const particles = this.scene.add.particles(0, 0, 'pixel', {
      speed: { min: -20, max: 20 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1000,
      frequency: 100,
      tint: color,
      blendMode: Phaser.BlendModes.ADD
    });
    
    particles.startFollow(this);
    this.particles = particles;
  }

  /**
   * Collect this item with animation
   */
  collect(callback?: () => void): void {
    if (this.collected) return;
    
    this.collected = true;
    
    // Stop glow animation
    if (this.glowTween) {
      this.glowTween.stop();
    }

    // Stop particles
    if (this.particles) {
      this.particles.stop();
    }

    // Collection animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 500,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Check if player is near enough to auto-collect
   */
  isPlayerNear(playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      playerX,
      playerY
    );
    return distance < GAME_CONFIG.INTERACTION_DISTANCE;
  }

  destroy(fromScene?: boolean): void {
    if (this.glowTween) {
      this.glowTween.stop();
    }
    if (this.particles) {
      this.particles.destroy();
    }
    super.destroy(fromScene);
  }
}

// Helper function to create pixel texture if not exists
export function ensurePixelTexture(scene: Phaser.Scene): void {
  if (!scene.textures.exists('pixel')) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture('pixel', 1, 1);
    graphics.destroy();
  }
}
