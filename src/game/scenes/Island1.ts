import * as Phaser from 'phaser';
import { playerState } from '../state/PlayerState';
import { questState } from '../state/QuestState';
import { gameState } from '../state/GameState';
import { VisualCollectible } from '../components/VisualCollectible';
import { DialogueManager } from '../components/DialogueManager';
import { ProgressUI } from '../components/ProgressUI';
import { Player, preloadPlayerAvatar } from '../utils/player';
import { AssetGenerator } from '../utils/AssetGenerator';
import { GAME_CONFIG, QUEST_DATA, DIALOGUES, ASSETS } from '../utils/constants';
import { SpeechBubble } from '../components/SpeechBubble';

/**
 * Island 1: Crystal Isle - 3-Room Structure
 */
export default class Island1 extends Phaser.Scene {
  private player?: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private generator?: AssetGenerator;
  
  // UI Systems
  private dialogueManager!: DialogueManager;
  private progressUI!: ProgressUI;
  
  // Room State
  private currentRoom: number = 1;
  private currentBg?: Phaser.GameObjects.Image;
  private currentNpc?: Phaser.GameObjects.Sprite;
  private currentObject?: Phaser.GameObjects.GameObject; // The main interactable of the room
  private exitObject?: Phaser.GameObjects.GameObject;   // The exit (e.g. Portal)
  private currentBubble?: SpeechBubble; // Track active speech bubble
  
  // Logic Flags
  private canExit: boolean = false; 
  private collectedItems: number = 0; // Track 3 items
  private pointerStartPos?: { x: number; y: number };

  constructor() {
    super('Island1');
  }

  preload() {
    preloadPlayerAvatar(this); 
    
    // Load Common Assets
    this.load.image(ASSETS.BG_ROOM_A, '/rooms/roomA.png');
    this.load.image(ASSETS.BG_ROOM_B, '/rooms/roomB.png');
    this.load.image(ASSETS.BG_ROOM_C, '/rooms/roomC.png');
    
    this.load.image(ASSETS.NPC_GUIDEBOT, '/sprites/npc-guidebot.png');
    this.load.image(ASSETS.NPC_VILLAGER, '/sprites/npc-villager.png');
    this.load.image(ASSETS.NPC_SAGE, '/sprites/npc-starsage.png');
    
    this.load.image(ASSETS.PORTAL, '/sprites/portal.png');
    this.load.image(ASSETS.DOOR_LOCKED, '/sprites/door-locked.png');
    this.load.image(ASSETS.DOOR_OPEN, '/sprites/door-open.png');
    this.load.image(ASSETS.BUSHES, '/sprites/bushes.png');
    this.load.image(ASSETS.FLOWERS, '/sprites/flower-pile.png');
    this.load.image(ASSETS.FLOATING_EMBER, '/sprites/floating-ember-core.png');

    // Load Specific Quest Objects explicitly for UI icons
    // Ensure all 3 are loaded and keys match constants
    this.load.image(QUEST_DATA[1].room1Object, `/sprites/${QUEST_DATA[1].room1Object}.png`);
    this.load.image(QUEST_DATA[2].room1Object, `/sprites/${QUEST_DATA[2].room1Object}.png`);
    this.load.image(QUEST_DATA[3].room1Object, `/sprites/${QUEST_DATA[3].room1Object}.png`);
    
    // Initialize Generator (for particles)
    this.generator = new AssetGenerator(this);
    this.generator.generateGlobalAssets();
  }

  create() {
    console.log('🏝️ Island 1: Started (3-Room Layout)');
    this.input.addPointer(2);

    // Setup Player & Controls
    this.player = new Player(this, 100, this.scale.height * 0.7);
    this.setupTouchControls();
    this.cursors = this.input.keyboard?.createCursorKeys();

    // UI
    this.dialogueManager = new DialogueManager(this);
    this.progressUI = new ProgressUI(this);
    this.progressUI.update();
    
    // Initial Setup
    this.setupRoom(1);

    // Handle Resize
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    // Ideally we would just resize background and reposition elements
    // But for simplicity in this structure, we can re-run setupRoom
    this.setupRoom(this.currentRoom);
  }

  private setupRoom(roomNum: number) {
    this.currentRoom = roomNum;
    this.canExit = false; 
    
    const width = this.scale.width;
    const height = this.scale.height;

    // Dynamic asset scaling - Reduced for "smaller objects"
    // Base scale: 1.0 at 1280px width
    // Multiplier: 0.9 (Larger on mobile)
    const baseScale = Math.min(width / 1280, 1);
    const assetScale = baseScale * 0.9; 

    console.log(`Setting up Room ${roomNum} (${width}x${height}) Scale: ${assetScale}`);

    // Cleanup previous room elements
    this.currentBg?.destroy();
    this.currentNpc?.destroy();
    this.currentBubble?.destroy();
    if (this.currentObject) this.currentObject.destroy();
    if (this.exitObject) this.exitObject.destroy();

    // 1. Background & NPC
    if (roomNum === 1) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_A).setDepth(0);
      
      // Calculate collected items from state
      this.collectedItems = 0;
      this.progressUI.clearCollectedItems(); // Clear UI to prevent duplicates on resize
      
      if (questState.data.island1.completed) {
          this.collectedItems++;
          this.progressUI.addCollectedItem(QUEST_DATA[1].room1Object);
      }
      if (questState.data.island2.completed) {
          this.collectedItems++;
          this.progressUI.addCollectedItem(QUEST_DATA[2].room1Object);
      }
      if (questState.data.island3.completed) {
          this.collectedItems++;
          this.progressUI.addCollectedItem(QUEST_DATA[3].room1Object);
      }

      // NPC
      this.currentNpc = this.add.sprite(width * 0.25, height * 0.75, ASSETS.NPC_GUIDEBOT)
        .setScale(assetScale * 0.8)
        .setDepth(20);
      
      // Interactions
      this.currentNpc.setInteractive().on('pointerdown', () => {
        // Proximity Check
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer to talk.");
            return;
          }
        }

        // Check completion status
        if (this.collectedItems >= 3) {
             // Final NPC acknowledgement and Action
             if (this.currentBubble && this.currentBubble.visible) {
                 this.currentBubble.destroy();
                 this.currentBubble = new SpeechBubble(
                    this,
                    this.currentNpc!.x,
                    this.currentNpc!.y - 60,
                    "Excellent! The portal is open.",
                    this.currentNpc!
                 );
                 return;
             }
        }

        // Context-aware hints
        this.currentBubble?.destroy();
        let message = "";
        
        if (this.collectedItems >= 3) {
            message = "You found them all!";
        } else if (!questState.data.island1.completed) {
            message = "Find the Glowing Stone!\nIt's hidden in the bushes.";
        } else if (!questState.data.island2.completed) {
            message = "Catch the Ember Core!\nIt's floating around.";
        } else if (!questState.data.island3.completed) {
            message = "Find the Song Seed!\nCheck the flower piles.";
        }
          
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          message, 
          this.currentNpc!
        );
      });

      // Spawn Active Item
      this.spawnRoom1Items(assetScale, width, height);

      // Exit (Portal)
      this.exitObject = this.add.sprite(width * 0.85, height * 0.6, ASSETS.PORTAL)
        .setScale(assetScale * 0.5)
        .setDepth(15)
        .setInteractive();
      
      this.exitObject.on('pointerdown', () => {
        if (this.collectedItems >= 3) {
          this.setupRoom(2);
        } else {
          this.dialogueManager.show(`I need all 3 items!\nFound: ${this.collectedItems}/3`);
        }
      });

      // New Quest Announcement
      if (this.collectedItems === 0) {
        this.time.delayedCall(500, () => {
          this.dialogueManager.showAnnouncement("NEW QUEST: THE TRINITY\nFIND 3 SACRED ITEMS!");
        });
      }

    } else if (roomNum === 2) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_B).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.75, height * 0.75, ASSETS.NPC_VILLAGER)
        .setScale(assetScale * 0.8)
        .setDepth(20);
      
      const handleUnlock = () => {
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer.");
            return;
          }
        }

        // Step 2: Player Responds
        if (this.currentBubble && this.currentBubble.visible && this.currentBubble.targetActor === this.currentNpc) {
             this.currentBubble.destroy();
             
             if (this.collectedItems >= 3) {
               // Player confirms
               this.currentBubble = new SpeechBubble(
                 this,
                 this.player!.x,
                 this.player!.y - 60,
                 "I have all 3 items!",
                 this.player!.container
               );
               
               // Step 3: NPC Thanks & Action
               this.time.delayedCall(1500, () => {
                  if (this.currentBubble) this.currentBubble.destroy();
                  
                  this.currentBubble = new SpeechBubble(
                    this,
                    this.currentNpc!.x,
                    this.currentNpc!.y - 60,
                    "The door opens!",
                    this.currentNpc!
                  );
                  
                  // Enable door interaction
                  if (this.currentObject instanceof Phaser.GameObjects.Sprite) {
                      this.currentObject.setTexture(ASSETS.DOOR_OPEN);
                      // Make door bigger when unlocked
                      this.currentObject.setScale(assetScale * 0.8);
                      
                      this.currentObject.on('pointerdown', () => {
                          this.dialogueManager.show(DIALOGUES.VILLAGER_UNLOCK);
                          this.time.delayedCall(1000, () => this.setupRoom(3));
                      });
                  }
               });
             } else {
               this.currentBubble = new SpeechBubble(
                 this,
                 this.player!.x,
                 this.player!.y - 60,
                 "I'm still looking.",
                 this.player!.container
               );
             }
             return;
        }

        // Step 1: NPC Speaks
        this.currentBubble?.destroy();
        if (this.collectedItems >= 3) {
          this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "Do you have the items?",
            this.currentNpc!
          );
        } else {
           this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "I need 3 sacred items\nto unlock this door.",
            this.currentNpc!
          );
        }
      };

      this.currentNpc.setInteractive().on('pointerdown', handleUnlock);
      
      this.currentObject = this.add.sprite(width * 0.5, height * 0.6, ASSETS.DOOR_LOCKED)
        .setScale(assetScale * 0.5)
        .setDepth(15)
        .setInteractive();
        
      this.currentObject.on('pointerdown', handleUnlock);

    } else if (roomNum === 3) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_C).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.75, height * 0.75, ASSETS.NPC_SAGE)
        .setScale(assetScale * 0.8)
        .setDepth(20);
      
      this.currentNpc.setInteractive().on('pointerdown', () => {
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer.");
            return;
          }
        }
        
        // Step 2: Player Responds
        if (this.currentBubble && this.currentBubble.visible && this.currentBubble.targetActor === this.currentNpc) {
            this.currentBubble.destroy();
            this.currentBubble = new SpeechBubble(
              this,
              this.player!.x,
              this.player!.y - 60,
              "Thank you, Sage.",
              this.player!.container
            );
            
            // Step 3: NPC Permission & Action
            this.time.delayedCall(1500, () => {
               if (this.currentBubble) this.currentBubble.destroy();
               this.currentBubble = new SpeechBubble(
                 this,
                 this.currentNpc!.x,
                 this.currentNpc!.y - 60,
                 "You may enter the portal.",
                 this.currentNpc!
               );
               this.canExit = true;
            });
            return;
        }

        // Step 1: NPC Speaks
        this.currentBubble?.destroy();
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          "The Sanctuary is open.",
          this.currentNpc!
        );
      });

      // Open Door
      this.currentObject = this.add.sprite(width * 0.5, height * 0.5, ASSETS.DOOR_OPEN)
        .setScale(assetScale * 0.8) // Bigger door
        .setDepth(15)
        .setInteractive();
        
      this.currentObject.on('pointerdown', () => {
        if (this.canExit) {
          this.completeQuest();
        } else {
          this.dialogueManager.show("I should speak to the Sage first.");
        }
      });
    }

    if (this.currentBg) {
        const scaleX = width / this.currentBg.width;
        const scaleY = height / this.currentBg.height;
        const scale = Math.max(scaleX, scaleY);
        this.currentBg.setScale(scale).setScrollFactor(0);
    }
    
    if (this.player) {
      this.player.setScale(assetScale);
      this.player.x = width * 0.1;
      this.player.y = height * 0.7;
      this.player.container.setDepth(30);
    }
  }

  // Track if we've spawned objects to prevent duplicates
  private activeQuestObjects: Record<string, boolean> = {};

  private spawnRoom1Items(scale: number, width: number, height: number) {
    // Sequential Quest Logic
    
    // 1. Crystal (Hidden in Bush)
    if (!questState.data.island1.completed) {
        if (this.activeQuestObjects['q1']) return; // Already spawned
        this.activeQuestObjects['q1'] = true;

        const item1 = new VisualCollectible(this, width * 0.8, height * 0.6, QUEST_DATA[1].room1Object, 'quest', '1', QUEST_DATA[1].color);
        item1.mainSprite.setScale(scale * 0.4);
        item1.setDepth(40);
        item1.disableInteractive();
        item1.setVisible(false);

        const bush = this.add.sprite(width * 0.8, height * 0.6, ASSETS.BUSHES)
            .setScale(scale * 0.5)
            .setDepth(45)
            .setInteractive();
        
        bush.on('pointerdown', () => {
            this.tweens.add({
                targets: bush,
                alpha: 0,
                scale: 1.2,
                duration: 500,
                onComplete: () => {
                    bush.destroy();
                    if (item1 && item1.scene) {
                        item1.setVisible(true);
                        this.time.delayedCall(200, () => {
                            if (item1 && item1.scene) {
                                item1.collect(() => {
                                    this.collectedItems++;
                                    questState.completeIsland(1);
                                    this.dialogueManager.show(`Found Stone!`);
                                    this.progressUI.showBadgeEarned(1);
                                    this.progressUI.addCollectedItem(QUEST_DATA[1].room1Object);
                                    // Trigger next spawn
                                    this.spawnRoom1Items(scale, width, height);
                                });
                            }
                        });
                    }
                }
            });
        });
        return; // Stop processing subsequent quests
    }

    // 2. Ember Core (Moving)
    if (!questState.data.island2.completed) {
        if (this.activeQuestObjects['q2']) return;
        this.activeQuestObjects['q2'] = true;

        const item2 = new VisualCollectible(this, width * 0.5, height * 0.4, ASSETS.FLOATING_EMBER, 'quest', '2', QUEST_DATA[2].color);
        // Increased scale for better visibility - User requested 25% of previous size (which was 1.0)
        // Wait, user said "make it 25% the size now". Previous was 1.0. So 0.25.
        item2.mainSprite.setScale(scale * 0.25); 
        item2.setDepth(40);
        
        // Movement
        this.tweens.add({
            targets: item2,
            x: width * 0.6,
            y: height * 0.3,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Hover Collection Logic
                if (this.player && item2.visible && !item2.collected) {
                    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item2.x, item2.y);
                    if (dist < 80) { // Hover radius
                        // Just call collect without arguments, the override handles the logic
                        item2.collect();
                    }
                }
            }
        });
        
        // Stop default floating to prevent conflict
        item2.stopFloating();

        // Override collect to update state (for click)
        const originalCollect = item2.collect.bind(item2);
        item2.collect = (cb) => {
            originalCollect(() => {
                this.collectedItems++;
                questState.completeIsland(2);
                this.dialogueManager.show(`Caught Ember!`);
                this.progressUI.showBadgeEarned(2);
                this.progressUI.addCollectedItem(QUEST_DATA[2].room1Object); // Use clean icon
                if (cb) cb();
                // Trigger next spawn
                this.spawnRoom1Items(scale, width, height);
            });
        };
        return; // Stop processing
    }

    // 3. Song Seed (Flower Piles)
    if (!questState.data.island3.completed) {
        if (this.activeQuestObjects['q3']) return;
        this.activeQuestObjects['q3'] = true;

        const positions = [
            { x: width * 0.2, y: height * 0.6 },
            { x: width * 0.4, y: height * 0.8 },
            { x: width * 0.6, y: height * 0.6 }
        ];
        const winningIndex = Phaser.Math.Between(0, 2);
        const piles: Phaser.GameObjects.Sprite[] = [];
        
        positions.forEach((pos, index) => {
            const pile = this.add.sprite(pos.x, pos.y, ASSETS.FLOWERS);
            pile.setScale(scale * 0.3); // Reduced scale for flower piles
            pile.setDepth(45);
            pile.setInteractive({ useHandCursor: true });
            piles.push(pile);
            
            pile.on('pointerdown', () => {
                if (index === winningIndex) {
                    // Destroy ALL piles
                    piles.forEach(p => {
                        this.tweens.add({
                            targets: p,
                            alpha: 0,
                            duration: 500,
                            onComplete: () => p.destroy()
                        });
                    });

                    // Spawn Item
                    const item3 = new VisualCollectible(this, pos.x, pos.y, QUEST_DATA[3].room1Object, 'quest', '3', QUEST_DATA[3].color);
                    item3.mainSprite.setScale(scale * 0.4);
                    item3.setDepth(40);
                    
                    // Collect immediately
                    this.time.delayedCall(200, () => {
                        item3.collect(() => {
                            this.collectedItems++;
                            questState.completeIsland(3);
                            this.dialogueManager.show(`Found Seed!`);
                            this.progressUI.showBadgeEarned(3);
                            this.progressUI.addCollectedItem(QUEST_DATA[3].room1Object);
                            // Trigger next spawn (or final check)
                            this.spawnRoom1Items(scale, width, height);
                        });
                    });
                } else {
                    this.dialogueManager.show("Nothing here...");
                    this.tweens.add({
                        targets: pile,
                        scale: 0.8,
                        yoyo: true,
                        duration: 100
                    });
                }
            });
        });
        return;
    }
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    this.handleMovement(delta);
    
    // Update logic handled in callbacks
  }

  private completeQuest() {
    this.dialogueManager.showAnnouncement("QUEST COMPLETE!");
    questState.completeIsland(1);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('StarSanctum');
    });
  }

  private setupTouchControls() {
    // Global input listener for start position
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerStartPos = { x: pointer.worldX, y: pointer.worldY };
    });
    this.input.on('pointerup', () => {
      this.pointerStartPos = undefined;
    });
  }

  private handleMovement(delta: number) {
    if (!this.player) return;
    const speed = (GAME_CONFIG.PLAYER_SPEED * delta) / 16;
    let moving = false;
    
    // Robust Touch Logic
    const pointer = this.input.activePointer;
    
    if (pointer.isDown && this.pointerStartPos) {
      const dragDist = Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, this.pointerStartPos.x, this.pointerStartPos.y);
      
      if (dragDist > GAME_CONFIG.DRAG_THRESHOLD) {
        // Distance to target (finger) to prevent jitter
        const distToTarget = Phaser.Math.Distance.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
        
        if (distToTarget > 15) {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
            this.player.x += Math.cos(angle) * speed;
            this.player.y += Math.sin(angle) * speed;
            
            // Only flip if moving significantly horizontally to prevent rapid flipping
            const cos = Math.cos(angle);
            if (Math.abs(cos) > 0.2) {
                this.player.flipX(cos < 0);
            }
            moving = true;
        }
      }
    }

    if (this.cursors) {
      if (this.cursors.left.isDown) { this.player.x -= speed; this.player.flipX(true); moving = true; }
      else if (this.cursors.right.isDown) { this.player.x += speed; this.player.flipX(false); moving = true; }
      if (this.cursors.up.isDown) { this.player.y -= speed; moving = true; }
      else if (this.cursors.down.isDown) { this.player.y += speed; moving = true; }
    }

    if (moving) {
      const margin = 50;
      this.player.x = Phaser.Math.Clamp(this.player.x, margin, this.scale.width - margin);
      this.player.y = Phaser.Math.Clamp(this.player.y, margin, this.scale.height - margin);
      
      // Prevent walking on top of NPC
      if (this.currentNpc) {
        const npcDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc.x, this.currentNpc.y);
        const minDist = 40;
        if (npcDist < minDist) {
          const angle = Phaser.Math.Angle.Between(this.currentNpc.x, this.currentNpc.y, this.player.x, this.player.y);
          this.player.x = this.currentNpc.x + Math.cos(angle) * minDist;
          this.player.y = this.currentNpc.y + Math.sin(angle) * minDist;
        }
      }

      if (this.currentObject instanceof VisualCollectible && this.collectedItems < 3) {
        const objDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentObject.x, this.currentObject.y);
        const minObjDist = 60;
        if (objDist < minObjDist) {
           const angle = Phaser.Math.Angle.Between(this.currentObject.x, this.currentObject.y, this.player.x, this.player.y);
           this.player.x = this.currentObject.x + Math.cos(angle) * minObjDist;
           this.player.y = this.currentObject.y + Math.sin(angle) * minObjDist;
        }
      }

      this.player.container.setDepth(30); 
    }
  }

  shutdown() {
    this.dialogueManager?.destroy();
  }
}
