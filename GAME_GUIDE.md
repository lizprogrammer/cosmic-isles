# 🌌 COSMIC ISLES - Complete Game Guide

## Overview

**Cosmic Isles** is a Farcaster mini-app adventure game where players journey through 5 unique islands to reforge the Shattered Star. Each island presents unique quests and mechanics, culminating in an NFT achievement badge.

---

## 🎮 Game Flow

### Main Menu
- **New Game**: Start fresh adventure (resets progress)
- **Continue**: Resume from last saved island
- Auto-save every 30 seconds

### Avatar Creator
- Customize your Star Walker:
  - Body color (blue/green)
  - Outfit (3 styles)
  - Accessories (antenna/glasses/hat)

---

## 🏝️ The Five Islands

### **Island 1: Crystal Isle** 🔮
**Quest**: Restore the dormant crystal

**Objective**: Collect 3 crystal shards scattered across the island and deliver them to the wizard.

**Mechanics**:
- Drag your character to move
- Walk near glowing crystals to collect them
- Talk to NPCs for hints
- Deliver all 3 shards to the wizard

**Badge Earned**: Crystal Keeper

---

### **Island 2: Ember Forge** 🔥
**Quest**: Recapture the flame spirit

**Objective**: Touch 3 flame vents to summon the flame spirit, then lead it to the forge.

**Mechanics**:
- Tap glowing flame vents to activate them
- Once all 3 are activated, the flame spirit appears
- The spirit follows your character
- Lead it to the forge (right side of screen)

**Badge Earned**: Flame Tamer

---

### **Island 3: Whispering Grove** 🌳
**Quest**: Awaken the Ancient Tree

**Objective**: Find 3 song seeds and plant them around the sleeping Ancient Tree.

**Mechanics**:
- Collect 3 glowing song seeds
- Walk to the planting spots (circles around the tree)
- Seeds auto-plant when you're close enough
- Tree awakens when all 3 are planted

**Badge Earned**: Grove Guardian

---

### **Island 4: Tide Observatory** 🌊
**Quest**: Restore the tidal system

**Objective**: Rescue 3 stranded sea creatures, then align the moonstone dial.

**Mechanics**:
- **Part 1**: Drag sea creatures to water pools
  - Fish, crab, and starfish need rescuing
  - Drag each to any blue water pool
- **Part 2**: Align the moonstone
  - Tap the 3 sectors around the moonstone dial
  - All 3 must be aligned to complete

**Badge Earned**: Tidecaller

---

### **Island 5: Storm Spire** ⚡
**Quest**: Stabilize the lightning core

**Objective**: Touch 3 lightning rods when they pulse blue (timing challenge).

**Mechanics**:
- Watch for lightning rods to glow blue
- Tap them quickly while they're pulsing
- Miss the timing? Try again!
- Complete all 3 to stabilize the core

**Badge Earned**: Stormbinder

---

## ⭐ Meta Quest: The Shattered Star

**Unlocked**: After completing all 5 islands

**Reward**: Access to the Star Sanctum

### Star Sanctum
- Witness the star fragments reunite
- View your completion stats:
  - Total badges earned
  - Completion time
  - Completion speed (fast/normal/exploratory)
- Mint your achievement NFT

---

## 🎨 NFT Minting

### NFT Metadata Includes:
- **Achievement**: "Star Reforged" (all islands) or individual badges
- **All 5 Badges**: Crystal Keeper, Flame Tamer, Grove Guardian, Tidecaller, Stormbinder
- **Completion Stats**: Time, speed, player name
- **Avatar Data**: Body color, outfit, accessory
- **Rarity Tiers**:
  - **Legendary**: Complete in < 15 minutes
  - **Epic**: Complete in < 25 minutes OR all 5 badges
  - **Rare**: 3+ badges
  - **Common**: Any completion

### Minting Process:
1. Complete all 5 islands
2. Enter Star Sanctum
3. Click "Mint Your Achievement NFT"
4. View NFT preview with metadata
5. Click "MINT NFT" button
6. NFT is minted to your Farcaster wallet

---

## 🎯 Controls

### Desktop
- **Arrow Keys**: Move character
- **Mouse Click**: Interact with NPCs/objects
- **Mouse Drag**: Alternative movement

### Mobile
- **Drag**: Move character
- **Tap**: Interact with NPCs/objects
- **Tap & Hold**: Continuous movement

### Universal
- **ESC Key** (desktop): Pause menu
- **Pause Menu**: Save game, return to main menu

---

## 💾 Save System

### Auto-Save
- Automatically saves every 30 seconds
- Saves on island completion
- Saves when using pause menu

### Saved Data Includes:
- Current island progress
- Quest completion status
- Badges earned
- Avatar customization
- Play time

### Manual Save
- Open pause menu (ESC)
- Click "Save Game"

---

## 🏆 Completion Speeds

- **Fast**: < 15 minutes (Legendary NFT)
- **Normal**: 15-25 minutes (Epic NFT)
- **Exploratory**: > 25 minutes (Rare/Common NFT)

---

## 🔧 Technical Details

### Built With
- **Phaser 3**: Game engine
- **Next.js**: Web framework
- **TypeScript**: Type-safe development
- **Farcaster SDK**: Mini-app integration
- **Supabase**: Progress tracking
- **NFT Minting**: On-chain achievements

### Farcaster Integration
- Fully compatible with Farcaster mini-app spec
- Calls `sdk.actions.ready()` on load
- Manifest at `.well-known/farcaster.json`
- Responsive design for mobile frames

---

## 🎨 Game Architecture

### Core Systems
- **Quest State Manager**: Tracks all 5 island quests
- **Game State**: Overall progress and meta quest
- **Player State**: Avatar and inventory
- **Auto-Save**: Persistent progress
- **Dialogue Manager**: NPC conversations and hints
- **Progress UI**: Badge tracker overlay
- **Collectible System**: Reusable item collection

### Scene Flow
```
Boot → MainMenu → AvatarCreator → Island1 → Island2 → Island3 → Island4 → Island5 → StarSanctum → MintScreen
```

---

## 🐛 Troubleshooting

### Character won't move on mobile
- Ensure you're dragging, not just tapping
- Try dragging from different areas
- Check that touch-action: none is applied

### Can't collect items
- Walk closer to the glowing object
- Items auto-collect when within range
- Some items require clicking after getting close

### Progress not saving
- Check browser localStorage is enabled
- Auto-save runs every 30 seconds
- Manually save via pause menu

### NFT mint fails
- Ensure all 5 islands are complete
- Check wallet connection
- Try again from Star Sanctum

---

## 📱 Farcaster Deployment

### Requirements
1. Manifest at `/.well-known/farcaster.json`
2. Responsive design (320px - 1920px)
3. Touch-optimized controls
4. `sdk.actions.ready()` called on mount

### Testing
- Test on Farcaster mobile app
- Verify touch controls work
- Check NFT minting flow
- Validate manifest accessibility

---

## 🎮 Tips for Players

1. **Talk to NPCs** - They provide helpful hints
2. **Explore thoroughly** - Collectibles are scattered
3. **Watch for glows** - Interactive objects pulse/glow
4. **Be patient** - Some quests require timing
5. **Save often** - Use pause menu to manual save
6. **Speed matters** - Fast completion = better NFT rarity

---

## 🌟 Credits

- **Game Design**: Full 5-island narrative adventure
- **Art**: Cosmic-themed pixel art
- **Platform**: Farcaster mini-app
- **Technology**: Phaser 3 + Next.js + TypeScript

---

**Enjoy your journey through the Cosmic Isles! May you reforge the Shattered Star! ⭐**
