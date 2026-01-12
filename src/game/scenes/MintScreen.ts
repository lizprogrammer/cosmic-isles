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

  create() {
    console.log('🎨 Mint Screen - Preparing NFT...');
    
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(cx, cy, width, height, 0x0a0a1a, 1).setDepth(0);

    // Title
    this.add.text(cx, height * 0.1, '🌌 COSMIC ISLES ACHIEVEMENT 🌌', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(10);

    // NFT Preview Card
    this.createNFTPreview(cx, cy);

    // Mint button
    this.createMintButton(cx, height * 0.85);

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

  private createNFTPreview(cx: number, cy: number): void {
    // Card background
    const card = this.add.graphics();
    card.fillStyle(0x1a1a2e, 1);
    card.fillRoundedRect(cx - 200, cy - 200, 400, 400, 15);
    card.lineStyle(3, 0xFFD700, 1);
    card.strokeRoundedRect(cx - 200, cy - 200, 400, 400, 15);
    card.setDepth(5);

    // NFT Image placeholder (reformed star)
    const starGraphic = this.add.graphics();
    starGraphic.fillStyle(0xFFD700, 1);
    starGraphic.fillCircle(cx, cy - 80, 60);
    starGraphic.lineStyle(2, 0xffffff, 1);
    starGraphic.strokeCircle(cx, cy - 80, 60);
    starGraphic.setDepth(6);

    // Glow animation
    this.tweens.add({
      targets: starGraphic,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // NFT Metadata
    const badges = questState.getEarnedBadges();
    const playTime = getTotalPlayTime();
    const speed = gameState.completionSpeed || 'normal';

    const metadata = [
      'STAR REFORGED',
      '',
      `Islands Completed: 3/3`,
      `Badges: ${badges.join(', ')}`,
      `Completion Time: ${playTime} min`,
      `Speed: ${speed}`,
      '',
      `Player: ${playerState.playerName || 'Star Walker'}`
    ];

    this.add.text(cx, cy + 40, metadata.join('\n'), {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5).setDepth(6);
  }

  private createMintButton(cx: number, y: number): void {
    const button = this.add.graphics();
    button.fillStyle(0xFFD700, 1);
    button.fillRoundedRect(cx - 150, y - 30, 300, 60, 10);
    button.setDepth(10);
    button.setInteractive(
      new Phaser.Geom.Rectangle(cx - 150, y - 30, 300, 60),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add.text(cx, y, '🎨 MINT NFT', {
      fontSize: '28px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // Hover effect
    button.on('pointerover', () => {
      button.clear();
      button.fillStyle(0xFFFFFF, 1);
      button.fillRoundedRect(cx - 150, y - 30, 300, 60, 10);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillStyle(0xFFD700, 1);
      button.fillRoundedRect(cx - 150, y - 30, 300, 60, 10);
    });

    button.on('pointerdown', () => {
      this.mintNFT();
    });
  }

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
