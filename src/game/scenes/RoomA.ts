import * as Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class RoomA extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private guidebot?: Phaser.GameObjects.Sprite;
  private stone?: Phaser.GameObjects.Sprite;
  private hasSpokenToGuide: boolean = false;
  private dialogText?: Phaser.GameObjects.Text;
  private background?: Phaser.GameObjects.Image;
  private touchTarget?: { x: number; y: number };
  private debugText?: Phaser.GameObjects.Text;
  private debugMode: boolean = true; // Set to false to disable debug output

  constructor() {
    super("RoomA");
  }

  preload() {
    this.load.image("roomA", "/rooms/roomA.png");
    this.load.image("stone", "/sprites/glowing-stone.png");
    this.load.image("guidebot", "/sprites/npc-guidebot.png");
  }

  create() {
    // Allow multi-touch + reliable mobile taps
    this.input.addPointer(2);

    // Background
    this.background = this.add.image(400, 300, "roomA")
      .setDepth(0);
    
    // Create a full-screen invisible zone for touch input
    const touchZone = this.add.zone(400, 300, 800, 600)
      .setInteractive({ useHandCursor: false })
      .setDepth(1000); // High depth but invisible

    // Player character
    this.player = this.add.sprite(100, 500, "guidebot")
      .setScale(0.8)
      .setDepth(10);

    // Guidebot NPC
    this.guidebot = this.add.sprite(150, 300, "guidebot")
      .setInteractive()
      .setScale(1)
      .setDepth(5);

    // Glowing stone
    this.stone = this.add.sprite(600, 320, "stone")
      .setInteractive()
      .setScale(0.5)
      .setDepth(5);

    // Glow animation
    this.tweens.add({
      targets: this.stone,
      alpha: 0.6,
      scale: 0.55,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Dialog text
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
    this.add.text(400, 580, "Arrow keys or TOUCH & DRAG to move • Click objects to interact", {
      fontSize: "14px",
      color: "#aaaaaa"
    }).setOrigin(0.5).setDepth(100);

    // Debug text for troubleshooting
    if (this.debugMode) {
      this.debugText = this.add.text(10, 10, "Debug: Waiting for input...", {
        fontSize: "12px",
        color: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 5, y: 5 }
      }).setDepth(1000).setScrollFactor(0);
    }

    // Log input system info
    if (this.debugMode) {
      console.log("🔍 Input System Debug Info:");
      console.log("- Keyboard available:", !!this.input.keyboard);
      console.log("- Active pointer:", !!this.input.activePointer);
      const gameConfig = (this.game.config as any);
      console.log("- Touch enabled:", gameConfig.input?.touch !== false);
      console.log("- Mouse enabled:", gameConfig.input?.mouse !== false);
    }

    // TOUCH-AND-DRAG movement (mobile fix)
    // Use the touch zone for reliable mobile touch support
    touchZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.player) return;
      
      // Get world coordinates from pointer
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      
      if (this.debugMode) {
        console.log("🟢 Zone pointerdown:", { worldX, worldY, x: pointer.x, y: pointer.y, isDown: pointer.isDown });
        this.updateDebugText(`Zone DOWN: (${Math.round(worldX)}, ${Math.round(worldY)})`);
      }
      
      // Check if we're touching an interactive object
      const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
      const hitStone = this.stone?.getBounds().contains(worldX, worldY);
      
      // Only set touch target if not touching an interactive object
      if (!hitGuidebot && !hitStone) {
        this.touchTarget = {
          x: Phaser.Math.Clamp(worldX, 50, 750),
          y: Phaser.Math.Clamp(worldY, 50, 550)
        };
        if (this.debugMode) {
          console.log("✅ Touch target set:", this.touchTarget);
        }
      } else {
        if (this.debugMode) {
          console.log("⚠️ Hit interactive object, ignoring touch");
        }
      }
    });

    touchZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      // Update touch target while dragging
      if (pointer.isDown) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        
        if (this.debugMode && this.touchTarget) {
          this.updateDebugText(`Zone MOVE: (${Math.round(worldX)}, ${Math.round(worldY)})`);
        }
        
        // Check if we're touching an interactive object
        const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
        const hitStone = this.stone?.getBounds().contains(worldX, worldY);
        
        if (!hitGuidebot && !hitStone) {
          this.touchTarget = {
            x: Phaser.Math.Clamp(worldX, 50, 750),
            y: Phaser.Math.Clamp(worldY, 50, 550)
          };
        }
      }
    });

    touchZone.on("pointerup", () => {
      // Clear touch target when touch ends
      if (this.debugMode) {
        console.log("🔴 Zone pointerup");
        this.updateDebugText("Zone UP - Touch cleared");
      }
      this.touchTarget = undefined;
    });

    // Also add global input handlers as backup for mobile
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.player || this.touchTarget) return; // Don't override if zone already handled it
      
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      
      if (this.debugMode) {
        console.log("🟢 Global pointerdown:", { worldX, worldY, x: pointer.x, y: pointer.y });
        this.updateDebugText(`Global DOWN: (${Math.round(worldX)}, ${Math.round(worldY)})`);
      }
      
      const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
      const hitStone = this.stone?.getBounds().contains(worldX, worldY);
      
      if (!hitGuidebot && !hitStone) {
        this.touchTarget = {
          x: Phaser.Math.Clamp(worldX, 50, 750),
          y: Phaser.Math.Clamp(worldY, 50, 550)
        };
        if (this.debugMode) {
          console.log("✅ Global touch target set:", this.touchTarget);
        }
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.touchTarget) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        
        const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
        const hitStone = this.stone?.getBounds().contains(worldX, worldY);
        
        if (!hitGuidebot && !hitStone) {
          this.touchTarget = {
            x: Phaser.Math.Clamp(worldX, 50, 750),
            y: Phaser.Math.Clamp(worldY, 50, 550)
          };
        }
      }
    });

    this.input.on("pointerup", () => {
      if (this.debugMode) {
        console.log("🔴 Global pointerup");
        this.updateDebugText("Global UP - Touch cleared");
      }
      this.touchTarget = undefined;
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
    this.stone.on("pointerdown", () => {
      if (this.isPlayerNear(this.stone!)) {
        playerState.hasStone = true;
        playerState.score += 10;
        playerState.itemsCollected.push("glowing_stone");

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
  }

  update() {
    if (!this.player) return;

    const speed = 3;
    let moving = false;

    // Touch-based movement (mobile)
    // Prioritize touch input over keyboard for mobile devices
    const activePointer = this.input.activePointer;
    const isKeyboardMoving = this.cursors && (
      this.cursors.left?.isDown || 
      this.cursors.right?.isDown || 
      this.cursors.up?.isDown || 
      this.cursors.down?.isDown
    );
    
    // Debug: Update debug text with current state
    if (this.debugMode && this.debugText) {
      const pointerInfo = activePointer ? 
        `Active: (${Math.round(activePointer.worldX)}, ${Math.round(activePointer.worldY)}) isDown: ${activePointer.isDown}` : 
        "No active pointer";
      const targetInfo = this.touchTarget ? 
        `Target: (${Math.round(this.touchTarget.x)}, ${Math.round(this.touchTarget.y)})` : 
        "No target";
      const keyboardInfo = isKeyboardMoving ? "Keyboard active" : "Keyboard idle";
      this.debugText.setText(`Debug:\n${pointerInfo}\n${targetInfo}\n${keyboardInfo}`);
    }
    
    // Only use touch if keyboard is not being used (to avoid conflicts on desktop)
    if (!isKeyboardMoving && activePointer && activePointer.isDown) {
      const worldX = activePointer.worldX;
      const worldY = activePointer.worldY;
      
      // Check if we're touching an interactive object
      const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
      const hitStone = this.stone?.getBounds().contains(worldX, worldY);
      
      if (!hitGuidebot && !hitStone) {
        const dx = worldX - this.player.x;
        const dy = worldY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move toward touch position if not already there
        if (distance > speed) {
          const angle = Math.atan2(dy, dx);
          this.player.x += Math.cos(angle) * speed;
          this.player.y += Math.sin(angle) * speed;
          
          // Flip sprite based on direction
          this.player.setFlipX(dx < 0);
          moving = true;
        }
      }
    } else if (this.touchTarget) {
      // Use stored touch target from event handlers
      const dx = this.touchTarget.x - this.player.x;
      const dy = this.touchTarget.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Move toward touch target if not already there
      if (distance > speed) {
        const angle = Math.atan2(dy, dx);
        this.player.x += Math.cos(angle) * speed;
        this.player.y += Math.sin(angle) * speed;
        
        // Flip sprite based on direction
        this.player.setFlipX(dx < 0);
        moving = true;
      } else {
        // Reached target, clear it
        this.touchTarget = undefined;
      }
    }

    // Keyboard movement (desktop)
    if (this.cursors) {
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

  private updateDebugText(message: string) {
    if (this.debugText) {
      const currentText = this.debugText.text;
      this.debugText.setText(`${currentText}\n${message}`);
      
      // Keep only last 5 lines
      const lines = this.debugText.text.split('\n');
      if (lines.length > 5) {
        this.debugText.setText(lines.slice(-5).join('\n'));
      }
    }
  }
}
