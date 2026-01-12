import * as Phaser from 'phaser';
import { AutoSave } from '../utils/autosave';

/**
 * Pause menu overlay with save/quit options
 */
export class PauseMenu {
  private scene: Phaser.Scene;
  private overlay?: Phaser.GameObjects.Rectangle;
  private container?: Phaser.GameObjects.Container;
  private isPaused: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show the pause menu
   */
  show(): void {
    if (this.isPaused) return;
    this.isPaused = true;

    // Pause game physics/animations
    this.scene.scene.pause();

    // Dark overlay
    this.overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    this.overlay.setDepth(200);
    this.overlay.setScrollFactor(0);

    // Container for menu items
    this.container = this.scene.add.container(400, 300);
    this.container.setDepth(201);

    // Title
    const title = this.scene.add.text(0, -150, '⏸️  PAUSED', {
      fontSize: '36px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Buttons
    const resumeButton = this.createButton(0, -50, '▶️  Resume', () => this.hide());
    const saveButton = this.createButton(0, 20, '💾 Save Game', () => this.saveGame());
    const quitButton = this.createButton(0, 90, '🏠 Main Menu', () => this.quitToMenu());

    this.container.add([title, resumeButton, saveButton, quitButton]);
  }

  /**
   * Hide the pause menu
   */
  hide(): void {
    if (!this.isPaused) return;
    this.isPaused = false;

    // Resume game
    this.scene.scene.resume();

    // Clean up UI
    if (this.overlay) this.overlay.destroy();
    if (this.container) this.container.destroy();
  }

  /**
   * Check if currently paused
   */
  isActive(): boolean {
    return this.isPaused;
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.scene.add.text(x, y, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#555555', color: '#FFD700' });
    });

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#333333', color: '#ffffff' });
    });

    button.on('pointerdown', callback);

    return button;
  }

  private saveGame(): void {
    AutoSave.save();
    
    // Show confirmation
    const confirmText = this.scene.add.text(0, 150, '✅ Game Saved!', {
      fontSize: '20px',
      color: '#00FF00',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    if (this.container) {
      this.container.add(confirmText);
    }

    this.scene.time.delayedCall(2000, () => {
      confirmText.destroy();
    });
  }

  private quitToMenu(): void {
    AutoSave.save();
    this.hide();
    this.scene.scene.start('MainMenu');
  }
}
