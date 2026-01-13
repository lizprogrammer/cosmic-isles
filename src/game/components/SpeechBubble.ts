import * as Phaser from 'phaser';

export class SpeechBubble extends Phaser.GameObjects.Container {
  private bubbleGraphics: Phaser.GameObjects.Graphics;
  private textObject: Phaser.GameObjects.Text;
  public targetActor?: Phaser.GameObjects.GameObject; // Public to check ownership
  
  // Public accessor for text
  public get text(): string {
    return this.textObject.text;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, targetActor?: Phaser.GameObjects.GameObject) {
    super(scene, x, y);
    this.targetActor = targetActor;
    
    this.bubbleGraphics = scene.add.graphics();
    this.textObject = scene.add.text(0, 0, text, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 240 }
    }).setOrigin(0.5);

    this.add(this.bubbleGraphics);
    this.add(this.textObject);
    
    this.drawBubble();
    scene.add.existing(this);
    this.setDepth(5000); // Top layer

    // Clamp position to screen bounds
    const bounds = this.textObject.getBounds();
    const w = bounds.width + 40; // Approx width with padding
    const h = bounds.height + 40;
    
    const margin = 20;
    const minX = w / 2 + margin;
    const maxX = scene.scale.width - w / 2 - margin;
    const minY = h / 2 + margin;
    const maxY = scene.scale.height - h / 2 - margin;

    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
    this.y = Phaser.Math.Clamp(this.y, minY, maxY);

    // Pop in animation
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.out'
    });

    // Auto-fade after a few seconds
    this.fadeOut(500, 4000);

    // Optional: Follow target
    if (targetActor) {
      // Logic to follow would go in update, but for now fixed position is okay or handled by scene
    }
  }

  private drawBubble(): void {
    const bounds = this.textObject.getBounds();
    const padding = 20;
    const w = bounds.width + padding * 2;
    const h = bounds.height + padding * 2;
    const arrowHeight = 15;

    this.bubbleGraphics.clear();
    
    // Shadow
    this.bubbleGraphics.fillStyle(0x000000, 0.3);
    this.bubbleGraphics.fillRoundedRect(-w/2 + 2, -h/2 + 2 - arrowHeight, w, h, 8);

    // Main Bubble
    this.bubbleGraphics.fillStyle(0xffffff, 1);
    this.bubbleGraphics.lineStyle(2, 0x000000, 1);
    this.bubbleGraphics.fillRoundedRect(-w/2, -h/2 - arrowHeight, w, h, 8);
    this.bubbleGraphics.strokeRoundedRect(-w/2, -h/2 - arrowHeight, w, h, 8);

    // Arrow (pointing down)
    this.bubbleGraphics.beginPath();
    this.bubbleGraphics.moveTo(-10, h/2 - arrowHeight - 2); // Left base
    this.bubbleGraphics.lineTo(0, h/2 + 5);                 // Tip
    this.bubbleGraphics.lineTo(10, h/2 - arrowHeight - 2);  // Right base
    this.bubbleGraphics.closePath();
    this.bubbleGraphics.fillPath();
    this.bubbleGraphics.strokePath();

    // Fix stroke overlap
    this.bubbleGraphics.lineStyle(0, 0, 0); // Removed stroke
    this.bubbleGraphics.fillStyle(0xffffff, 1);
    this.bubbleGraphics.beginPath();
    this.bubbleGraphics.moveTo(-8, h/2 - arrowHeight - 3);
    this.bubbleGraphics.lineTo(8, h/2 - arrowHeight - 3);
    this.bubbleGraphics.lineTo(0, h/2 + 2);
    this.bubbleGraphics.closePath();
    this.bubbleGraphics.fillPath();

    // Re-center text
    this.textObject.y = -arrowHeight;
  }

  public fadeOut(duration: number = 500, delay: number = 2000): void {
    if (!this.scene) return;

    this.scene.time.delayedCall(delay, () => {
      if (!this.scene || !this.scene.tweens) return; // Safety check
      
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: duration,
        onComplete: () => this.destroy()
      });
    });
  }
}
