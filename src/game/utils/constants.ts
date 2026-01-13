// Game constants and configuration
export const GAME_CONFIG = {
  WIDTH: 1280,
  HEIGHT: 720,
  PLAYER_SPEED: 8, // Increased speed for larger screen
  PLAYER_BOUNDS: {
    MIN_X: 50,
    MAX_X: 1230,
    MIN_Y: 50,
    MAX_Y: 670
  },
  INTERACTION_DISTANCE: 150,
  DRAG_THRESHOLD: 10,
  COLLECTIBLE_PULSE_DURATION: 1000,
  COLLECTIBLE_GLOW_SCALE: 1.2,
  DIALOGUE_DURATION: 3000,
  TOTAL_QUESTS: 3
} as const;

// Quest Definitions
export const QUEST_DATA: Record<number, {
  id: number;
  name: string;
  badge: string;
  room1Object: string;
  color: number;
}> = {
  1: {
    id: 1,
    name: 'Quest 1: Crystal Isle',
    badge: 'Crystal Keeper',
    room1Object: 'glowing-stone', // This is used to load image
    color: 0xA020F0 // Purple
  },
  2: {
    id: 2,
    name: 'Quest 2: Ember Forge',
    badge: 'Flame Tamer',
    room1Object: 'ember-core',
    color: 0xFF4500 // Orange/Red
  },
  3: {
    id: 3,
    name: 'Quest 3: Whispering Grove',
    badge: 'Grove Guardian',
    room1Object: 'song-seed',
    color: 0x32CD32 // Lime Green
  },
  6: { // Meta Quest
    id: 6,
    name: 'Meta Quest: Shattered Star',
    badge: 'Star Reforged',
    room1Object: 'star-fragment',
    color: 0xFFFFFF // White
  }
};

// Generic Dialogues
export const DIALOGUES = {
  // Room 1 (Guidebot)
  GUIDEBOT_INTRO: "Greetings! Find the sacred object to proceed.",
  GUIDEBOT_COLLECTED: "Excellent. Proceed to the next chamber.",
  
  // Room 2 (Villager)
  VILLAGER_LOCKED: "The door is sealed tight. We need the sacred object.",
  VILLAGER_UNLOCK: "You did it! The path is open.",
  
  // Room 3 (Sage)
  SAGE_WELCOME: "You have arrived. The prophecy is fulfilling.",
  SAGE_COMPLETE: "Quest complete. Your journey continues.",
  
  // Interaction
  ITEM_COLLECTED: "Object Acquired!",
  DOOR_LOCKED: "It's locked.",
  TOO_FAR: "Move closer to interact."
} as const;

// Asset mapping just in case
export const ASSETS = {
  BG_ROOM_A: 'roomA',
  BG_ROOM_B: 'roomB',
  BG_ROOM_C: 'roomC',
  NPC_GUIDEBOT: 'npc-guidebot',
  NPC_VILLAGER: 'npc-villager',
  NPC_SAGE: 'npc-starsage',
  PORTAL: 'portal',
  DOOR_LOCKED: 'door-locked',
  DOOR_OPEN: 'door-open',
  BUSHES: 'bushes',
  FLOWERS: 'flower-pile',
  FLOATING_EMBER: 'floating-ember-core'
} as const;

// Keep ISLANDS constant for compatibility if other files use it, or map it to QUEST_DATA
export const ISLANDS = {
  ISLAND_1: QUEST_DATA[1],
  ISLAND_2: QUEST_DATA[2],
  ISLAND_3: QUEST_DATA[3]
};
