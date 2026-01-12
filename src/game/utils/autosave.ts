import { storage, SavedProgress } from './storage';
import { questState } from '../state/QuestState';
import { gameState } from '../state/GameState';
import { playerState } from '../state/PlayerState';

/**
 * Auto-save utility for persisting game progress
 */
export class AutoSave {
  private static saveInterval: NodeJS.Timeout | null = null;
  private static SAVE_INTERVAL_MS = 30000; // Save every 30 seconds

  /**
   * Start auto-saving
   */
  static start(): void {
    if (this.saveInterval) return;

    console.log('💾 Auto-save enabled');
    
    // Save immediately
    this.save();

    // Then save periodically
    this.saveInterval = setInterval(() => {
      this.save();
    }, this.SAVE_INTERVAL_MS);
  }

  /**
   * Stop auto-saving
   */
  static stop(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
      console.log('💾 Auto-save disabled');
    }
  }

  /**
   * Manually trigger a save
   */
  static save(): void {
    try {
      const progress: SavedProgress = {
        currentIsland: gameState.currentIsland,
        playerAvatar: {
          bodyColor: playerState.bodyColor || 'blue',
          outfit: playerState.outfit || 'default',
          accessory: playerState.accessory || 'none'
        },
        questStates: questState.getAllData(),
        lastPlayed: new Date().toISOString(),
        totalPlayTime: Math.floor((Date.now() - gameState.gameStartTime) / 60000)
      };

      storage.save(progress);
      console.log('💾 Game progress saved');
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  /**
   * Load saved progress
   */
  static load(): SavedProgress | null {
    return storage.load();
  }

  /**
   * Clear saved progress
   */
  static clear(): void {
    storage.clear();
  }
}
