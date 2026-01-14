import * as Phaser from "phaser";
import { playerState } from "../state/PlayerState";
import { ASSETS, QUEST_DATA } from "../utils/constants";
import { preloadPlayerAvatar } from "../utils/player";

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
    // Skip preload if assets already exist (they should be from MainMenu)
    if (this.textures.exists("base-blue") && 
        this.textures.exists("base-green") && 
        this.textures.exists("outfit-1")) {
      // Assets already loaded, skip preload entirely
      return;
    }
    
    // Fallback: Load assets if they don't exist (for direct scene access)
    this.load.image("splash", "/splash.png");
    this.load.image("base-blue", "/sprites/avatar/base-blue.png");
    this.load.image("base-green", "/sprites/avatar/base-green.png");
    this.load.image("outfit-1", "/sprites/avatar/outfit-1.png");
    this.load.image("outfit-2", "/sprites/avatar/outfit-2.png");
    this.load.image("outfit-3", "/sprites/avatar/outfit-3.png");
    this.load.image("antenna", "/sprites/avatar/antenna.png");
    this.load.image("glasses", "/sprites/avatar/glasses.png");
    this.load.image("hat", "/sprites/avatar/hat.png");
    
    // Preload Island1 assets so "Begin Adventure" transition is instant
    preloadPlayerAvatar(this); // Player avatar (already loaded, but ensure it's there)
    
    // Room backgrounds
    this.load.image(ASSETS.BG_ROOM_A, '/rooms/roomA.png');
    this.load.image(ASSETS.BG_ROOM_B, '/rooms/roomB.png');
    this.load.image(ASSETS.BG_ROOM_C, '/rooms/roomC.png');
    
    // NPCs
    this.load.image(ASSETS.NPC_GUIDEBOT, '/sprites/npc-guidebot.png');
    this.load.image(ASSETS.NPC_VILLAGER, '/sprites/npc-villager.png');
    this.load.image(ASSETS.NPC_SAGE, '/sprites/npc-starsage.png');
    
    // Objects
    this.load.image(ASSETS.PORTAL, '/sprites/portal.png');
    this.load.image(ASSETS.DOOR_LOCKED, '/sprites/door-locked.png');
    this.load.image(ASSETS.DOOR_OPEN, '/sprites/door-open.png');
    this.load.image(ASSETS.BUSHES, '/sprites/bushes.png');
    this.load.image(ASSETS.FLOWERS, '/sprites/flower-pile.png');
    this.load.image(ASSETS.FLOATING_EMBER, '/sprites/floating-ember-core.png');
    
    // Quest objects
    this.load.image(QUEST_DATA[1].room1Object, `/sprites/${QUEST_DATA[1].room1Object}.png`);
    this.load.image(QUEST_DATA[2].room1Object, `/sprites/${QUEST_DATA[2].room1Object}.png`);
    this.load.image(QUEST_DATA[3].room1Object, `/sprites/${QUEST_DATA[3].room1Object}.png`);
  }

  create() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const width = this.scale.width;
    const height = this.scale.height;

    // Background
    this.add.image(cx, cy, 'splash')
      .setDisplaySize(width, height)
      .setAlpha(0.4);
    
    // Dark overlay for readability
    this.add.rectangle(cx, cy, width, height, 0x000000, 0.6);

    // Title
    this.add.text(cx, height * 0.08, "👤 Create Your Star Walker", {
      fontSize: "42px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(cx, height * 0.15, "This character will accompany you through all 5 islands", {
      fontSize: "20px",
      color: "#cccccc",
      fontFamily: "Arial, sans-serif",
      align: 'center',
      wordWrap: { width: width * 0.8 },
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);

    // Create preview container
    this.previewSprite = this.add.container(cx, height * 0.4);
    
    // Build initial preview
    this.updatePreview();

    // Customization options
    this.createBodyOptions();
    this.createOutfitOptions();
    this.createAccessoryOptions();

    // Start button
    console.log('🔧 Creating Begin Adventure button...');
    const startButton = this.createStyledButton(cx, height * 0.9, "Begin Adventure", 0xFFD700, () => {
      console.log('🔘🔘🔘 Begin Adventure button clicked! CALLBACK FIRED!');
      try {
        // Immediate visual feedback
        startButton.setAlpha(0.7);
        startButton.disableInteractive();
        
        // Save to player state
        playerState.bodyColor = this.selectedBody;
        playerState.outfit = this.selectedOutfit;
        playerState.accessory = this.selectedAccessory;
        
        console.log("✅ Avatar created:", playerState);
        
        // IMMEDIATE transition - Island1 preload will be fast (assets already loaded)
        this.scene.start("Island1");
        console.log('✅ Transitioned to Island1');
      } catch (error) {
        console.error('❌ Error in Begin Adventure:', error);
        startButton.setAlpha(1);
        startButton.setInteractive();
      }
    });
    console.log('✅ Begin Adventure button created, interactive:', startButton.input?.enabled);
    
    // Add glow/pulse to button
    this.tweens.add({
        targets: startButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
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
    
    // Interactive - Use simpler approach for better reliability
    container.setSize(width, height);
    container.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true
    });
    
    // Immediate response with detailed logging
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log(`👆👆👆 Button "${text}" pointerdown event fired!`, {
        x: pointer.x,
        y: pointer.y,
        worldX: pointer.worldX,
        worldY: pointer.worldY
      });
      console.log(`🔘🔘🔘 Button "${text}" callback executing...`);
      callback();
    });
    
    container.on('pointerup', () => {
      console.log(`👆 Button "${text}" pointerup event fired`);
    });
    
    container.on('pointerover', () => {
      console.log(`👆 Button "${text}" pointerover - hovering`);
    });
    
    container.on('pointerout', () => {
      console.log(`👆 Button "${text}" pointerout - no longer hovering`);
    });
    
    // Log button creation
    console.log(`✅ Button "${text}" created at (${x}, ${y}), interactive:`, container.input?.enabled);
    
    container.on('pointerover', () => {
      container.setScale(1.05);
    });
    
    container.on('pointerout', () => {
      container.setScale(1.0);
    });
    
    return container;
  }

  private updatePreview(): void {
    // Clear existing preview completely to prevent stacking
    if (this.previewSprite) {
      this.previewSprite.removeAll(true);
    }

    // Simply add all layers to the container - they will composite visually
    // Body (base layer) - MUST be visible
    const body = this.add.sprite(0, 0, this.selectedBody);
    body.setScale(0.8);
    body.setOrigin(0.5, 0.5);
    body.setVisible(true); // Ensure it's visible
    this.previewSprite?.add(body);

    // Outfit (middle layer) - overlays body
    const outfit = this.add.sprite(0, 0, this.selectedOutfit);
    outfit.setScale(0.8);
    outfit.setOrigin(0.5, 0.5);
    outfit.setVisible(true); // Ensure it's visible
    this.previewSprite?.add(outfit);

    // Accessory (top layer) - MUST be visible
    const accessory = this.add.sprite(0, 0, this.selectedAccessory);
    accessory.setScale(0.8);
    accessory.setOrigin(0.5, 0.5);
    accessory.setVisible(true); // Ensure it's visible
    this.previewSprite?.add(accessory);

    // Glow effect (behind everything)
    const glow = this.add.circle(0, 0, 60, 0x9D4EDD, 0.2);
    this.previewSprite?.addAt(glow, 0); 

    // Pulse animation on the entire container (all layers move together)
    this.tweens.add({
      targets: this.previewSprite,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    
    // Debug: Log what we're showing
    console.log('👤 Avatar preview:', {
      body: this.selectedBody,
      outfit: this.selectedOutfit,
      accessory: this.selectedAccessory,
      bodyVisible: body.visible,
      outfitVisible: outfit.visible,
      accessoryVisible: accessory.visible
    });
  }

  private createBodyOptions(): void {
    const cx = this.scale.width / 2;
    const y = this.scale.height * 0.6;
    
    this.add.text(cx - 100, y, "Body Color:", {
      fontSize: "18px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    }).setOrigin(1, 0.5);

    const bodies = [
      { key: "base-blue", label: "Blue" },
      { key: "base-green", label: "Green" }
    ];

    let startX = cx - 80;
    bodies.forEach((body, index) => {
      const btn = this.createButton(startX + index * 80, y, body.label, body.key, () => {
        console.log(`🔘 Body selection button clicked: ${body.key} (${body.label})`);
        this.selectedBody = body.key;
        this.updatePreview();
        this.updateButtons();
      });
      this.buttons[`body_${body.key}`] = btn;
    });
    this.updateButtons();
  }

  private createOutfitOptions(): void {
    const cx = this.scale.width / 2;
    const y = this.scale.height * 0.68;

    this.add.text(cx - 100, y, "Outfit:", {
      fontSize: "18px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    }).setOrigin(1, 0.5);

    const outfits = [
      { key: "outfit-1", label: "Classic" },
      { key: "outfit-2", label: "Explorer" },
      { key: "outfit-3", label: "Cosmic" }
    ];

    let startX = cx - 80;
    outfits.forEach((outfit, index) => {
      const btn = this.createButton(startX + index * 100, y, outfit.label, outfit.key, () => {
        console.log(`🔘 Outfit selection button clicked: ${outfit.key} (${outfit.label})`);
        this.selectedOutfit = outfit.key;
        this.updatePreview();
        this.updateButtons();
      });
      this.buttons[`outfit_${outfit.key}`] = btn;
    });
    this.updateButtons();
  }

  private createAccessoryOptions(): void {
    const cx = this.scale.width / 2;
    const y = this.scale.height * 0.76;

    this.add.text(cx - 100, y, "Accessory:", {
      fontSize: "18px",
      color: "#FFD700",
      fontFamily: "Arial, sans-serif",
      fontStyle: "bold"
    }).setOrigin(1, 0.5);

    const accessories = [
      { key: "antenna", label: "Antenna" },
      { key: "glasses", label: "Glasses" },
      { key: "hat", label: "Hat" }
    ];

    let startX = cx - 80;
    accessories.forEach((acc, index) => {
      const btn = this.createButton(startX + index * 100, y, acc.label, acc.key, () => {
        console.log(`🔘 Accessory selection button clicked: ${acc.key} (${acc.label})`);
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