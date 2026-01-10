import * as Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class RoomA extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private guidebot?: Phaser.GameObjects.Sprite;
  private hasSpokenToGuide: boolean = false;
  private dialogText?: Phaser.GameObjects.Text;

  constructor() { 
    super("RoomA"); 
  }

  preload() {
    this.load.image("roomA", "/rooms/roomA.png");
    this.load.image("stone", "/sprites/glowing-stone.png");
    this.load.image("guidebot", "/sprites/npc-guidebot.png");
  }

  create() {
    // Background
    this.add.image(400, 300, "roomA");

    // Create player character (using avatar from character creator)
    this.player = this.add.sprite(100, 500, "guidebot") // Replace with player sprite
      .setScale(0.8);

    // Guidebot NPC
    this.guidebot = this.add.sprite(150, 300, "guidebot")
      .setInteractive()
      .setScale(1);

    // Glowing stone (collectible)
    const stone = this.add.sprite(600, 320, "stone")
      .setInteractive()
      .setScale(0.5);

    // Add glow effect to stone
    this.tweens.add({
      targets: stone,
      alpha: 0.6,
      scale: 0.55,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Dialog text box
    this.dialogText = this.add.text(400, 50, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 10 },
      align: "center"
    }).setOrigin(0.5).setVisible(false);

    // Keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Instructions
    this.add.text(400, 580, "Arrow keys or TAP to move • Click objects to interact", {
      fontSize: "14px",
      color: "#aaaaaa"
    }).setOrigin(0.5);

    // Touch/mobile controls - tap to move
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.player) return;
      
      // Check if we're clicking an interactive object
      const hitObjects = this.input.hitTestPointer(pointer);
      const clickedInteractive = hitObjects.some((obj: any) => obj.input);
      
      // Only move if not clicking an interactive object
      if (!clickedInteractive) {
        this.tweens.add({
          targets: this.player,
          x: pointer.x,
          y: Phaser.Math.Clamp(pointer.y, 50, 550),
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // Guidebot interaction
    this.guidebot.on("pointerdown", () => {
      if (!this.hasSpokenToGuide) {
        this.showDialog("Welcome to Island One! Find the glowing stone to continue.");
        this.hasSpokenToGuide = true;
      } else {
        this.showDialog("The stone is hidden somewhere in this room...");
      }
    });

    // Stone interaction
    stone.on("pointerdown", () => {
      if (this.isPlayerNear(stone)) {
        playerState.hasStone = true;
        playerState.score += 10;
        playerState.itemsCollected.push("glowing_stone");
        
        // Collect animation
        this.tweens.add({
          targets: stone,
          y: stone.y - 50,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            stone.destroy();
            this.showDialog("Stone acquired! Proceeding to Island Two...");
            
            this.time.delayedCall(2000, () => {
              this.scene.start("RoomB");
            });
          }
        });
      } else {
        this.showDialog("Get closer to collect the stone!");
      }
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 200;

    // Player movement with keyboard
    if (this.cursors.left?.isDown) {
      this.player.x -= speed * (1/60);
      this.player.setFlipX(true);
    } else if (this.cursors.right?.isDown) {
      this.player.x += speed * (1/60);
      this.player.setFlipX(false);
    }

    if (this.cursors.up?.isDown) {
      this.player.y -= speed * (1/60);
    } else if (this.cursors.down?.isDown) {
      this.player.y += speed * (1/60);
    }

    // Keep player in bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
    this.player.y = Phaser.Math.Clamp(this.player.y, 50, 550);
  }

  private showDialog(message: string) {
    if (!this.dialogText) return;
    
    this.dialogText.setText(message);
    this.dialogText.setVisible(true);

    // Auto-hide after 3 seconds
    this.time.delayedCall(3000, () => {
      this.dialogText?.setVisible(false);
    });
  }

  private isPlayerNear(target: Phaser.GameObjects.Sprite): boolean {
    if (!this.player) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x, 
      this.player.y,
      target.x,
      target.y
    );
    
    return distance < 100;
  }
}
