import * as Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class RoomA extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private guidebot?: Phaser.GameObjects.Sprite;
  private stone?: Phaser.GameObjects.Sprite;
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

    // Create player character
    this.player = this.add.sprite(100, 500, "guidebot")
      .setScale(0.8)
      .setDepth(10);

    // Guidebot NPC
    this.guidebot = this.add.sprite(150, 300, "guidebot")
      .setInteractive({ useHandCursor: true })
      .setScale(1)
      .setDepth(5);

    // Glowing stone (collectible)
    this.stone = this.add.sprite(600, 320, "stone")
      .setInteractive({ useHandCursor: true })
      .setScale(0.5)
      .setDepth(5);

    // Add glow effect to stone
    this.tweens.add({
      targets: this.stone,
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
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // Keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Instructions
    this.add.text(400, 580, "Arrow keys or TAP to move • Click objects to interact", {
      fontSize: "14px",
      color: "#aaaaaa"
    }).setOrigin(0.5).setDepth(100);

    // Guidebot interaction
    this.guidebot.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      if (!this.hasSpokenToGuide) {
        this.showDialog("Welcome to Island One! Find the glowing stone to continue.");
        this.hasSpokenToGuide = true;
      } else {
        this.showDialog("The stone is hidden somewhere in this room...");
      }
    });

    // Stone interaction
    this.stone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      if (this.isPlayerNear(this.stone!)) {
        playerState.hasStone = true;
        playerState.score += 10;
        playerState.itemsCollected.push("glowing_stone");
        
        // Collect animation
        this.tweens.add({
          targets: this.stone,
          y: this.stone!.y - 50,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.stone?.destroy();
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

    // Touch/mobile controls - tap background to move
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.player) return;
      
      // Check if clicking on an interactive game object
      const objectsUnderPointer = this.input.hitTestPointer(pointer);
      const clickedInteractive = objectsUnderPointer.some((obj: any) => {
        return obj === this.guidebot || obj === this.stone;
      });
      
      // Only move player if clicking empty space
      if (!clickedInteractive) {
        const targetX = Phaser.Math.Clamp(pointer.x, 50, 750);
        const targetY = Phaser.Math.Clamp(pointer.y, 50, 550);
        
        this.tweens.add({
          targets: this.player,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 3;

    // Player movement with keyboard
    let moving = false;
    
    if (this.cursors.left?.isDown) {
      this.player.x -= speed;
      this.player.setFlipX(true);
      moving = true;
    } else if (this.cursors.right?.isDown) {
      this.player.x += speed;
      this.player.setFlipX(false);
      moving = true;
    }

    if (this.cursors.up?.isDown) {
      this.player.y -= speed;
      moving = true;
    } else if (this.cursors.down?.isDown) {
      this.player.y += speed;
      moving = true;
    }

    // Keep player in bounds
    if (moving) {
      this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
      this.player.y = Phaser.Math.Clamp(this.player.y, 50, 550);
    }
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
