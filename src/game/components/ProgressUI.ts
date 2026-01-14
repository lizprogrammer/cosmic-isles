import * as Phaser from 'phaser';
import { questState } from '../state/QuestState';
import { ISLANDS } from '../utils/constants';

/**
 * UI overlay showing progress through islands and earned badges
 */
export class ProgressUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private badgeIcons: Phaser.GameObjects.Graphics[] = [];
  private progressText?: Phaser.GameObjects.Text;
  private collectionContainer: Phaser.GameObjects.Container;
  private collectedItemCount: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(90);
    
    // Position "Items Collected" section at top-left, clearly visible
    this.collectionContainer = scene.add.container(20, 20);
    this.collectionContainer.setDepth(100); // Ensure it's visible above everything
    this.container.add(this.collectionContainer);
    
    // Add label for "Items Collected" - tiny font to match tiny icons
    const label = scene.add.text(0, -1, 'Items Collected:', {
      fontSize: '10px',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 0.5
    });
    this.collectionContainer.add(label);
    
    this.createUI();
  }

  private createUI(): void {
    // Progress text at top
    this.progressText = this.scene.add.text(
      400,
      15,
      'Star Walker Journey: 0/5 Islands',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    this.progressText.setOrigin(0.5, 0);
    this.container.add(this.progressText);

    // Badge icons in bottom-right corner
    const startX = 600;
    const startY = 550;
    const spacing = 45;

    Object.values(ISLANDS).forEach((island, index) => {
      const badge = this.createBadgeIcon(
        startX + (index * spacing),
        startY,
        island.color,
        island.badge
      );
      this.badgeIcons.push(badge);
      this.container.add(badge);
    });
  }

  private createBadgeIcon(x: number, y: number, color: number, name: string): Phaser.GameObjects.Graphics {
    const badge = this.scene.add.graphics();
    
    // Draw star shape for badge
    badge.lineStyle(2, 0xffffff, 1);
    badge.fillStyle(0x333333, 0.5); // Unearned (gray)
    
    // Simple star
    const points = this.getStarPoints(x, y, 5, 15, 7);
    badge.beginPath();
    badge.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      badge.lineTo(points[i].x, points[i].y);
    }
    badge.closePath();
    badge.fillPath();
    badge.strokePath();

    badge.setData('color', color);
    badge.setData('name', name);
    badge.setData('earned', false);

    return badge;
  }

  private getStarPoints(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    const points = [];
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      });
    }
    return points;
  }

  // Store collected item names for text list
  private collectedItemNames: string[] = [];

  /**
   * Add a collected item to the UI - using text list instead of icons
   */
  public addCollectedItem(textureKey: string): void {
    // Map texture keys to readable names
    const itemNames: Record<string, string> = {
      'glowing-stone': 'Glowing Stone',
      'ember-core': 'Ember Core',
      'song-seed': 'Song Seed',
      'moonstone-fragment': 'Moonstone Fragment',
      'charged-rod': 'Charged Rod',
      'star-fragment': 'Star Fragment'
    };
    
    const itemName = itemNames[textureKey] || textureKey;
    
    // Don't add duplicates
    if (this.collectedItemNames.includes(itemName)) {
      return;
    }
    
    this.collectedItemNames.push(itemName);
    
    // Clear and rebuild the list
    this.updateCollectedItemsList();
  }

  /**
   * Update the collected items text list
   */
  private updateCollectedItemsList(): void {
    // Remove existing list items
    const existingItems = this.collectionContainer.list.filter((child: any) => 
      child.getData && child.getData('isListItem')
    );
    existingItems.forEach((item: any) => item.destroy());
    
    if (this.collectedItemNames.length === 0) {
      return;
    }
    
    // Create text list
    const labelHeight = 16;
    const lineHeight = 14;
    const startY = labelHeight + 5;
    
    this.collectedItemNames.forEach((itemName, index) => {
      const y = startY + (index * lineHeight);
      
      // Bullet point
      const bullet = this.scene.add.text(0, y, '•', {
        fontSize: '10px',
        color: '#FFD700',
        fontFamily: 'Arial, sans-serif'
      });
      bullet.setData('isListItem', true);
      this.collectionContainer.add(bullet);
      
      // Item name
      const text = this.scene.add.text(8, y, itemName, {
        fontSize: '10px',
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif'
      });
      text.setData('isListItem', true);
      this.collectionContainer.add(text);
    });
  }

  /**
   * Clear all collected items (for reset/reload)
   */
  public clearCollectedItems(): void {
    // Remove list items
    const existingItems = this.collectionContainer.list.filter((child: any) => 
      child.getData && child.getData('isListItem')
    );
    existingItems.forEach((item: any) => item.destroy());
    
    this.collectedItemCount = 0;
    this.collectedItemNames = [];
  }

  /**
   * Update UI to reflect current progress
   */
  update(): void {
    const badgeCount = questState.getBadgeCount();
    
    // Update text
    if (this.progressText) {
      this.progressText.setText(`Star Walker Journey: ${badgeCount}/5 Islands`);
    }

    // Update badge icons
    Object.values(ISLANDS).forEach((island, index) => {
      const islandNum = index + 1;
      const islandQuest = questState.getIsland(islandNum);
      const badge = this.badgeIcons[index];

      if (islandQuest.badgeEarned && !badge.getData('earned')) {
        // Mark as earned with color
        const color = badge.getData('color');
        badge.clear();
        badge.lineStyle(2, 0xffffff, 1);
        badge.fillStyle(color, 1);
        
        const startX = 600 + (index * 45);
        const startY = 550;
        const points = this.getStarPoints(startX, startY, 5, 15, 7);
        badge.beginPath();
        badge.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          badge.lineTo(points[i].x, points[i].y);
        }
        badge.closePath();
        badge.fillPath();
        badge.strokePath();

        badge.setData('earned', true);

        // Add glow effect
        this.scene.tweens.add({
          targets: badge,
          alpha: 0.6,
          duration: 500,
          yoyo: true,
          repeat: 3
        });
      }
    });
  }

  /**
   * Show badge earned animation
   */
  showBadgeEarned(islandNum: number): void {
    const badge = this.badgeIcons[islandNum - 1];
    if (!badge) return;

    // Pulse animation
    this.scene.tweens.add({
      targets: badge,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      yoyo: true,
      repeat: 1,
      ease: 'Back.easeOut'
    });

    // Show text
    const badgeName = badge.getData('name');
    const text = this.scene.add.text(
      400,
      300,
      `🌟 ${badgeName} Badge Earned! 🌟`,
      {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: 'Arial, sans-serif',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    text.setOrigin(0.5);
    text.setDepth(200);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: 250,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.container.destroy();
  }
}
