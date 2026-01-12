// Global game state for overall progress tracking

export interface GameState {
  currentIsland: number;
  totalPlayTime: number;
  gameStartTime: number;
  completionSpeed: 'fast' | 'normal' | 'exploratory' | null;
  allIslandsComplete: boolean;
}

export const gameState: GameState = {
  currentIsland: 1,
  totalPlayTime: 0,
  gameStartTime: Date.now(),
  completionSpeed: null,
  allIslandsComplete: false
};

// Calculate completion speed based on total time
export function calculateCompletionSpeed(totalMinutes: number): 'fast' | 'normal' | 'exploratory' {
  if (totalMinutes < 15) return 'fast';
  if (totalMinutes < 25) return 'normal';
  return 'exploratory';
}

// Get total play time in minutes
export function getTotalPlayTime(): number {
  return Math.floor((Date.now() - gameState.gameStartTime) / 60000);
}

// Mark current island as complete and move to next
export function completeCurrentIsland(): void {
  gameState.currentIsland++;
  
  if (gameState.currentIsland > 5) {
    gameState.allIslandsComplete = true;
    const minutes = getTotalPlayTime();
    gameState.completionSpeed = calculateCompletionSpeed(minutes);
    gameState.totalPlayTime = minutes;
  }
}
