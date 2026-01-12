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
 * Island 3: Whispering Grove - 3-Room Structure
 */
export default class Island3 extends Phaser.Scene {
  private player?: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private generator?: AssetGenerator;
  
  private dialogueManager!: DialogueManager;
  private progressUI!: ProgressUI;
  
  private currentRoom: number = 1;
  private currentBg?: Phaser.GameObjects.Image;
  private currentNpc?: Phaser.GameObjects.Sprite;
  private currentObject?: Phaser.GameObjects.GameObject;
  private exitObject?: Phaser.GameObjects.GameObject;
  private currentBubble?: SpeechBubble;
  
  private canExit: boolean = false;
  private hasCollectedItem: boolean = false;
  private pointerStartPos?: { x: number; y: number };

  constructor() {
    super('Island3');
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

    const questItem = QUEST_DATA[3].room1Object;
    this.load.image(questItem, `/sprites/${questItem}.png`);
    
    this.generator = new AssetGenerator(this);
    this.generator.generateGlobalAssets();
  }

  create() {
    console.log('🌳 Island 3: Started (3-Room Layout)');
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
    this.setupRoom(this.currentRoom);
  }

  private setupRoom(roomNum: number) {
    this.currentRoom = roomNum;
    this.canExit = false;

    const width = this.scale.width;
    const height = this.scale.height;
    
    const baseScale = Math.min(width / 1280, 1);
    const assetScale = baseScale * 0.7; 

    console.log(`Setting up Room ${roomNum} (${width}x${height}) Scale: ${assetScale}`);
    
    this.currentBg?.destroy();
    this.currentNpc?.destroy();
    this.currentBubble?.destroy();
    if (this.currentObject) this.currentObject.destroy();
    if (this.exitObject) this.exitObject.destroy();

    if (roomNum === 1) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_A).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.25, height * 0.75, ASSETS.NPC_GUIDEBOT)
        .setScale(0.35 * assetScale)
        .setDepth(20);
      
      this.currentNpc.setInteractive().on('pointerdown', () => {
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer to talk.");
            return;
          }
        }

        if (this.currentBubble && this.currentBubble.visible) {
          if (this.currentBubble.targetActor === this.currentNpc) {
            this.currentBubble.destroy();
            const response = !this.hasCollectedItem
              ? "I'm listening..."
              : "I found the seed!";
            
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
          ? "The Song Seed is hidden.\nListen carefully!"
          : "You found it!\nThe forest will sing again.";
          
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          message, 
          this.currentNpc!
        );
      });

      if (!this.hasCollectedItem) {
        this.createQuestItem(assetScale);
      }

      this.exitObject = this.add.sprite(width * 0.85, height * 0.6, ASSETS.PORTAL)
        .setScale(assetScale)
        .setDepth(15)
        .setInteractive();

      this.exitObject.on('pointerdown', () => {
        if (this.hasCollectedItem) {
          this.setupRoom(2);
        } else {
          this.dialogueManager.show("I need the object first!");
        }
      });

      if (!this.hasCollectedItem) {
        this.time.delayedCall(500, () => {
          this.dialogueManager.showAnnouncement("QUEST STARTED:\nFIND THE SONG SEED");
        });
      }

    } else if (roomNum === 2) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_B).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.75, height * 0.75, ASSETS.NPC_VILLAGER)
        .setScale(0.35 * assetScale)
        .setDepth(20);
      
      // Removed delayed call

      const handleUnlock = () => {
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer.");
            return;
          }
        }

        if (this.currentBubble && this.currentBubble.visible) {
          if (this.currentBubble.targetActor === this.currentNpc) {
             this.currentBubble.destroy();
             
             if (this.hasCollectedItem) {
               this.currentBubble = new SpeechBubble(
                 this,
                 this.player!.x,
                 this.player!.y - 60,
                 "I have the Song Seed\nto wake the forest!",
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
                 "I'll search for it!",
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
            "Did you find the seed?",
            this.currentNpc!
          );
        } else {
          this.currentBubble = new SpeechBubble(
            this,
            this.currentNpc!.x,
            this.currentNpc!.y - 60,
            "The forest is silent...\nWe need the seed.",
            this.currentNpc!
          );
        }
      };
      
      this.currentNpc.setInteractive().on('pointerdown', handleUnlock);

      this.currentObject = this.add.sprite(width * 0.5, height * 0.6, ASSETS.DOOR_LOCKED)
        .setScale(assetScale)
        .setDepth(15)
        .setInteractive();

      this.currentObject.on('pointerdown', handleUnlock);

    } else if (roomNum === 3) {
      this.currentBg = this.add.image(width / 2, height / 2, ASSETS.BG_ROOM_C).setDepth(0);
      
      this.currentNpc = this.add.sprite(width * 0.75, height * 0.75, ASSETS.NPC_SAGE)
        .setScale(0.35 * assetScale)
        .setDepth(20);
      
      this.currentNpc.setInteractive().on('pointerdown', () => {
        if (this.player) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc!.x, this.currentNpc!.y);
          if (dist > 150) {
            this.dialogueManager.show("I need to get closer.");
            return;
          }
        }
        
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
            
            // Auto walk to exit
            this.time.delayedCall(1500, () => {
               if (this.currentBubble) this.currentBubble.destroy();
               this.tweens.add({
                 targets: this.player!.container,
                 x: width * 0.5,
                 y: height * 0.5,
                 duration: 1500,
                 onComplete: () => {
                   this.completeQuest();
                 }
               });
            });
            return;
          }
          if (this.currentBubble.targetActor === this.player?.container) {
            this.currentBubble.destroy();
            return;
          }
        }
        
        this.currentBubble?.destroy();
        this.canExit = true; // Allow exit immediately
        this.currentBubble = new SpeechBubble(
          this, 
          this.currentNpc!.x, 
          this.currentNpc!.y - 60, 
          "The ancient tree awakes!",
          this.currentNpc!
        );
      });

      this.currentObject = this.add.sprite(width * 0.5, height * 0.5, ASSETS.DOOR_OPEN)
        .setScale(assetScale)
        .setDepth(15)
        .setInteractive();
        
      this.currentObject.on('pointerdown', () => {
        if (this.canExit) {
          this.completeQuest();
        } else {
           this.dialogueManager.show("Speak to the Sage first.");
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

  private createQuestItem(scale: number) {
    const itemKey = QUEST_DATA[3].room1Object;
    const item = new VisualCollectible(
      this, 
      this.scale.width * 0.5, this.scale.height * 0.6, 
      itemKey, 
      'quest_item', 
      'item_3', 
      QUEST_DATA[3].color
    );
    item.mainSprite.setScale(scale * 0.25); // Significantly reduced scale
    item.setDepth(40);
    this.currentObject = item;
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    this.handleMovement(delta);
    
    if (this.currentRoom === 1 && !this.hasCollectedItem && this.currentObject instanceof VisualCollectible) {
      if (this.currentObject.isPlayerNear(this.player.x, this.player.y)) {
        this.currentObject.collect(() => {
          this.hasCollectedItem = true;
          this.dialogueManager.show(DIALOGUES.ITEM_COLLECTED);
          this.progressUI.showBadgeEarned(3);

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
    questState.completeIsland(3);
    gameState.currentIsland = 4; // Or logic for end game
    
    this.time.delayedCall(3000, () => {
      this.scene.start('StarSanctum');
    });
  }

  // --- Standard Movement Code ---
  private setupTouchControls() {
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
    
    const pointer = this.input.activePointer;
    
    if (pointer.isDown && this.pointerStartPos) {
      const dist = Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, this.pointerStartPos.x, this.pointerStartPos.y);
      if (dist > GAME_CONFIG.DRAG_THRESHOLD) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
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
      
      if (this.currentNpc) {
        const npcDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.currentNpc.x, this.currentNpc.y);
        const minDist = 40;
        if (npcDist < minDist) {
          const angle = Phaser.Math.Angle.Between(this.currentNpc.x, this.currentNpc.y, this.player.x, this.player.y);
          this.player.x = this.currentNpc.x + Math.cos(angle) * minDist;
          this.player.y = this.currentNpc.y + Math.sin(angle) * minDist;
        }
      }

      if (this.currentObject instanceof VisualCollectible && !this.hasCollectedItem) {
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
