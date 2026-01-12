import * as Phaser from 'phaser';
import { playerState } from '../state/PlayerState';
import { questState } from '../state/QuestState';
import { gameState } from '../state/GameState';
import { VisualCollectible } from '../components/VisualCollectible';
import { DialogueManager } from '../components/DialogueManager';
import { ProgressUI } from '../components/ProgressUI';
import { TutorialOverlay, InstructionPanel } from '../components/TutorialOverlay';
import { Player, preloadPlayerAvatar } from '../utils/player';
import { AssetGenerator } from '../utils/AssetGenerator';
import { GAME_CONFIG, QUEST_DATA, DIALOGUES, ASSETS } from '../utils/constants';

import { SpeechBubble } from '../components/SpeechBubble';

/**
 * Island 4: Tide Observatory - 3-Room Structure
 */
export default class Island4 extends Phaser.Scene {
  private player?: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private generator?: AssetGenerator;
  
  private dialogueManager!: DialogueManager;
  private progressUI!: ProgressUI;
  private tutorial!: TutorialOverlay;
  private instructionPanel!: InstructionPanel;
  
  private currentRoom: number = 1;
  private currentBg?: Phaser.GameObjects.Image;
  private currentNpc?: Phaser.GameObjects.Sprite;
  private currentObject?: Phaser.GameObjects.GameObject;
  private exitObject?: Phaser.GameObjects.GameObject;
  private currentBubble?: SpeechBubble;
  
  private hasCollectedItem: boolean = false;
  private pointerStartPos?: { x: number; y: number };

  constructor() {
    super('Island4');
  }

  preload() {
    preloadPlayerAvatar(this); 
    
    this.load.image(ASSETS.BG_ROOM_A, '/rooms/roomA.png');
    this.load.image(ASSETS.BG_ROOM_B, '/rooms/roomB.png');
    this.load.image(ASSETS.BG_ROOM_C, '/rooms/roomC.png');
    
    this.load.image(ASSETS.NPC_GUIDEBOT, '/sprites/npc-guidebot.png');
    this.load.image(ASSETS.NPC_VILLAGER, '/sprites/npc-villager.png');
    this.load.image(ASSETS.NPC_SAGE, '/sprites/npc-starsage.png');
    
    this.load.image(ASSETS.PORTAL, '/sprites/portal.png');
    this.load.image(ASSETS.DOOR_LOCKED, '/sprites/door-locked.png');
    this.load.image(ASSETS.DOOR_OPEN, '/sprites/door-open.png');

    const questItem = QUEST_DATA[4].room1Object;
    this.load.image(questItem, `/sprites/${questItem}.png`);
    
    this.generator = new AssetGenerator(this);
    this.generator.generateGlobalAssets();
  }

  create() {
    console.log('🌊 Island 4: Started (3-Room Layout)');
    this.input.addPointer(2);

    this.player = new Player(this, 100, this.scale.height * 0.7);
    this.setupTouchControls();
    this.cursors = this.input.keyboard?.createCursorKeys();

    this.dialogueManager = new DialogueManager(this);
    this.progressUI = new ProgressUI(this);
    this.progressUI.update();
    
    this.setupRoom(1);
    
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    if (this.currentBg) {
      this.currentBg.setPosition(gameSize.width / 2, gameSize.height / 2);
      const scaleX = gameSize.width / this.currentBg.width;
      const scaleY = gameSize.height / this.currentBg.height;
      const scale = Math.max(scaleX, scaleY);
      this.currentBg.setScale(scale).setScrollFactor(0);
    }
    this.setupRoom(this.currentRoom);
  }

  private setupRoom(roomNum: number) {
    this.currentRoom = roomNum;
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.currentBg?.destroy();
    this.currentNpc?.destroy();
    this.currentBubble?.destroy();
    if (this.currentObject) this.currentObject.destroy();
    if (this.exitObject) this.exitObject.destroy();

    if (roomNum === 1) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_A).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.25, height * 0.5, ASSETS.NPC_GUIDEBOT).setScale(0.35).setDepth(20);
      
      this.currentNpc.setInteractive().on('pointerdown', () => {
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer to talk.");
            return;
          }
        }

        // Interaction Logic
        if (this.currentBubble && this.currentBubble.visible) {
          if (this.currentBubble.targetActor === this.currentNpc) {
            this.currentBubble.destroy();
            const response = !this.hasCollectedItem
              ? "I'm searching for it."
              : "I found the moonstone!";
            
            this.currentBubble = new SpeechBubble(
              this,
              this.player!.x,
              this.player!.y - 60,
              response,
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
        const message = !this.hasCollectedItem 
          ? "The Moonstone is lost!\nThe tides are stuck."
          : "You found it!\nThe sea will flow again.";
          
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          message, 
          this.currentNpc!
        );
      });

      if (!this.hasCollectedItem) {
        this.createQuestItem();
      }

      this.exitObject = this.add.sprite(width * 0.85, height * 0.5, ASSETS.PORTAL).setScale(0.6).setDepth(10).setInteractive();
      this.exitObject.on('pointerdown', () => {
        if (this.hasCollectedItem) {
          this.setupRoom(2);
        } else {
          this.dialogueManager.show("I need the object first!");
        }
      });

      if (!this.hasCollectedItem) {
        this.time.delayedCall(500, () => {
          this.dialogueManager.showAnnouncement("QUEST STARTED:\nFIND THE MOONSTONE");
        });
      }

    } else if (roomNum === 2) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_B).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.75, height * 0.5, ASSETS.NPC_VILLAGER).setScale(0.35).setDepth(20);
      
      this.time.delayedCall(500, () => {
        this.currentBubble = new SpeechBubble(
          this,
          this.currentNpc!.x,
          this.currentNpc!.y - 60,
          "The tides are stuck...\nWe need the moonstone.",
          this.currentNpc!
        );
      });

      const handleUnlock = () => {
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
                 "I have the Moonstone\nto fix the tides!",
                 this.player!.container
               );
               
               this.time.delayedCall(1500, () => {
                  if (this.currentBubble) this.currentBubble.destroy();
                  this.tweens.add({
                    targets: this.player!.container,
                    x: width * 0.5,
                    y: height * 0.6,
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
                 "I will find it!",
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

        this.currentBubble?.destroy();
        
        if (this.hasCollectedItem) {
          this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "Is that the Moonstone?",
            this.currentNpc!
          );
        } else {
          this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "The tides are stuck...\nWe need the moonstone.",
            this.currentNpc!
          );
        }
      };
      
      this.currentNpc.setInteractive().on('pointerdown', handleUnlock);

      this.currentObject = this.add.sprite(width * 0.5, height * 0.5, ASSETS.DOOR_LOCKED).setScale(0.8).setDepth(10).setInteractive();
      this.currentObject.on('pointerdown', handleUnlock);

    } else if (roomNum === 3) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_C).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.75, height * 0.5, ASSETS.NPC_SAGE).setScale(0.35).setDepth(20);
      
      this.currentNpc.setInteractive().on('pointerdown', () => {
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
          "The observatory is active!\nTap the portal to enter.",
          this.currentNpc!
        );
      });

      this.currentObject = this.add.sprite(width * 0.5, height * 0.5, ASSETS.DOOR_OPEN)
        .setScale(0.8)
        .setDepth(100) // High depth
        .setInteractive(
          new Phaser.Geom.Rectangle(0, 0, 600, 600), 
          Phaser.Geom.Rectangle.Contains
        );
        
      this.currentObject.on('pointerdown', () => {
        this.completeQuest();
      });
    }

    if (this.currentBg) {
        const scaleX = width / this.currentBg.width;
        const scaleY = height / this.currentBg.height;
        const scale = Math.max(scaleX, scaleY);
        this.currentBg.setScale(scale).setScrollFactor(0);
    }
    
    this.player!.x = 100;
    this.player!.y = 500;
    this.player!.container.setDepth(30);
  }

  private createQuestItem() {
    const itemKey = QUEST_DATA[4].room1Object;
    const item = new VisualCollectible(
      this, 
      this.scale.width * 0.5, this.scale.height * 0.6, 
      itemKey, 
      'quest_item', 
      'item_4', 
      QUEST_DATA[4].color
    );
    item.setDepth(40);
    this.currentObject = item;
  }

  update() {
    if (!this.player) return;
    this.handleMovement();
    
    if (this.currentRoom === 1 && !this.hasCollectedItem && this.currentObject instanceof VisualCollectible) {
      if (this.currentObject.isPlayerNear(this.player.x, this.player.y)) {
        this.currentObject.collect(() => {
          this.hasCollectedItem = true;
          this.dialogueManager.show(DIALOGUES.ITEM_COLLECTED);
          this.progressUI.showBadgeEarned(4);

          // Auto-advance to Room 2
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
    questState.completeIsland(4);
    gameState.currentIsland = 5;
    
    this.time.delayedCall(3000, () => {
      this.scene.start('Island5');
    });
  }

  private setupTouchControls() {
    const width = this.scale.width;
    const height = this.scale.height;
    const touchZone = this.add.zone(width / 2, height / 2, width, height).setInteractive().setDepth(-1);
    
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

      this.player.container.setDepth(30);
    }
  }

  shutdown() {
    this.dialogueManager?.destroy();
  }
}
