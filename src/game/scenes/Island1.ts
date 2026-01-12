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
  
  // Quest State
  private hasCollectedItem: boolean = false;
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

    // Load Specific Quest Object
    const questItem = QUEST_DATA[1].room1Object;
    this.load.image(questItem, `/sprites/${questItem}.png`);
    
    // Initialize Generator (for particles)
    this.generator = new AssetGenerator(this);
    this.generator.generateGlobalAssets();
  }

  create() {
    console.log('🏝️ Island 1: Started (3-Room Layout)');
    this.input.addPointer(2);

    // Setup Player & Controls
    this.player = new Player(this, 100, 500);
    this.setupTouchControls();
    this.cursors = this.input.keyboard?.createCursorKeys();

    // UI
    this.dialogueManager = new DialogueManager(this);
    this.progressUI = new ProgressUI(this);
    this.progressUI.update();
    
    // UI elements removed as per request
    // this.tutorial = new TutorialOverlay(this);
    // this.instructionPanel = new InstructionPanel(this);

    // Initial Setup
    this.setupRoom(1);
  }

  private setupRoom(roomNum: number) {
    this.currentRoom = roomNum;
    console.log(`Setting up Room ${roomNum}`);

    // Cleanup previous room elements
    this.currentBg?.destroy();
    this.currentNpc?.destroy();
    this.currentBubble?.destroy();
    if (this.currentObject) this.currentObject.destroy();
    if (this.exitObject) this.exitObject.destroy();

    // 1. Background & NPC
    if (roomNum === 1) {
      this.currentBg = this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, ASSETS.BG_ROOM_A).setDepth(0);
      // NPC grounded at 0.75 height
      this.currentNpc = this.add.sprite(GAME_CONFIG.WIDTH * 0.25, GAME_CONFIG.HEIGHT * 0.75, ASSETS.NPC_GUIDEBOT).setScale(0.35).setDepth(20);
      
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

        // Interaction Logic: NPC -> Player -> NPC
        if (this.currentBubble && this.currentBubble.visible) {
          // If NPC is talking, Player talks back
          if (this.currentBubble.targetActor === this.currentNpc) {
            this.currentBubble.destroy();
            const response = !this.hasCollectedItem
              ? "I'm looking for it!"
              : "I found it! Here you go.";
            
            this.currentBubble = new SpeechBubble(
              this,
              this.player!.x,
              this.player!.y - 60,
              response,
              this.player!.container
            );
            return;
          }
          // If Player is talking, destroy bubble (end conversation)
          if (this.currentBubble.targetActor === this.player?.container) {
            this.currentBubble.destroy();
            return;
          }
        }

        // Start Conversation (NPC talks first)
        this.currentBubble?.destroy();
        
        const message = !this.hasCollectedItem 
          ? "Please find the crystal!\nIt's somewhere nearby."
          : "Great! You found it.\nNow let's open that door!";
          
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          message, 
          this.currentNpc!
        );
      });

      // Item
      if (!this.hasCollectedItem) {
        this.createQuestItem();
      }

      // Exit (Portal) - Invisible Zone (Background has the art)
      this.exitObject = this.add.zone(GAME_CONFIG.WIDTH * 0.85, GAME_CONFIG.HEIGHT * 0.6, 200, 300).setInteractive();
      this.exitObject.on('pointerdown', () => {
        if (this.hasCollectedItem) {
          this.setupRoom(2);
        } else {
          this.dialogueManager.show("I need the object first!");
        }
      });

      // New Quest Announcement
      if (!this.hasCollectedItem) {
        this.time.delayedCall(500, () => {
          this.dialogueManager.showAnnouncement("QUEST STARTED:\nFIND THE CRYSTAL");
        });
      }

    } else if (roomNum === 2) {
      this.currentBg = this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, ASSETS.BG_ROOM_B).setDepth(0);
      // NPC grounded at 0.75 height
      this.currentNpc = this.add.sprite(GAME_CONFIG.WIDTH * 0.75, GAME_CONFIG.HEIGHT * 0.75, ASSETS.NPC_VILLAGER).setScale(0.35).setDepth(20);
      
      // Interactions
      const handleUnlock = () => {
        // Proximity Check
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer.");
            return;
          }
        }

        // Click-based interaction
        if (this.currentBubble && this.currentBubble.visible) {
          if (this.currentBubble.targetActor === this.currentNpc) {
             this.currentBubble.destroy();
             
             if (this.hasCollectedItem) {
               this.currentBubble = new SpeechBubble(
                 this,
                 this.player!.x,
                 this.player!.y - 60,
                 "Yes! I can unlock the door.",
                 this.player!.container
               );
               
               // Auto-trigger unlock after short delay or wait for next click?
               // User said "next click... talks back", implying conversation first.
               // Let's trigger the unlock sequence after player speech is shown for a bit or immediately?
               // "then the next click the main character talks back each time"
               // To unlock, we can auto-proceed after player talks.
               
               this.time.delayedCall(1500, () => {
                  if (this.currentBubble) this.currentBubble.destroy();
                  // Walk to door
                  this.tweens.add({
                    targets: this.player!.container,
                    x: GAME_CONFIG.WIDTH * 0.5,
                    y: GAME_CONFIG.HEIGHT * 0.6,
                    duration: 1500,
                    onComplete: () => {
                      this.dialogueManager.show(DIALOGUES.VILLAGER_UNLOCK);
                      this.time.delayedCall(1000, () => this.setupRoom(3));
                    }
                  });
               });
             } else {
               this.currentBubble = new SpeechBubble(
                 this,
                 this.player!.x,
                 this.player!.y - 60,
                 "I'll find the crystal!",
                 this.player!.container
               );
             }
             return;
          }
          if (this.currentBubble.targetActor === this.player?.container) {
            this.currentBubble.destroy();
            return;
          }
        }

        // Start Conversation
        this.currentBubble?.destroy();
        
        if (this.hasCollectedItem) {
          this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "Oh! You have the crystal?",
            this.currentNpc!
          );
        } else {
           this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "I'm so sad...\nI need to unlock this door.",
            this.currentNpc!
          );
        }
      };

      // Initial Bubble (Auto Trigger)
      this.time.delayedCall(500, () => {
        this.currentBubble = new SpeechBubble(
          this,
          this.currentNpc!.x,
          this.currentNpc!.y - 60,
          "I'm so sad...\nI need to unlock this door.",
          this.currentNpc!
        );
      });

      this.currentNpc.setInteractive().on('pointerdown', handleUnlock);

      // Locked Door - Invisible Zone
      this.currentObject = this.add.zone(GAME_CONFIG.WIDTH * 0.5, GAME_CONFIG.HEIGHT * 0.6, 200, 300).setInteractive();
      this.currentObject.on('pointerdown', handleUnlock);

    } else if (roomNum === 3) {
      this.currentBg = this.add.image(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, ASSETS.BG_ROOM_C).setDepth(0);
      // NPC grounded at 0.75 height
      this.currentNpc = this.add.sprite(GAME_CONFIG.WIDTH * 0.75, GAME_CONFIG.HEIGHT * 0.75, ASSETS.NPC_SAGE).setScale(0.35).setDepth(20);
      
      // Interactions
      this.currentNpc.setInteractive().on('pointerdown', () => {
        // Proximity Check
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer.");
            return;
          }
        }
        
        // Click-based conversation
        if (this.currentBubble && this.currentBubble.visible) {
          if (this.currentBubble.targetActor === this.currentNpc) {
            this.currentBubble.destroy();
            this.currentBubble = new SpeechBubble(
              this,
              this.player!.x,
              this.player!.y - 60,
              "Thank you, Sage.",
              this.player!.container
            );
            return;
          }
          if (this.currentBubble.targetActor === this.player?.container) {
            this.currentBubble.destroy();
            return;
          }
        }

        this.currentBubble?.destroy();
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          "The Sanctuary is open.\nTap the portal to enter.",
          this.currentNpc!
        );
      });

      // Open Door - Invisible Zone (Larger for easier escape)
      this.currentObject = this.add.zone(GAME_CONFIG.WIDTH * 0.5, GAME_CONFIG.HEIGHT * 0.5, 600, 600)
        .setDepth(100)
        .setInteractive();
        
      this.currentObject.on('pointerdown', () => {
        this.completeQuest();
      });
    }

    // Ensure BG covers screen
    this.currentBg?.setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    
    // Reposition Player to start
    this.player!.x = 100;
    this.player!.y = 500;
    this.player!.container.setDepth(30); // Player Depth 30
  }

  private createQuestItem() {
    const itemKey = QUEST_DATA[1].room1Object;
    const item = new VisualCollectible(
      this, 
      GAME_CONFIG.WIDTH * 0.5, GAME_CONFIG.HEIGHT * 0.6, // Center
      itemKey, 
      'quest_item', 
      'item_1', 
      QUEST_DATA[1].color
    );
    item.setDepth(40); // Collectible Depth 40
    this.currentObject = item;
  }

  update() {
    if (!this.player) return;
    this.handleMovement();
    
    // Check Item Collection in Room 1
    if (this.currentRoom === 1 && !this.hasCollectedItem && this.currentObject instanceof VisualCollectible) {
      if (this.currentObject.isPlayerNear(this.player.x, this.player.y)) {
        this.currentObject.collect(() => {
          this.hasCollectedItem = true;
          this.dialogueManager.show(DIALOGUES.ITEM_COLLECTED);
          this.progressUI.showBadgeEarned(1);
          
          // Auto-advance to Room 2 after a short delay
          this.time.delayedCall(2000, () => {
             this.dialogueManager.showAnnouncement("PROCEEDING TO NEXT ROOM...");
             this.time.delayedCall(1000, () => this.setupRoom(2));
          });
        });
      }
    }
  }

  private completeQuest() {
    this.dialogueManager.showAnnouncement("QUEST COMPLETE!");
    // this.dialogueManager.show(DIALOGUES.SAGE_COMPLETE); // Replaced by announcement
    questState.completeIsland(1);
    gameState.currentIsland = 2;
    
    this.time.delayedCall(3000, () => {
      this.scene.start('Island2');
    });
  }

  // --- Standard Movement Code ---
  private setupTouchControls() {
    const touchZone = this.add.zone(400, 300, 800, 600).setInteractive().setDepth(-1);
    touchZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerStartPos = { x: pointer.worldX, y: pointer.worldY };
    });
    touchZone.on('pointerup', () => {
      this.pointerStartPos = undefined;
    });
  }

  private handleMovement() {
    if (!this.player) return;
    const speed = GAME_CONFIG.PLAYER_SPEED;
    let moving = false;
    const activePointer = this.input.activePointer;
    
    // Mouse/Touch Drag
    if (activePointer.isDown && this.pointerStartPos) {
      const dist = Phaser.Math.Distance.Between(activePointer.worldX, activePointer.worldY, this.pointerStartPos.x, this.pointerStartPos.y);
      if (dist > GAME_CONFIG.DRAG_THRESHOLD) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, activePointer.worldX, activePointer.worldY);
        this.player.x += Math.cos(angle) * speed;
        this.player.y += Math.sin(angle) * speed;
        this.player.flipX(Math.cos(angle) < 0);
        moving = true;
      }
    }

    // Keyboard
    if (this.cursors) {
      if (this.cursors.left.isDown) { this.player.x -= speed; this.player.flipX(true); moving = true; }
      else if (this.cursors.right.isDown) { this.player.x += speed; this.player.flipX(false); moving = true; }
      if (this.cursors.up.isDown) { this.player.y -= speed; moving = true; }
      else if (this.cursors.down.isDown) { this.player.y += speed; moving = true; }
    }

    // Bounds & Depth
    if (moving) {
      this.player.x = Phaser.Math.Clamp(this.player.x, GAME_CONFIG.PLAYER_BOUNDS.MIN_X, GAME_CONFIG.PLAYER_BOUNDS.MAX_X);
      this.player.y = Phaser.Math.Clamp(this.player.y, GAME_CONFIG.PLAYER_BOUNDS.MIN_Y, GAME_CONFIG.PLAYER_BOUNDS.MAX_Y);
      
      // Prevent walking on top of NPC
      if (this.currentNpc) {
        const npcDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc.x, this.currentNpc.y);
        const minDist = 80;
        if (npcDist < minDist) {
          const angle = Phaser.Math.Angle.Between(this.currentNpc.x, this.currentNpc.y, this.player.x, this.player.y);
          this.player.x = this.currentNpc.x + Math.cos(angle) * minDist;
          this.player.y = this.currentNpc.y + Math.sin(angle) * minDist;
        }
      }

      // Prevent walking on top of Collectible (only when not collecting)
      if (this.currentObject instanceof VisualCollectible && !this.hasCollectedItem) {
        const objDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentObject.x, this.currentObject.y);
        const minObjDist = 60; // Get close but not on top
        if (objDist < minObjDist) {
           const angle = Phaser.Math.Angle.Between(this.currentObject.x, this.currentObject.y, this.player.x, this.player.y);
           this.player.x = this.currentObject.x + Math.cos(angle) * minObjDist;
           this.player.y = this.currentObject.y + Math.sin(angle) * minObjDist;
        }
      }

      // Fixed depth for player, no dynamic sorting
      this.player.container.setDepth(30); 
    }
  }

  shutdown() {
    this.dialogueManager?.destroy();
  }
}
