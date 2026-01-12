import * as Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class RoomA extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private guidebot?: Phaser.GameObjects.Sprite;
  private stone?: Phaser.GameObjects.Sprite;
  private hasSpokenToGuide: boolean = false;
  private dialogText?: Phaser.GameObjects.Text;
  private touchTarget?: { x: number; y: number };
  private debugText?: Phaser.GameObjects.Text;
  private debugMode: boolean = false; // Set to false to disable debug output
  private pointerStartPos?: { x: number; y: number };
  private lastHintTime: number = 0;
  private lastDistanceToStone: number = 9999;

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
    this.add.image(400, 300, "roomA")
      .setDepth(0);
    
    // Create a full-screen invisible zone for touch input
    const touchZone = this.add.zone(400, 300, 800, 600)
      .setInteractive({ useHandCursor: false })
      .setDepth(-1); // Low depth so it doesn't block interactive objects

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
      .setDepth(15); // Higher depth than player (10) so it's always clickable

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
        fontSize: "32px",
        color: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 }
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
      
      // Always track pointer start position for drag detection
      this.pointerStartPos = {
        x: worldX,
        y: worldY
      };
      
      if (this.debugMode) {
        console.log("🟢 Zone pointerdown:", { worldX, worldY, x: pointer.x, y: pointer.y, isDown: pointer.isDown });
        this.updateDebugText(`Zone DOWN: (${Math.round(worldX)}, ${Math.round(worldY)})`);
      }
    });

    touchZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      // Update touch target while dragging
      if (pointer.isDown) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        
        if (this.debugMode) {
          this.updateDebugText(`Zone MOVE: (${Math.round(worldX)}, ${Math.round(worldY)})`);
        }
        
        // Check if we're touching an interactive object
        const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
        const hitStone = this.stone?.getBounds().contains(worldX, worldY);
        
        // Always update touch target during drag (don't require it to exist first)
        if (!hitGuidebot && !hitStone) {
          this.touchTarget = {
            x: Phaser.Math.Clamp(worldX, 50, 750),
            y: Phaser.Math.Clamp(worldY, 50, 550)
          };
          if (this.debugMode) {
            console.log("✅ Touch target updated during drag:", this.touchTarget);
          }
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
      // Track where pointer started for drag detection
      this.pointerStartPos = {
        x: pointer.worldX,
        y: pointer.worldY
      };
      
      if (this.debugMode) {
        console.log("🟢 Global pointerdown:", { worldX: pointer.worldX, worldY: pointer.worldY });
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      // Update touch target during drag (don't require touchTarget to exist first)
      if (pointer.isDown) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        
        const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
        const hitStone = this.stone?.getBounds().contains(worldX, worldY);
        
        if (!hitGuidebot && !hitStone) {
          this.touchTarget = {
            x: Phaser.Math.Clamp(worldX, 50, 750),
            y: Phaser.Math.Clamp(worldY, 50, 550)
          };
          if (this.debugMode) {
            console.log("✅ Global touch target updated during drag:", this.touchTarget);
          }
        }
      }
    });

    this.input.on("pointerup", () => {
      if (this.debugMode) {
        console.log("🔴 Global pointerup");
      }
      this.touchTarget = undefined;
      this.pointerStartPos = undefined;
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
    this.stone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      console.log("🔷 STONE CLICKED!");
      
      const distance = this.player ? Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.stone!.x,
        this.stone!.y
      ) : 999;
      
      console.log("Stone clicked! Distance:", Math.round(distance), "Required: < 120");
      console.log("Player position:", this.player?.x, this.player?.y);
      console.log("Stone position:", this.stone?.x, this.stone?.y);
      
      if (this.isPlayerNear(this.stone!)) {
        console.log("✅ Player is near! Collecting stone...");
        playerState.hasStone = true;
        playerState.score += 10;
        playerState.itemsCollected.push("glowing_stone");

        this.tweens.add({
          targets: this.stone,
          y: this.stone!.y - 50,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            console.log("✅ Stone animation complete, transitioning to RoomB...");
            this.stone?.destroy();
            this.showDialog("Stone acquired! Proceeding to Island Two...");

            this.time.delayedCall(2000, () => {
              console.log("✅ Starting RoomB scene...");
              this.scene.start("RoomB");
            });
          }
        });
      } else {
        console.log("❌ Player too far away");
        // Show how much closer they need to get
        const distanceNeeded = Math.round(distance - 120);
        if (distanceNeeded > 50) {
          this.showDialog(`Too far! Drag closer to the stone.`);
        } else if (distanceNeeded > 20) {
          this.showDialog("Getting close! Keep dragging closer!");
        } else {
          this.showDialog("Almost there! Just a tiny bit closer!");
        }
      }
    });
  }

  update() {
    if (!this.player) return;

    const speed = 3;
    let moving = false;

    // Touch/Mouse-based movement - same pattern as keyboard
    const activePointer = this.input.activePointer;
    const isKeyboardMoving = this.cursors && (
      this.cursors.left?.isDown || 
      this.cursors.right?.isDown || 
      this.cursors.up?.isDown || 
      this.cursors.down?.isDown
    );
    
    // Only use pointer if keyboard is not being used (to avoid conflicts on desktop)
    if (!isKeyboardMoving && activePointer && activePointer.isDown && this.pointerStartPos) {
      const worldX = activePointer.worldX;
      const worldY = activePointer.worldY;
      
      // Check if pointer has moved significantly (dragging) vs just clicking
      const dragDistance = Math.sqrt(
        Math.pow(worldX - this.pointerStartPos.x, 2) + 
        Math.pow(worldY - this.pointerStartPos.y, 2)
      );
      const isDragging = dragDistance > 10; // Only treat as drag if moved more than 10 pixels
      
      // Check if we're currently over an interactive object
      const hitGuidebot = this.guidebot?.getBounds().contains(worldX, worldY);
      const hitStone = this.stone?.getBounds().contains(worldX, worldY);
      
      // Allow movement when dragging (not just clicking on objects)
      // Only block movement if clicking directly on guidebot (not dragging)
      if (isDragging || !hitGuidebot) {
        const dx = worldX - this.player.x;
        const dy = worldY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move directly toward pointer position each frame (like keyboard movement)
        if (distance > speed) {
          // Normalize direction and move
          const angle = Math.atan2(dy, dx);
          this.player.x += Math.cos(angle) * speed;
          this.player.y += Math.sin(angle) * speed;
          
          // Flip sprite based on direction
          this.player.setFlipX(dx < 0);
          moving = true;
        } else if (distance > 0) {
          // Very close, move remaining distance
          this.player.x = worldX;
          this.player.y = worldY;
          moving = true;
        }
      }
    }
    
    // Show hints when getting closer to the stone
    if (this.stone && moving) {
      const distanceToStone = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.stone.x,
        this.stone.y
      );
      
      const currentTime = this.time.now;
      
      // Show hints when getting closer
      if (distanceToStone < this.lastDistanceToStone && currentTime - this.lastHintTime > 3000) {
        if (distanceToStone < 120) {
          this.showDialog("Perfect! Now click the stone to collect it!");
          this.lastHintTime = currentTime;
        } else if (distanceToStone < 200 && distanceToStone > 120) {
          this.showDialog("Getting closer! Keep moving toward the glowing stone.");
          this.lastHintTime = currentTime;
        } else if (distanceToStone < 300 && distanceToStone > 200) {
          this.showDialog("You're heading the right way!");
          this.lastHintTime = currentTime;
        }
      }
      
      this.lastDistanceToStone = distanceToStone;
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
    
    // Debug: Update debug text with current state
    if (this.debugMode && this.debugText) {
      const pointerInfo = activePointer ? 
        `Touch: (${Math.round(activePointer.worldX)}, ${Math.round(activePointer.worldY)}) isDown: ${activePointer.isDown}` : 
        "No touch";
      const playerInfo = `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`;
      const dragInfo = this.pointerStartPos && activePointer?.isDown ? 
        `Drag: ${Math.round(Math.sqrt(Math.pow(activePointer.worldX - this.pointerStartPos.x, 2) + Math.pow(activePointer.worldY - this.pointerStartPos.y, 2)))}px` : 
        "Not dragging";
      const movingInfo = moving ? "MOVING" : "STOPPED";
      const keyboardInfo = isKeyboardMoving ? "Keyboard active" : "Keyboard idle";
      this.debugText.setText(`Debug:\n${pointerInfo}\n${playerInfo}\n${dragInfo}\n${movingInfo}\n${keyboardInfo}`);
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

    return distance < 120; // Increased from 100 to 120 for easier collection
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
