import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../utils/constants';

/**
 * Tutorial overlay with clear step-by-step instructions
 */
export class TutorialOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private instructionText: Phaser.GameObjects.Text;
  private continueButton: Phaser.GameObjects.Text;
  private stepIndicator: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2).setDepth(5000);
    
    // Semi-transparent background
    this.background = scene.add.rectangle(0, 0, 700, 400, 0x000000, 0.9);
    this.background.setStrokeStyle(4, 0xFFD700);
    
    // Title
    this.titleText = scene.add.text(0, -150, '', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // Instructions
    this.instructionText = scene.add.text(0, -50, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);
    
    // Step indicator
    this.stepIndicator = scene.add.text(0, 80, '', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
      align: 'center'
    }).setOrigin(0.5);
    
    // Continue button
    this.continueButton = scene.add.text(0, 140, '✓ Got It!', {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      backgroundColor: '#FFD700',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();
    
    this.continueButton.on('pointerover', () => {
      this.continueButton.setScale(1.1);
    });
    
    this.continueButton.on('pointerout', () => {
      this.continueButton.setScale(1);
    });
    
    this.container.add([
      this.background,
      this.titleText,
      this.instructionText,
      this.stepIndicator,
      this.continueButton
    ]);
    
    this.container.setVisible(false);
  }

  /**
   * Show tutorial with specific instructions
   */
  show(
    title: string,
    instructions: string[],
    currentStep: number = 1,
    totalSteps: number = 1,
    onContinue?: () => void
  ): void {
    this.titleText.setText(title);
    
    // Format instructions with bullet points
    const formattedInstructions = instructions.map((text, index) => 
      `${index + 1}. ${text}`
    ).join('\n\n');
    
    this.instructionText.setText(formattedInstructions);
    this.stepIndicator.setText(`Step ${currentStep} of ${totalSteps}`);
    
    // Remove previous listeners
    this.continueButton.removeAllListeners('pointerdown');
    
    // Add new listener
    this.continueButton.on('pointerdown', () => {
      this.hide();
      if (onContinue) onContinue();
    });
    
    this.container.setVisible(true);
    
    // Animate in
    this.container.setAlpha(0);
    this.container.setScale(0.8);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Hide tutorial
   */
  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
      }
    });
  }

  /**
   * Check if tutorial is currently showing
   */
  isVisible(): boolean {
    return this.container.visible;
  }

  destroy(): void {
    this.container.destroy();
  }
}

/**
 * Permanent instruction panel at top of screen
 */
export class InstructionPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private objectiveText: Phaser.GameObjects.Text;
  private controlsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(GAME_CONFIG.WIDTH / 2, 60).setDepth(5000);
    
    // Background panel
    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRoundedRect(-380, -50, 760, 100, 10);
    this.background.lineStyle(2, 0xFFD700, 1);
    this.background.strokeRoundedRect(-380, -50, 760, 100, 10);
    
    // Title
    this.titleText = scene.add.text(-370, -40, '', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    });
    
    // Objective
    this.objectiveText = scene.add.text(-370, -15, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Controls
    this.controlsText = scene.add.text(-370, 10, '', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif'
    });
    
    this.container.add([
      this.background,
      this.titleText,
      this.objectiveText,
      this.controlsText
    ]);
  }

  /**
   * Update instruction panel
   */
  update(title: string, objective: string, controls: string): void {
    this.titleText.setText(`🎯 ${title}`);
    this.objectiveText.setText(`Objective: ${objective}`);
    this.controlsText.setText(`Controls: ${controls}`);
  }

  /**
   * Hide panel
   */
  hide(): void {
    this.container.setVisible(false);
  }

  /**
   * Show panel
   */
  show(): void {
    this.container.setVisible(true);
  }

  destroy(): void {
    this.container.destroy();
  }
}
