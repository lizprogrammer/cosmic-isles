import * as Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class AvatarCreator extends Phaser.Scene {
  private previewSprite?: Phaser.GameObjects.Container;
  
  // Selection State
  private selectedBody: string = "base-blue";
  private selectedOutfit: string = "outfit-1";
  private selectedAccessory: string = "antenna";

  // UI Elements storage for updates
  private buttons: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super("AvatarCreator");
  }

  preload() {
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
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // Title
    this.add.text(400, 80, "👤 Create Your Star Walker", {
      fontSize: "36px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(400, 130, "This character will accompany you through all 5 islands", {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "Arial, sans-serif"
    }).setOrigin(0.5);

    // Create preview container
    this.previewSprite = this.add.container(400, 280);
    
    // Build initial preview
    this.updatePreview();

    // Customization options
    this.createBodyOptions();
    this.createOutfitOptions();
    this.createAccessoryOptions();

    // Start button
    const startButton = this.add.text(400, 520, "🚀 Begin Adventure", {
      fontSize: "28px",
      color: "#000000",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold",
      backgroundColor: "#FFD700",
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    startButton.on("pointerover", () => {
      startButton.setScale(1.1);
      startButton.setStyle({ backgroundColor: "#FFF" });
    });

    startButton.on("pointerout", () => {
      startButton.setScale(1);
      startButton.setStyle({ backgroundColor: "#FFD700" });
    });

    startButton.on("pointerdown", () => {
      // Save to player state
      playerState.bodyColor = this.selectedBody;
      playerState.outfit = this.selectedOutfit;
      playerState.accessory = this.selectedAccessory;
      
      console.log("✅ Avatar created:", playerState);
      
      this.scene.start("Island1");
    });
  }

  private updatePreview(): void {
    // Clear existing preview completely to prevent stacking
    if (this.previewSprite) {
      this.previewSprite.removeAll(true);
    }

    // Add body (base layer)
    const body = this.add.sprite(0, 0, this.selectedBody);
    body.setScale(2);
    this.previewSprite?.add(body);

    // Add outfit (middle layer)
    const outfit = this.add.sprite(0, 0, this.selectedOutfit);
    outfit.setScale(2);
    this.previewSprite?.add(outfit);

    // Add accessory (top layer)
    const accessory = this.add.sprite(0, 0, this.selectedAccessory);
    accessory.setScale(2);
    this.previewSprite?.add(accessory);

    // Glow effect (behind)
    const glow = this.add.circle(0, 0, 80, 0x9D4EDD, 0.2);
    this.previewSprite?.addAt(glow, 0); 

    // Pulse animation
    this.tweens.add({
      targets: this.previewSprite,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private createBodyOptions(): void {
    this.add.text(120, 360, "Body Color:", {
      fontSize: "18px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    });

    const bodies = [
      { key: "base-blue", label: "Blue", x: 120 },
      { key: "base-green", label: "Green", x: 220 }
    ];

    bodies.forEach((body) => {
      const btn = this.createButton(body.x, 390, body.label, body.key, () => {
        this.selectedBody = body.key;
        this.updatePreview();
        this.updateButtons();
      });
      this.buttons[`body_${body.key}`] = btn;
    });
    this.updateButtons();
  }

  private createOutfitOptions(): void {
    this.add.text(120, 440, "Outfit:", {
      fontSize: "18px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    });

    const outfits = [
      { key: "outfit-1", label: "Classic", x: 120 },
      { key: "outfit-2", label: "Explorer", x: 220 },
      { key: "outfit-3", label: "Cosmic", x: 320 }
    ];

    outfits.forEach((outfit) => {
      const btn = this.createButton(outfit.x, 470, outfit.label, outfit.key, () => {
        this.selectedOutfit = outfit.key;
        this.updatePreview();
        this.updateButtons();
      });
      this.buttons[`outfit_${outfit.key}`] = btn;
    });
    this.updateButtons();
  }

  private createAccessoryOptions(): void {
    this.add.text(480, 360, "Accessory:", {
      fontSize: "18px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    });

    const accessories = [
      { key: "antenna", label: "Antenna", x: 480 },
      { key: "glasses", label: "Glasses", x: 580 },
      { key: "hat", label: "Hat", x: 680 }
    ];

    accessories.forEach((acc) => {
      const btn = this.createButton(acc.x, 390, acc.label, acc.key, () => {
        this.selectedAccessory = acc.key;
        this.updatePreview();
        this.updateButtons();
      });
      this.buttons[`acc_${acc.key}`] = btn;
    });
    this.updateButtons();
  }

  private createButton(x: number, y: number, label: string, key: string, callback: () => void) {
    const btn = this.add.text(x, y, label, {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#333333",
      padding: { x: 15, y: 8 }
    }).setInteractive();

    btn.on("pointerdown", callback);
    return btn;
  }

  private updateButtons(): void {
    // Update visuals based on selection
    for (const key in this.buttons) {
      const btn = this.buttons[key];
      const isSelected = 
        key === `body_${this.selectedBody}` ||
        key === `outfit_${this.selectedOutfit}` ||
        key === `acc_${this.selectedAccessory}`;
      
      btn.setStyle({
        backgroundColor: isSelected ? "#9D4EDD" : "#333333"
      });
    }
  }
}
