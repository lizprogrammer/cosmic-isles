import * as Phaser from 'phaser';

/**
 * Procedural Asset Generator - Enhanced
 * Generates environment assets with texture and shading.
 */
export class AssetGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public generateGlobalAssets(): void {
    this.createParticleTexture();
  }

  // --- ISLAND 1: Crystal Isle ---
  public generateIsland1Assets(): void {
    // Crystals (Faceted with highlights)
    this.generateCrystalTexture('crystal-small', 0x00ffff);
  }

  // --- ISLAND 2: Ember Forge ---
  public generateIsland2Assets(): void {
    // Magma Pool (Animated looking texture)
    this.generateMagmaPool('magma-pool');
  }

  // --- ISLAND 3: Whispering Grove ---
  public generateIsland3Assets(): void {
    // Ancient Tree (Massive, organic)
    this.generateAncientTree('tree-ancient');
  }

  // --- ISLAND 4: Tide Observatory ---
  public generateIsland4Assets(): void {
    // Observatory (Stone/Metal texture)
    this.generateObservatory('observatory');
  }

  // --- ISLAND 5: Storm Spire ---
  public generateIsland5Assets(): void {
    // Lightning Rod (Metallic with coil)
    this.generateLightningRod('spire-rod');
  }

  public generateStarSanctumAssets(): void {
    // No specific assets needed
  }

  // --- CORE GENERATORS ---

  private createParticleTexture(): void {
    if (this.scene.textures.exists('pixel')) return;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(0xffffff);
    gfx.fillRect(0, 0, 1, 1);
    gfx.generateTexture('pixel', 1, 1);
  }

  /**
   * Generates a glowing alien flower.
   */
  private generateAlienFlower(key: string): void {
    if (this.scene.textures.exists(key)) return;
    const w = 32;
    const h = 32;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // Stem
    gfx.lineStyle(2, 0x00ff00, 1);
    gfx.moveTo(w/2, h);
    gfx.lineTo(w/2, h-10);
    gfx.strokePath();

    // Petals
    gfx.fillStyle(0xff00ff, 1);
    gfx.fillCircle(w/2 - 5, h/2, 5);
    gfx.fillCircle(w/2 + 5, h/2, 5);
    gfx.fillCircle(w/2, h/2 - 5, 5);
    gfx.fillCircle(w/2, h/2 + 5, 5);

    // Center
    gfx.fillStyle(0xffff00, 1);
    gfx.fillCircle(w/2, h/2, 3);

    gfx.generateTexture(key, w, h);
  }

  /**
   * Generates a tiled terrain texture with noise for a natural look.
   */
  private generateTerrainTexture(key: string, baseColor: number, accentColor: number): void {
    if (this.scene.textures.exists(key)) return;

    const width = 800;
    const height = 600;
    const canvas = this.scene.textures.createCanvas(key, width, height);
    if (!canvas) return;

    const ctx = canvas.getContext();
    
    // 1. Base Fill
    ctx.fillStyle = `#${baseColor.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, width, height);

    // 2. Add Noise/Texture
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      ctx.fillStyle = `#${accentColor.toString(16).padStart(6, '0')}`;
      ctx.globalAlpha = 0.15; // Subtle texture
      ctx.fillRect(x, y, size, size);
    }

    // 3. Vignette for depth
    const grad = ctx.createRadialGradient(400, 300, 100, 400, 300, 600);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, width, height);

    canvas.refresh();
  }

  /**
   * Generates a crystalline tree with sharp angles.
   */
  private generateCrystallineTree(key: string, leafColor: number, trunkColor: number): void {
    if (this.scene.textures.exists(key)) return;
    
    const w = 120;
    const h = 180;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Trunk (Crystal jagged shape)
    gfx.fillStyle(trunkColor, 1);
    gfx.beginPath();
    gfx.moveTo(w/2 - 15, h);
    gfx.lineTo(w/2 + 15, h);
    gfx.lineTo(w/2 + 10, h/2);
    gfx.lineTo(w/2 - 10, h/2);
    gfx.closePath();
    gfx.fillPath();

    // Leaves (Sharp Triangles)
    gfx.fillStyle(leafColor, 0.9);
    
    // Bottom Tier
    gfx.fillTriangle(w/2, h/4, w/2 - 40, h/2 + 20, w/2 + 40, h/2 + 20);
    
    // Middle Tier
    gfx.fillStyle(leafColor, 1.0); // Slightly brighter
    gfx.fillTriangle(w/2, h/6, w/2 - 30, h/2 - 10, w/2 + 30, h/2 - 10);
    
    // Top Tier
    gfx.fillStyle(0xFFFFFF, 0.4); // Highlight
    gfx.fillTriangle(w/2, 0, w/2 - 20, h/3, w/2 + 20, h/3);

    gfx.generateTexture(key, w, h);
  }

  /**
   * Generates a faceted crystal.
   */
  private generateCrystalTexture(key: string, color: number): void {
    if (this.scene.textures.exists(key)) return;
    const size = 48; // Slightly larger base
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });
    
    // Diamond Shape
    // Top Triangle (Lighter)
    gfx.fillStyle(0xffffff, 0.9);
    gfx.beginPath();
    gfx.moveTo(size/2, 0);       // Top tip
    gfx.lineTo(size, size*0.3);  // Right side
    gfx.lineTo(0, size*0.3);     // Left side
    gfx.closePath();
    gfx.fillPath();

    // Bottom Triangle (Main Color)
    gfx.fillStyle(color, 0.8);
    gfx.beginPath();
    gfx.moveTo(0, size*0.3);     // Left side
    gfx.lineTo(size, size*0.3);  // Right side
    gfx.lineTo(size/2, size);    // Bottom tip
    gfx.closePath();
    gfx.fillPath();
    
    // Central Facet (Darker/Shaded)
    gfx.fillStyle(color, 0.5);
    gfx.beginPath();
    gfx.moveTo(size*0.2, size*0.3);
    gfx.lineTo(size*0.8, size*0.3);
    gfx.lineTo(size/2, size*0.8);
    gfx.closePath();
    gfx.fillPath();

    // Shine/Sparkle
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(size/2, size*0.15, 3);
    gfx.fillCircle(size*0.3, size*0.4, 2);

    gfx.generateTexture(key, size, size);
  }

  /**
   * Generates a massive organic tree.
   */
  private generateAncientTree(key: string): void {
    if (this.scene.textures.exists(key)) return;
    const w = 200;
    const h = 250;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // Trunk
    gfx.fillStyle(0x5d4037, 1);
    gfx.fillRect(w/2 - 25, h - 80, 50, 80);

    // Foliage Cloud (Multiple circles)
    gfx.fillStyle(0x2e7d32, 1);
    gfx.fillCircle(w/2, h/2 - 20, 60);
    gfx.fillCircle(w/2 - 40, h/2 + 10, 40);
    gfx.fillCircle(w/2 + 40, h/2 + 10, 40);
    gfx.fillCircle(w/2, h/2 - 70, 40);

    // Highlights
    gfx.fillStyle(0x66bb6a, 0.5);
    gfx.fillCircle(w/2 - 20, h/2 - 40, 20);
    gfx.fillCircle(w/2 + 20, h/2, 15);

    gfx.generateTexture(key, w, h);
  }

  /**
   * Generates a hot magma pool.
   */
  private generateMagmaPool(key: string): void {
    if (this.scene.textures.exists(key)) return;
    const w = 100;
    const h = 60;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // Outer Rock Rim
    gfx.fillStyle(0x3e2723, 1);
    gfx.fillEllipse(w/2, h/2, w, h);

    // Inner Lava
    gfx.fillStyle(0xd50000, 1);
    gfx.fillEllipse(w/2, h/2, w-20, h-20);

    // Hot Center
    gfx.fillStyle(0xff6d00, 1);
    gfx.fillEllipse(w/2, h/2, w-50, h-40);

    gfx.generateTexture(key, w, h);
  }

  /**
   * Generates a stone structure.
   */
  private generateForgeStructure(key: string): void {
    if (this.scene.textures.exists(key)) return;
    const w = 100;
    const h = 100;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // Stone Base
    gfx.fillStyle(0x424242, 1);
    gfx.fillRect(10, 40, 80, 60);

    // Furnace Opening
    gfx.fillStyle(0x212121, 1); // Dark hole
    gfx.fillCircle(50, 70, 20);
    
    // Fire inside
    gfx.fillStyle(0xff5722, 1);
    gfx.fillCircle(50, 75, 15);

    // Chimney
    gfx.fillStyle(0x616161, 1);
    gfx.fillRect(30, 0, 40, 40);

    gfx.generateTexture(key, w, h);
  }

  private generateObservatory(key: string): void {
    if (this.scene.textures.exists(key)) return;
    const w = 120;
    const h = 120;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // Dome
    gfx.fillStyle(0xe0e0e0, 1);
    gfx.fillCircle(60, 60, 50);
    
    // Slit
    gfx.fillStyle(0x424242, 1);
    gfx.fillRect(55, 15, 10, 80);

    // Base
    gfx.fillStyle(0x9e9e9e, 1);
    gfx.fillRect(20, 90, 80, 30);

    gfx.generateTexture(key, w, h);
  }

  private generateLightningRod(key: string): void {
    if (this.scene.textures.exists(key)) return;
    const w = 40;
    const h = 120;
    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // Base
    gfx.fillStyle(0x607d8b, 1);
    gfx.fillRect(10, 80, 20, 40);

    // Rod
    gfx.fillStyle(0xb0bec5, 1);
    gfx.fillRect(15, 20, 10, 80);

    // Orb at top
    gfx.fillStyle(0x0288d1, 1);
    gfx.fillCircle(20, 20, 12);
    
    // Shine
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(16, 16, 4);

    gfx.generateTexture(key, w, h);
  }
}
