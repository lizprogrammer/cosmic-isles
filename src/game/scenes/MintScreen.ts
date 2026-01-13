import * as Phaser from 'phaser';
import { questState } from '../state/QuestState';
import { gameState, getTotalPlayTime } from '../state/GameState';
import { playerState } from '../state/PlayerState';

/**
 * Mint Screen - Final scene showing NFT preview and mint button
 */
export default class MintScreen extends Phaser.Scene {
  constructor() {
    super('MintScreen');
  }

  preload() {
    this.load.image('reformed-star', '/sprites/star-fragment.png');
  }

  create() {
    console.log('🎨 Mint Screen - Preparing NFT...');
    
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(cx, cy, width, height, 0x0a0a1a, 1).setDepth(0);

    // Title
    const titleFontSize = Math.min(32, width * 0.08);
    this.add.text(cx, height * 0.1, 'COSMIC ACHIEVEMENT', {
      fontSize: `${titleFontSize}px`,
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);

    // NFT Preview Card
    this.createNFTPreview(cx, cy);

    // Mint button
    const mintButton = this.createStyledButton(cx, height * 0.85, 'MINT NFT', 0xFFD700, () => {
      this.mintNFT();
    });

    // Pulse animation for Mint button
    this.tweens.add({
      targets: mintButton,
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut'
    });

    // Back button
    const backButton = this.add.text(50, height - 50, '← Back to Sanctum', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif'
    }).setInteractive().setDepth(10);

    backButton.on('pointerdown', () => {
      this.scene.start('StarSanctum');
    });

    backButton.on('pointerover', () => {
      backButton.setColor('#ffffff');
    });

    backButton.on('pointerout', () => {
      backButton.setColor('#aaaaaa');
    });
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
    
    // Interactive
    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains);
    
    container.on('pointerdown', callback);
    
    return container;
  }

  private createNFTPreview(cx: number, cy: number): void {
    // Card background
    const cardWidth = 400;
    const cardHeight = 450;
    const card = this.add.graphics();
    card.fillStyle(0x1a1a2e, 1);
    card.fillRoundedRect(cx - cardWidth/2, cy - cardHeight/2, cardWidth, cardHeight, 15);
    card.lineStyle(3, 0xFFD700, 1);
    card.strokeRoundedRect(cx - cardWidth/2, cy - cardHeight/2, cardWidth, cardHeight, 15);
    card.setDepth(5);

    // NFT Image (Reformed Star)
    // Position it in the upper half of the card
    const imageY = cy - 80;
    const starSprite = this.add.sprite(cx, imageY, 'reformed-star');
    starSprite.setScale(0.8);
    starSprite.setDepth(6);

    // Glow animation
    this.tweens.add({
      targets: starSprite,
      alpha: 0.9,
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Metadata Text
    const badges = questState.getEarnedBadges();
    const playTime = getTotalPlayTime();
    const speed = gameState.completionSpeed || 'normal';

    // Title inside card
    this.add.text(cx, imageY + 80, 'STAR REFORGED', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);

    // Stats block with word wrap for badges
    const textStyle = {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      wordWrap: { width: 360 },
      lineSpacing: 10
    };

    const statsText = [
      `Islands Completed: 3/3`,
      `Badges: ${badges.length}/3`, // Was showing length/5 but user removed quests 4/5
      `Time: ${playTime} min`,
      `Player: ${playerState.playerName || 'Star Walker'}`
    ].join('\n');

    this.add.text(cx, imageY + 140, statsText, textStyle).setOrigin(0.5, 0).setDepth(6);
  }

  // Helper method removed as it was replaced by createStyledButton usage directly in create
  private dummy() {} // Placeholder to ensure replacement block is clean

  private async mintNFT(): Promise<void> {
    console.log('🎨 Initiating NFT mint...');

    const width = this.scale.width;
    const height = this.scale.height;
    
    // Show loading state
    const loadingText = this.add.text(width / 2, height / 2, 'Minting your achievement...', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(100);

    try {
      // Prepare NFT metadata
      const metadata = {
        playerName: playerState.playerName || 'Star Walker',
        avatar: {
          bodyColor: playerState.bodyColor,
          outfit: playerState.outfit,
          accessory: playerState.accessory
        },
        badges: questState.getEarnedBadges(),
        completionTime: getTotalPlayTime(),
        completionSpeed: gameState.completionSpeed,
        timestamp: Date.now(),
        allQuestsComplete: questState.areAllIslandsComplete()
      };

      // Call mint API
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ NFT minted successfully:', result);
        
        loadingText.setText('✅ NFT Minted Successfully!');
        
        this.time.delayedCall(2000, () => {
          loadingText.setText('Thank you for playing Cosmic Isles! 🌌');
        });

        // Could redirect to NFT viewer or collection page
        this.time.delayedCall(4000, () => {
          // For Farcaster, might want to close or show share options
          this.showShareOptions();
        });
      } else {
        throw new Error('Mint failed');
      }
    } catch (error) {
      console.error('❌ Mint error:', error);
      loadingText.setText('❌ Mint failed. Please try again.');
      
      this.time.delayedCall(2000, () => {
        loadingText.destroy();
      });
    }
  }

  private showShareOptions(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;

    const shareText = this.add.text(cx, height / 2, 
      '🎉 Share your achievement!\n\n' +
      'I completed all 3 Cosmic Isles and\n' +
      'reforged the Shattered Star! 🌟',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 30, y: 20 }
      }
    ).setOrigin(0.5).setDepth(100);

    const playAgainButton = this.add.text(cx, height * 0.75, '🔄 Play Again', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(100).setInteractive();

    playAgainButton.on('pointerdown', () => {
      // Reset game state
      questState.reset();
      this.scene.start('Boot');
    });
  }
}
