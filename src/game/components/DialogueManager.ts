import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../utils/constants';

/**
 * Centralized dialogue/message display system
 */
export class DialogueManager {
  private scene: Phaser.Scene;
  private dialogueText?: Phaser.GameObjects.Text;
  private dialogueBackground?: Phaser.GameObjects.Graphics;
  private currentTimeout?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createDialogueUI();
  }

  private createDialogueUI(): void {
    // Background
    this.dialogueBackground = this.scene.add.graphics();
    this.dialogueBackground.setDepth(2000); // Increased depth
    this.dialogueBackground.setVisible(false);

    // Text
    this.dialogueText = this.scene.add.text(
      this.scene.scale.width / 2,
      50,
      '',
      {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: { x: 20, y: 15 },
        wordWrap: { width: this.scene.scale.width - 100 }
      }
    );
    this.dialogueText.setOrigin(0.5);
    this.dialogueText.setDepth(2001); // Increased depth
    this.dialogueText.setVisible(false);
  }

  /**
   * Show a dialogue message
   */
  show(message: string, duration: number = GAME_CONFIG.DIALOGUE_DURATION): void {
    if (!this.dialogueText || !this.dialogueBackground) return;

    // Update position and wrap width on show
    const width = this.scene.scale.width;
    this.dialogueText.setX(width / 2);
    this.dialogueText.setStyle({ wordWrap: { width: width - 100 } });

    // Clear any existing timeout
    if (this.currentTimeout) {
      this.currentTimeout.remove();
    }

    // Update text
    this.dialogueText.setText(message);
    
    // Update background to fit text
    const bounds = this.dialogueText.getBounds();
    this.dialogueBackground.clear();
    this.dialogueBackground.fillStyle(0x000000, 0.85);
    this.dialogueBackground.fillRoundedRect(
      bounds.x - 15,
      bounds.y - 10,
      bounds.width + 30,
      bounds.height + 20,
      10
    );
    this.dialogueBackground.lineStyle(2, 0xffffff, 0.5);
    this.dialogueBackground.strokeRoundedRect(
      bounds.x - 15,
      bounds.y - 10,
      bounds.width + 30,
      bounds.height + 20,
      10
    );

    // Show
    this.dialogueText.setVisible(true);
    this.dialogueBackground.setVisible(true);

    // Auto-hide after duration
    this.currentTimeout = this.scene.time.delayedCall(duration, () => {
      this.hide();
    });
  }

  /**
   * Hide the dialogue
   */
  hide(): void {
    if (this.dialogueText) this.dialogueText.setVisible(false);
    if (this.dialogueBackground) this.dialogueBackground.setVisible(false);
    
    if (this.currentTimeout) {
      this.currentTimeout.remove();
      this.currentTimeout = undefined;
    }
  }

  /**
   * Show quest objective text (stays on screen)
   */
  showObjective(text: string): void {
    this.show(text, 999999); // Very long duration (effectively permanent)
  }

  /**
   * Show a prominent announcement message
   */
  showAnnouncement(message: string): void {
    if (!this.scene) return;

    // Background overlay (full screen dim)
    const overlay = this.scene.add.rectangle(
      this.scene.scale.width / 2, 
      this.scene.scale.height / 2, 
      this.scene.scale.width, 
      this.scene.scale.height, 
      0x000000, 
      0.7
    ).setDepth(2000).setAlpha(0);

    // Text
    const text = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      message,
      {
        fontSize: '48px',
        color: '#FFD700',
        align: 'center',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        padding: { x: 20, y: 20 },
        wordWrap: { width: this.scene.scale.width - 100 }
      }
    ).setOrigin(0.5).setDepth(2001).setAlpha(0).setScale(0.5);

    // Animation Sequence
    this.scene.tweens.add({
      targets: [overlay, text],
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    this.scene.tweens.add({
      targets: text,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: 'Back.out'
    });

    // Fade out and destroy
    this.scene.time.delayedCall(2500, () => {
      this.scene.tweens.add({
        targets: [overlay, text],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          overlay.destroy();
          text.destroy();
        }
      });
    });
  }

  /**
   * Show a speech bubble near a target
   */
  showSpeechBubble(x: number, y: number, text: string, isPlayer: boolean = false): void {
    const bubbleWidth = 200;
    const bubbleHeight = 80;
    const arrowHeight = 20;
    const bubblePadding = 10;

    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - bubbleHeight - arrowHeight - 20;

    const bubble = this.scene.add.graphics({ x: bubbleX, y: bubbleY });
    
    // Bubble style
    const fillColor = isPlayer ? 0x00aaff : 0xffffff;
    const textColor = isPlayer ? '#ffffff' : '#000000';
    
    bubble.fillStyle(fillColor, 1);
    bubble.lineStyle(2, 0x000000, 1);
    
    // Draw rounded rect
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    
    // Draw arrow
    bubble.beginPath();
    bubble.moveTo(bubbleWidth / 2 - 10, bubbleHeight);
    bubble.lineTo(bubbleWidth / 2, bubbleHeight + arrowHeight);
    bubble.lineTo(bubbleWidth / 2 + 10, bubbleHeight);
    bubble.closePath();
    bubble.fillPath();
    bubble.strokePath();
    
    bubble.setDepth(5000);

    const textObj = this.scene.add.text(bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2, text, {
      fontSize: '16px',
      color: textColor,
      align: 'center',
      fontFamily: 'Arial, sans-serif',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 }
    }).setOrigin(0.5).setDepth(5001);

    // Fade out and destroy
    this.scene.tweens.add({
      targets: [bubble, textObj],
      alpha: 0,
      delay: 3000,
      duration: 500,
      onComplete: () => {
        bubble.destroy();
        textObj.destroy();
      }
    });
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.currentTimeout) {
      this.currentTimeout.remove();
    }
    if (this.dialogueText) {
      this.dialogueText.destroy();
    }
    if (this.dialogueBackground) {
      this.dialogueBackground.destroy();
    }
  }
}
