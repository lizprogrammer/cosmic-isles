import * as Phaser from 'phaser';
import { questState } from '../state/QuestState';
import { gameState, getTotalPlayTime } from '../state/GameState';
import { playerState } from '../state/PlayerState';

import { connectWallet, switchToBase, sendMintTransaction } from '../../utils/web3';

/**
 * Mint Screen - Final scene showing NFT preview and mint button
 */
export default class MintScreen extends Phaser.Scene {
  private mintTxHash: string | null = null; // Store transaction hash for cast

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
    console.log('🎨 ========== NFT MINT DEBUG START ==========');
    console.log('🎨 Step 1: Initiating NFT mint process...');

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
      console.log('🎨 Step 2: Connecting to wallet...');
      const address = await connectWallet();
      console.log('🎨 Wallet address:', address);
      
      if (!address) { 
        console.error('❌ Step 2 FAILED: No wallet address returned');
        loadingText.setText('Wallet connection cancelled.');
        this.time.delayedCall(1500, () => {
            loadingOverlay.destroy();
            loadingText.destroy();
        });
        return; 
      }
      console.log('✅ Step 2 SUCCESS: Wallet connected');

      // 3. Switch to Base Chain
      console.log('🎨 Step 3: Switching to Base network...');
      loadingText.setText('Switching to Base...');
      const switched = await switchToBase(); 
      console.log('🎨 Network switch result:', switched);
      
      if (!switched) {
        console.error('❌ Step 3 FAILED: Could not switch to Base network');
        loadingText.setText('Network switch failed.');
        this.time.delayedCall(1500, () => {
            loadingOverlay.destroy();
            loadingText.destroy();
        });
        return;
      }
      console.log('✅ Step 3 SUCCESS: On Base network');

      // 4. Send Transaction
      console.log('🎨 Step 4: Preparing mint transaction...');
      loadingText.setText('Please confirm transaction in wallet...');
      
      // Get contract address from environment or use a placeholder/warning
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; 
      console.log('🎨 Contract Address:', CONTRACT_ADDRESS);
      
      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
          console.error("❌ CRITICAL: No NFT contract address configured!");
          console.error("   Set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in .env.local");
          loadingText.setText('NFT Contract not configured!\nCheck console for details.');
          this.time.delayedCall(3000, () => {
              loadingOverlay.destroy();
              loadingText.destroy();
          });
          return;
      }

      const PRICE_ETH = "0.0001"; // Small charge as requested
      console.log('🎨 Mint Price:', PRICE_ETH, 'ETH');
      console.log('🎨 Sending transaction to contract...');

      const hash = await sendMintTransaction(CONTRACT_ADDRESS, PRICE_ETH, address);
      console.log('🎨 Transaction hash:', hash);

      if (hash) {
        this.mintTxHash = hash; // Store for cast
        console.log('✅ Step 4 SUCCESS: Transaction sent');
        console.log('🎨 Transaction Hash:', hash);
        console.log('🎨 View on BaseScan:', `https://basescan.org/tx/${hash}`);
        
        loadingText.setText('Transaction Sent!\nMinting...');
        
        // 5. Optional: Notify backend
        const metadata = {
            playerName: playerState.playerName || 'Star Walker',
            badges: questState.getEarnedBadges(),
            completionTime: getTotalPlayTime(),
            txHash: hash,
            wallet: address
        };
        
        console.log('🎨 Step 5: Notifying backend with metadata:', metadata);
        
        // Fire and forget backend notification
        fetch('/api/mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        }).then(res => {
          console.log('✅ Backend notification sent, status:', res.status);
        }).catch(err => {
          console.error('❌ Backend notification failed:', err);
        });

        // Verify contract and metadata
        console.log('🎨 Step 6: Verifying NFT setup...');
        this.verifyNFTSetup(CONTRACT_ADDRESS, hash, address);

        this.time.delayedCall(2000, () => {
             loadingOverlay.destroy();
             loadingText.destroy();
             this.showShareOptions(hash, CONTRACT_ADDRESS);
        });

      } else {
         console.error('❌ Step 4 FAILED: Transaction hash is null');
         throw new Error("Transaction rejected or failed");
      }

    } catch (error) {
      console.error('❌ ========== NFT MINT DEBUG END (ERROR) ==========');
      console.error('❌ Mint error details:', error);
      loadingText.setText('Mint failed. Please try again.');
      
      this.time.delayedCall(2000, () => {
        loadingOverlay.destroy();
        loadingText.destroy();
      });
    }
  }

  private async verifyNFTSetup(contractAddress: string, txHash: string, walletAddress: string): Promise<void> {
    console.log('🔍 ========== NFT VERIFICATION ==========');
    console.log('🔍 Contract:', contractAddress);
    console.log('🔍 Transaction:', txHash);
    console.log('🔍 Wallet:', walletAddress);
    
    // Check metadata endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const metadataUrl = `${baseUrl}/api/nft/1`;
    console.log('🔍 Testing metadata endpoint:', metadataUrl);
    
    try {
      const response = await fetch(metadataUrl);
      if (response.ok) {
        const metadata = await response.json();
        console.log('✅ Metadata endpoint working:', metadata);
        console.log('🔍 Image URL:', metadata.image);
        
        // Test image accessibility
        if (metadata.image) {
          try {
            const imgResponse = await fetch(metadata.image, { method: 'HEAD' });
            console.log('✅ Image accessible:', imgResponse.ok ? 'YES' : 'NO');
          } catch (e) {
            console.error('❌ Image not accessible:', e);
          }
        }
      } else {
        console.error('❌ Metadata endpoint failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Metadata endpoint error:', error);
    }
    
    console.log('🔍 ========== VERIFICATION COMPLETE ==========');
  }

  private showShareOptions(txHash?: string, contractAddress?: string): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    const cy = height / 2;

    // Overlay background
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.9).setDepth(300);

    const shareTitle = this.add.text(cx, cy - 120, 
      '🎉 STAR REFORGED! 🎉',
      {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(301);

    // NFT Availability Message
    const nftMessage = this.add.text(cx, cy - 60, 
      '✨ Your NFT is being minted!\n\nIt will appear in your Farcaster\nCollectables section soon.\n\nView on BaseScan to verify.',
      {
        fontSize: '16px',
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        wordWrap: { width: width * 0.8 }
      }
    ).setOrigin(0.5).setDepth(301);

    // Transaction hash display (if available)
    if (txHash) {
      const txText = this.add.text(cx, cy + 20, 
        `Tx: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`,
        {
          fontSize: '12px',
          color: '#888888',
          fontFamily: 'Arial, sans-serif',
        }
      ).setOrigin(0.5).setDepth(301).setInteractive();
      
      txText.on('pointerdown', () => {
        window.open(`https://basescan.org/tx/${txHash}`, '_blank');
      });
      
      txText.on('pointerover', () => txText.setColor('#FFD700'));
      txText.on('pointerout', () => txText.setColor('#888888'));
    }

    // Share Button
    const shareButton = this.createStyledButton(cx, cy + 80, 'Cast Achievement', 0x9D4EDD, () => {
        console.log('🔘 Cast Achievement button clicked!');
        this.createFarcasterCast();
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

  private createFarcasterCast(): void {
    const badges = questState.getEarnedBadges();
    const playTime = getTotalPlayTime();
    const playerName = playerState.playerName || 'Star Walker';
    
    // Build achievement message
    const badgeList = badges.length > 0 
      ? badges.map((badge, idx) => `${idx + 1}. ${badge}`).join('\n')
      : 'Star Reforged';
    
    // Create comprehensive cast message
    let castText = `🌟 STAR REFORGED! 🌟\n\n`;
    castText += `Quest Complete: 3/3 Islands\n`;
    castText += `Badges Earned:\n${badgeList}\n\n`;
    
    if (this.mintTxHash) {
      castText += `✅ NFT Minted!\n`;
      castText += `Tx: ${this.mintTxHash.substring(0, 10)}...${this.mintTxHash.substring(this.mintTxHash.length - 8)}\n\n`;
    }
    
    castText += `Time: ${playTime} min\n`;
    castText += `Player: ${playerName}\n\n`;
    castText += `Play Cosmic Isles:`;
    
    // Game URL - use the actual Farcaster mini-app URL
    const gameUrl = "https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles";
    
    // Try to use Farcaster SDK to create cast directly
    this.tryCreateCastWithSDK(castText, gameUrl).catch(() => {
      // Fallback to Warpcast compose URL
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(gameUrl)}`;
      console.log('   Opening Farcaster share URL (fallback)...');
      window.open(shareUrl, '_blank');
    });
  }

  private async tryCreateCastWithSDK(text: string, url: string): Promise<void> {
    try {
      const { default: sdk } = await import("@farcaster/miniapp-sdk");
      
      // Check if SDK has cast creation method
      if (sdk.actions && typeof (sdk.actions as any).openUrl === 'function') {
        // Use SDK to open compose URL
        const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
        await (sdk.actions as any).openUrl(composeUrl);
        console.log('✅ Cast opened via Farcaster SDK');
        return;
      }
      
      // If SDK doesn't support it, throw to use fallback
      throw new Error('SDK cast method not available');
    } catch (error) {
      console.log('⚠️ Farcaster SDK cast method not available, using fallback');
      throw error;
    }
  }
}
