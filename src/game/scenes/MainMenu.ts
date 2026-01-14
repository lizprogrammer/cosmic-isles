import * as Phaser from 'phaser';
import { storage } from '../utils/storage';
import { questState } from '../state/QuestState';
import { gameState } from '../state/GameState';
import { GAME_CONFIG } from '../utils/constants';

/**
 * Main Menu - Entry point with New Game / Continue options
 */
export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  preload() {
    this.load.image('splash', '/splash.png');
    
    // Preload avatar assets so AvatarCreator loads instantly
    this.load.image("base-blue", "/sprites/avatar/base-blue.png");
    this.load.image("base-green", "/sprites/avatar/base-green.png");
    this.load.image("outfit-1", "/sprites/avatar/outfit-1.png");
    this.load.image("outfit-2", "/sprites/avatar/outfit-2.png");
    this.load.image("outfit-3", "/sprites/avatar/outfit-3.png");
    this.load.image("antenna", "/sprites/avatar/antenna.png");
    this.load.image("glasses", "/sprites/avatar/glasses.png");
    this.load.image("hat", "/sprites/avatar/hat.png");
  }

  create() {
    console.log('🌌 Cosmic Isles - Main Menu');

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Background - Cover Screen with correct aspect ratio
    const bg = this.add.image(cx, cy, 'splash');
    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    bg.setAlpha(0.6);

    // Dark overlay
    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.5);

    // Title
    const titleFontSize = Math.max(32, Math.min(64, this.scale.width * 0.12)); // Dynamic font size
    const title = this.add.text(cx, cy - 150, 'COSMIC ISLES', {
      fontSize: `${titleFontSize}px`,
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, stroke: true, fill: true }
    }).setOrigin(0.5);

    const subtitle = this.add.text(cx, cy - 80, 'Journey Through the Islands to Reforge the Shattered Star', {
      fontSize: '20px',
      color: '#E0E0E0',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      wordWrap: { width: this.scale.width * 0.8 }
    }).setOrigin(0.5);

    // Check for saved progress
    const hasSave = storage.hasSave();

    // New Game button
    console.log('🔧 Creating New Game button...');
    const newGameButton = this.createStyledButton(cx, cy + 50, 'New Game', 0xFFD700, () => {
      console.log('🔘🔘🔘 New Game button clicked! CALLBACK FIRED!');
      try {
        // Disable button immediately for visual feedback
        newGameButton.setAlpha(0.7);
        newGameButton.disableInteractive();
        
        // Execute immediately (no async operations)
        if (hasSave) {
          console.log('📋 Save exists, showing confirmation...');
          this.showConfirmReset();
        } else {
          console.log('🚀 No save, starting new game...');
          this.startNewGame();
        }
      } catch (error) {
        console.error('❌ Error in New Game button:', error);
        // Re-enable button on error
        newGameButton.setAlpha(1);
        newGameButton.setInteractive();
      }
    });
    console.log('✅ New Game button created, interactive:', newGameButton.input?.enabled);

    // Pulse animation for New Game button
    this.tweens.add({
      targets: newGameButton,
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });

    // Continue button (if save exists)
    if (hasSave) {
      const continueButton = this.createStyledButton(cx, cy + 140, 'Continue', 0x00FF00, () => {
        console.log('🔘 Continue button clicked!');
        this.continueGame();
      });
    }

    // Credits
    this.add.text(cx, this.scale.height - 40, 'A Farcaster Mini App • Built with Phaser', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    console.log('✅ MainMenu: UI created, ready for interaction!');
  }

  private createStyledButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const width = 280;
    const height = 60;
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 15);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 15);
    
    const label = this.add.text(0, 0, text, {
      fontSize: '28px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    
    // Interactive - Use simpler approach for better reliability
    container.setSize(width, height);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    
    // Multiple event handlers for better reliability
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log(`👆👆👆 Button "${text}" pointerdown event fired!`, {
        x: pointer.x,
        y: pointer.y,
        worldX: pointer.worldX,
        worldY: pointer.worldY
      });
      callback();
    });
    
    container.on('pointerup', () => {
      console.log(`👆 Button "${text}" pointerup event fired`);
    });
    
    // Also handle pointerover for visual feedback
    container.on('pointerover', () => {
      console.log(`👆 Button "${text}" pointerover - hovering`);
      container.setScale(1.05);
    });
    
    container.on('pointerout', () => {
      console.log(`👆 Button "${text}" pointerout - no longer hovering`);
      container.setScale(1.0);
    });
    
    // Log button creation
    console.log(`✅ Button "${text}" created at (${x}, ${y}), interactive:`, container.input?.enabled);
    
    return container;
  }

  private startNewGame(): void {
    try {
      console.log('🔄 Resetting game state...');
      // Reset all state (synchronous, fast) - do this BEFORE scene transition
      questState.reset();
      gameState.currentIsland = 1;
      gameState.gameStartTime = Date.now();
      gameState.allIslandsComplete = false;
      storage.clear();
      console.log('✅ State reset complete');

      console.log('🆕 Starting new game...');
      // IMMEDIATE scene transition - AvatarCreator preload will be fast (assets already loaded)
      this.scene.start('AvatarCreator');
      console.log('✅ Scene transition initiated');
    } catch (error) {
      console.error('❌ Error in startNewGame:', error);
      throw error;
    }
  }

  private continueGame(): void {
    const savedProgress = storage.load();
    if (!savedProgress) {
      this.startNewGame();
      return;
    }

    // Load saved state
    questState.loadData(savedProgress.questStates);
    gameState.currentIsland = savedProgress.currentIsland;

    console.log('📂 Continuing from Island', savedProgress.currentIsland);

    // Go to current island
    const sceneMap: { [key: number]: string } = {
      1: 'Island1',
      2: 'Island2',
      3: 'Island3',
      4: 'Island4',
      5: 'Island5',
      6: 'StarSanctum'
    };

    const targetScene = sceneMap[savedProgress.currentIsland] || 'Island1';
    this.scene.start(targetScene);
  }

  private showConfirmReset(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Confirmation overlay
    const overlay = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.8).setDepth(100);
    
    const confirmText = this.add.text(cx, cy - 50, 
      'Start a new game?\n\nThis will erase your current progress.',
      {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(101);

    const yesButton = this.add.text(cx - 100, cy + 80, 'Yes, Reset', {
      fontSize: '24px',
      color: '#FF0000',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(101).setInteractive();

    const noButton = this.add.text(cx + 100, cy + 80, 'Cancel', {
      fontSize: '24px',
      color: '#00FF00',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(101).setInteractive();

    yesButton.on('pointerdown', () => {
      console.log('🔘 Yes, Reset button clicked!');
      overlay.destroy();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
      this.startNewGame();
    });

    noButton.on('pointerdown', () => {
      console.log('🔘 Cancel button clicked!');
      overlay.destroy();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
    });
  }
}
