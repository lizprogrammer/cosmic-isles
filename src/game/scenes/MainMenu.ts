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
    const title = this.add.text(cx, cy - 150, '🌌 COSMIC ISLES 🌌', {
      fontSize: '64px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    const subtitle = this.add.text(cx, cy - 80, 'Journey Through Five Islands to Reforge the Shattered Star', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      wordWrap: { width: this.scale.width * 0.7 }
    }).setOrigin(0.5);

    // Check for saved progress
    const hasSave = storage.hasSave();

    // New Game button
    const newGameButton = this.createButton(cx, cy + 50, '✨ New Game', () => {
      if (hasSave) {
        this.showConfirmReset();
      } else {
        this.startNewGame();
      }
    });

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
      const continueButton = this.createButton(cx, cy + 140, '▶️  Continue', () => {
        this.continueGame();
      });
      
      // Highlight continue button
      continueButton.setStyle({ color: '#00FF00' });
    }

    // Credits
    this.add.text(cx, this.scale.height - 40, 'A Farcaster Mini App • Built with Phaser', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, text, {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 40, y: 20 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => {
      button.setScale(1.1);
      button.setStyle({ color: '#FFFFFF' });
    });

    button.on('pointerout', () => {
      button.setScale(1);
      button.setStyle({ color: '#FFD700' });
    });

    button.on('pointerdown', callback);

    return button;
  }

  private startNewGame(): void {
    // Reset all state
    questState.reset();
    gameState.currentIsland = 1;
    gameState.gameStartTime = Date.now();
    gameState.allIslandsComplete = false;
    storage.clear();

    console.log('🆕 Starting new game...');
    this.scene.start('AvatarCreator');
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
      overlay.destroy();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
      this.startNewGame();
    });

    noButton.on('pointerdown', () => {
      overlay.destroy();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
    });
  }
}
