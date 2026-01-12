// LocalStorage utility for game progress persistence

const STORAGE_KEY = 'cosmic-isles-progress';

import { QuestStateData } from '../state/QuestState';

export interface SavedProgress {
  currentIsland: number;
  playerAvatar: {
    bodyColor: string;
    outfit: string;
    accessory: string;
  };
  questStates: QuestStateData;
  lastPlayed: string;
  totalPlayTime: number;
}

export const storage = {
  /**
   * Save current game progress
   */
  save(progress: SavedProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      console.log('💾 Progress saved:', progress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  /**
   * Load saved game progress
   */
  load(): SavedProgress | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        console.log('📂 Progress loaded:', progress);
        return progress;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return null;
  },

  /**
   * Clear all saved progress
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️  Progress cleared');
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  },

  /**
   * Check if save data exists
   */
  hasSave(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
};
