// Enhanced quest state management for all 5 islands + meta quest

export interface IslandQuest {
  completed: boolean;
  badgeEarned: boolean;
  progress: {
    [key: string]: any;
  };
}

export interface QuestStateData {
  island1: IslandQuest;
  island2: IslandQuest;
  island3: IslandQuest;
  metaQuestComplete: boolean;
}

class QuestStateManager {
  private data: QuestStateData = {
    island1: {
      completed: false,
      badgeEarned: false,
      progress: {
        crystalsCollected: 0,
        deliveredToWizard: false
      }
    },
    island2: {
      completed: false,
      badgeEarned: false,
      progress: {
        ventsActivated: 0,
        spiritCaptured: false
      }
    },
    island3: {
      completed: false,
      badgeEarned: false,
      progress: {
        seedsCollected: 0,
        seedsPlanted: 0
      }
    },
    metaQuestComplete: false
  };

  /**
   * Get quest data for a specific island
   */
  getIsland(islandNum: number): IslandQuest {
    return this.data[`island${islandNum}` as keyof QuestStateData] as IslandQuest;
  }

  /**
   * Update progress for a specific island
   */
  updateProgress(islandNum: number, progressKey: string, value: any): void {
    const island = this.getIsland(islandNum);
    if (island) {
      island.progress[progressKey] = value;
      console.log(`Quest progress updated: Island ${islandNum}, ${progressKey} = ${value}`);
    }
  }

  /**
   * Complete an island quest and award badge
   */
  completeIsland(islandNum: number): void {
    const island = this.getIsland(islandNum);
    if (island && !island.completed) {
      island.completed = true;
      island.badgeEarned = true;
      console.log(`✅ Island ${islandNum} complete! Badge earned!`);
      
      // Check if all islands are complete
      if (this.areAllIslandsComplete()) {
        this.completeMetaQuest();
      }
      
      // Save progress to API
      this.saveProgress(islandNum);
    }
  }

  /**
   * Check if all 3 islands are complete
   */
  areAllIslandsComplete(): boolean {
    return (
      this.data.island1.completed &&
      this.data.island2.completed &&
      this.data.island3.completed
    );
  }

  /**
   * Complete the meta quest (all islands done)
   */
  completeMetaQuest(): void {
    if (!this.data.metaQuestComplete) {
      this.data.metaQuestComplete = true;
      console.log('⭐ META QUEST COMPLETE! All islands restored!');
    }
  }

  /**
   * Get all earned badges
   */
  getEarnedBadges(): string[] {
    const badges: string[] = [];
    if (this.data.island1.badgeEarned) badges.push('Crystal Keeper');
    if (this.data.island2.badgeEarned) badges.push('Flame Tamer');
    if (this.data.island3.badgeEarned) badges.push('Grove Guardian');
    return badges;
  }

  /**
   * Get number of earned badges
   */
  getBadgeCount(): number {
    return this.getEarnedBadges().length;
  }

  /**
   * Save progress to API
   */
  private async saveProgress(islandNum: number): Promise<void> {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          islandNum,
          completed: true,
          badgeEarned: true,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Reset all quest data (for testing)
   */
  reset(): void {
    this.data = {
      island1: { completed: false, badgeEarned: false, progress: { crystalsCollected: 0, deliveredToWizard: false } },
      island2: { completed: false, badgeEarned: false, progress: { ventsActivated: 0, spiritCaptured: false } },
      island3: { completed: false, badgeEarned: false, progress: { seedsCollected: 0, seedsPlanted: 0 } },
      metaQuestComplete: false
    };
    console.log('🔄 Quest state reset');
  }

  /**
   * Get all quest data (for saving/NFT metadata)
   */
  getAllData(): QuestStateData {
    return { ...this.data };
  }

  /**
   * Load quest data (from save or NFT mint)
   */
  loadData(data: Partial<QuestStateData>): void {
    this.data = { ...this.data, ...data };
    console.log('📂 Quest data loaded');
  }
}

// Export singleton instance
export const questState = new QuestStateManager();
