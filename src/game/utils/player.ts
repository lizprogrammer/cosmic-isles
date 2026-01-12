import * as Phaser from 'phaser';
import { playerState } from '../state/PlayerState';

/**
 * Consistent player character using the avatar created by the player
 * This is YOUR character that you customized!
 */
export class Player {
  public container: Phaser.GameObjects.Container;
  private bodySprite: Phaser.GameObjects.Sprite;
  private outfitSprite: Phaser.GameObjects.Sprite;
  private accessorySprite: Phaser.GameObjects.Sprite;
  private glowCircle: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Create container for all avatar parts
    this.container = scene.add.container(x, y);
    this.container.setDepth(10);

    // Add glow effect (so player stands out)
    this.glowCircle = scene.add.graphics();
    this.glowCircle.fillStyle(0x00FF00, 0.15);
    this.glowCircle.fillCircle(0, 0, 35);
    this.container.add(this.glowCircle);

    // Glow pulse animation
    scene.tweens.add({
      targets: this.glowCircle,
      alpha: 0.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Build avatar from player state
    this.bodySprite = scene.add.sprite(0, 0, playerState.bodyColor || 'base-blue');
    this.bodySprite.setScale(0.35);
    this.container.add(this.bodySprite);

    this.outfitSprite = scene.add.sprite(0, 0, playerState.outfit || 'outfit-1');
    this.outfitSprite.setScale(0.35);
    this.container.add(this.outfitSprite);

    this.accessorySprite = scene.add.sprite(0, 0, playerState.accessory || 'antenna');
    this.accessorySprite.setScale(0.35);
    this.container.add(this.accessorySprite);

    scene.add.existing(this.container);
  }

  get x(): number {
    return this.container.x;
  }

  get y(): number {
    return this.container.y;
  }

  set x(value: number) {
    this.container.x = value;
  }

  set y(value: number) {
    this.container.y = value;
  }

  flipX(flip: boolean): void {
    this.container.setScale(flip ? -1 : 1, 1);
  }

  destroy(): void {
    this.container.destroy();
  }
}

/**
 * Preload all avatar parts
 */
export function preloadPlayerAvatar(scene: Phaser.Scene): void {
  // Body options
  scene.load.image('base-blue', '/sprites/avatar/base-blue.png');
  scene.load.image('base-green', '/sprites/avatar/base-green.png');
  
  // Outfit options
  scene.load.image('outfit-1', '/sprites/avatar/outfit-1.png');
  scene.load.image('outfit-2', '/sprites/avatar/outfit-2.png');
  scene.load.image('outfit-3', '/sprites/avatar/outfit-3.png');
  
  // Accessory options
  scene.load.image('antenna', '/sprites/avatar/antenna.png');
  scene.load.image('glasses', '/sprites/avatar/glasses.png');
  scene.load.image('hat', '/sprites/avatar/hat.png');
}
