import * as Phaser from 'phaser';
import { questState } from '../state/QuestState';
import { gameState, getTotalPlayTime } from '../state/GameState';
import { playerState } from '../state/PlayerState';

import { connectWallet, switchToBase, sendMintTransaction } from '../../utils/web3';

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
    // Ensure button is at a very high depth to be visible over potential overlays
    const mintButton = this.createStyledButton(cx, height * 0.85, 'MINT NFT', 0xFFD700, () => {
      this.mintNFT();
    });
    mintButton.setDepth(200); // Higher than share overlay (100)

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
      console.log('🔘 Back to Sanctum button clicked!');
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
    
    container.on('pointerdown', () => {
      console.log(`🔘 Button clicked: ${text}`);
      callback();
    });
    
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
    starSprite.setScale(0.35); // Reduced scale (was 0.8) to fit better inside the card
    starSprite.setDepth(6);

    // Glow animation
    this.tweens.add({
      targets: starSprite,
      scaleX: 0.4,
      scaleY: 0.4,
      alpha: 0.9,
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

  private async mintNFT(): Promise<void> {
    console.log('🎨 Initiating NFT mint...');

    // 1. UI Feedback IMMEDIATE
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Create loading overlay
    const loadingOverlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8).setDepth(250);
    const loadingText = this.add.text(width / 2, height / 2, 'Connecting Wallet...', {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5).setDepth(251);

    try {
      // 2. Connect Wallet
      const address = await connectWallet();
      if (!address) { 
        loadingText.setText('Wallet connection cancelled.');
        this.time.delayedCall(1500, () => {
            loadingOverlay.destroy();
            loadingText.destroy();
        });
        return; 
      }

      // 3. Switch to Base Chain
      loadingText.setText('Switching to Base...');
      const switched = await switchToBase(); 
      if (!switched) {
        loadingText.setText('Network switch failed.');
        this.time.delayedCall(1500, () => {
            loadingOverlay.destroy();
            loadingText.destroy();
        });
        return;
      }

      // 4. Send Transaction
      loadingText.setText('Please confirm transaction in wallet...');
      // Get contract address from environment or use a placeholder/warning
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; 
      
      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
          console.warn("⚠️ No NFT contract address configured! Using zero address (will likely fail or burn funds).");
      }

      const PRICE_ETH = "0.0001"; // Small charge as requested

      const hash = await sendMintTransaction(CONTRACT_ADDRESS, PRICE_ETH, address);

      if (hash) {
        loadingText.setText('Transaction Sent!\nMinting...');
        
        // 5. Optional: Notify backend
        const metadata = {
            playerName: playerState.playerName || 'Star Walker',
            badges: questState.getEarnedBadges(),
            completionTime: getTotalPlayTime(),
            txHash: hash,
            wallet: address
        };
        
        // Fire and forget backend notification
        fetch('/api/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        }).catch(err => console.error(err));

        this.time.delayedCall(2000, () => {
             loadingOverlay.destroy();
             loadingText.destroy();
             this.showShareOptions();
        });

      } else {
         throw new Error("Transaction rejected or failed");
      }

    } catch (error) {
      console.error('❌ Mint error:', error);
      loadingText.setText('Mint failed. Please try again.');
      
      this.time.delayedCall(2000, () => {
        loadingOverlay.destroy();
        loadingText.destroy();
      });
    }
  }

  private showShareOptions(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    const cy = height / 2;

    // Overlay background
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.9).setDepth(300);

    const shareTitle = this.add.text(cx, cy - 80, 
      '🎉 STAR REFORGED! 🎉',
      {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(301);

    // Share Button
    const shareButton = this.createStyledButton(cx, cy, 'Cast Achievement', 0x9D4EDD, () => {
        console.log('🔘 Cast Achievement button clicked!');
        const text = "I just reforged the Shattered Star in Cosmic Isles! 🌟\n\nPlay now:";
        const url = "https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles";
        const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
        
        console.log('   Opening Farcaster share URL...');
        window.open(shareUrl, '_blank');
    });
    shareButton.setDepth(301);

    // Play Again Button
    const playAgainButton = this.add.text(cx, cy + 80, '🔄 Play Again', {
      fontSize: '24px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(301).setInteractive();

    playAgainButton.on('pointerdown', () => {
      console.log('🔘 Play Again button clicked!');
      // Reset game state
      questState.reset();
      this.scene.start('Boot');
    });
    
    playAgainButton.on('pointerover', () => playAgainButton.setColor('#ffffff'));
    playAgainButton.on('pointerout', () => playAgainButton.setColor('#aaaaaa'));
  }
}
