import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../utils/constants';

/**
 * Enhanced collectible with proper visual graphics
 */
export class VisualCollectible extends Phaser.GameObjects.Container {
  public mainSprite: Phaser.GameObjects.Sprite;
  private glowCircle: Phaser.GameObjects.Graphics;
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private floatTween?: Phaser.Tweens.Tween;
  
  public collected: boolean = false;
  public itemId: string;
  public itemType: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spriteKey: string,
    type: string,
    id: string,
    color: number
  ) {
    super(scene, x, y);
    
    this.itemType = type;
    this.itemId = id;

    // Main sprite (use actual game sprite)
    this.mainSprite = scene.add.sprite(0, 0, spriteKey);
    this.mainSprite.setScale(0.35); // Reduced scale further
    this.add(this.mainSprite);

    // Glow effect behind sprite
    this.glowCircle = scene.add.graphics();
    this.glowCircle.fillStyle(color, 0.3);
    this.glowCircle.fillCircle(0, 0, 40);
    this.glowCircle.setDepth(-1);
    this.add(this.glowCircle);

    // Floating animation
    // Can be disabled for moving items
    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Pulse glow
    scene.tweens.add({
      targets: this.glowCircle,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sparkle particles
    this.addSparkles(color);

    scene.add.existing(this);
    this.setDepth(y); // Depth sort by Y position
    this.setInteractive(
      new Phaser.Geom.Circle(0, 0, 50),
      Phaser.Geom.Circle.Contains
    );
  }

  public stopFloating(): void {
    if (this.floatTween) {
        this.floatTween.stop();
        this.floatTween = undefined;
    }
  }

  private addSparkles(color: number): void {
    const particles = this.scene.add.particles(0, 0, 'pixel', {
      speed: { min: 10, max: 30 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      frequency: 200,
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
      quantity: 1
    });
    
    particles.startFollow(this);
    this.particles = particles;
  }

  /**
   * Collect with celebration animation
   */
  collect(callback?: () => void): void {
    if (this.collected) return;
    
    this.collected = true;
    
    // Stop animations
    if (this.floatTween) this.floatTween.stop();
    if (this.particles) this.particles.stop();

    // Celebration particles
    const celebrationParticles = this.scene.add.particles(this.x, this.y, 'pixel', {
      speed: { min: 100, max: 200 },
      scale: { start: 2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      tint: [0xFFD700, 0xFFFFFF, 0xFFA500],
      blendMode: Phaser.BlendModes.ADD,
      quantity: 20
    });

    celebrationParticles.explode();

    // Collection animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 100,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 600,
      ease: 'Back.easeIn',
      onComplete: () => {
        celebrationParticles.destroy();
        if (callback) callback();
        this.destroy();
      }
    });
  }

  /**
   * Check if player is near
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
    if (this.floatTween) this.floatTween.stop();
    if (this.particles) this.particles.destroy();
    super.destroy(fromScene);
  }
}

/**
 * Create collectible sprites from existing assets
 */
export function createCollectibleSprites(scene: Phaser.Scene): void {
  // For crystals - use glowing stone
  if (!scene.textures.exists('collectible-crystal')) {
    scene.load.image('collectible-crystal', '/sprites/glowing-stone.png');
  }
  
  // For other collectibles, we'll use the portal sprite with different tints
  if (!scene.textures.exists('collectible-item')) {
    scene.load.image('collectible-item', '/sprites/portal.png');
  }
}
