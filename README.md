# 🌌 Cosmic Isles - Farcaster Mini App

A complete 5-island adventure game built as a Farcaster mini-app. Journey through unique quests to reforge the Shattered Star and mint your achievement as an NFT.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to play.

## 📁 Project Structure

```
cosmic-isles/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/
│   │   │   ├── mint/          # NFT minting endpoint
│   │   │   └── progress/      # Progress tracking endpoint
│   │   ├── game/              # Game page
│   │   ├── layout.tsx         # Root layout with Farcaster manifest
│   │   └── page.tsx           # Landing page
│   ├── game/                  # Phaser game code
│   │   ├── components/        # Reusable game components
│   │   │   ├── Collectible.ts
│   │   │   ├── DialogueManager.ts
│   │   │   ├── ProgressUI.ts
│   │   │   └── PauseMenu.ts
│   │   ├── scenes/            # Game scenes
│   │   │   ├── Boot.ts
│   │   │   ├── MainMenu.ts
│   │   │   ├── AvatarCreator.ts
│   │   │   ├── Island1.ts     # Crystal Isle
│   │   │   ├── Island2.ts     # Ember Forge
│   │   │   ├── Island3.ts     # Whispering Grove
│   │   │   ├── Island4.ts     # Tide Observatory
│   │   │   ├── Island5.ts     # Storm Spire
│   │   │   ├── StarSanctum.ts # Meta quest completion
│   │   │   └── MintScreen.ts  # NFT minting UI
│   │   ├── state/             # Game state management
│   │   │   ├── PlayerState.ts
│   │   │   ├── QuestState.ts
│   │   │   └── GameState.ts
│   │   ├── utils/             # Utilities
│   │   │   ├── constants.ts
│   │   │   ├── storage.ts
│   │   │   └── autosave.ts
│   │   ├── config.ts          # Phaser configuration
│   │   └── main.ts            # Game initialization
│   └── lib/                   # Shared libraries
│       ├── farcaster.ts       # Farcaster SDK integration
│       ├── mint.ts            # NFT minting logic
│       ├── supabase.ts        # Database client
│       └── types.ts           # TypeScript types
├── public/                    # Static assets
│   ├── rooms/                 # Background images
│   ├── sprites/               # Character/NPC sprites
│   └── splash.png            # Main menu background
└── GAME_GUIDE.md             # Player-facing documentation
```

## 🎮 Game Architecture

### Core Systems

#### Quest State Manager (`QuestState.ts`)
- Tracks progress for all 5 islands
- Manages badge earning
- Handles meta quest completion
- Saves progress to API

#### Game State (`GameState.ts`)
- Overall game progression
- Play time tracking
- Completion speed calculation
- Meta quest status

#### Player State (`PlayerState.ts`)
- Avatar customization
- Inventory management
- Player name/identity

#### Auto-Save System (`autosave.ts`)
- Saves every 30 seconds
- LocalStorage persistence
- Manual save via pause menu
- Continue game functionality

### Game Flow

```
Boot Scene
    ↓
Main Menu (New Game / Continue)
    ↓
Avatar Creator
    ↓
Island 1 (Crystal Isle) → Badge 1
    ↓
Island 2 (Ember Forge) → Badge 2
    ↓
Island 3 (Whispering Grove) → Badge 3
    ↓
Island 4 (Tide Observatory) → Badge 4
    ↓
Island 5 (Storm Spire) → Badge 5
    ↓
Star Sanctum (Meta Quest Complete)
    ↓
Mint Screen → NFT Achievement
```

## 🏝️ Island Quests

### Island 1: Crystal Isle
- **Mechanic**: Collect & Deliver
- **Objective**: Find 3 crystal shards, deliver to wizard
- **Badge**: Crystal Keeper

### Island 2: Ember Forge
- **Mechanic**: Sequential Interaction + Follow
- **Objective**: Activate 3 vents, lead flame spirit to forge
- **Badge**: Flame Tamer

### Island 3: Whispering Grove
- **Mechanic**: Collect & Plant
- **Objective**: Find 3 song seeds, plant around Ancient Tree
- **Badge**: Grove Guardian

### Island 4: Tide Observatory
- **Mechanic**: Drag & Drop + Puzzle
- **Objective**: Rescue 3 sea creatures, align moonstone dial
- **Badge**: Tidecaller

### Island 5: Storm Spire
- **Mechanic**: Timing Challenge
- **Objective**: Touch 3 lightning rods when they pulse blue
- **Badge**: Stormbinder

## 🎨 NFT System

### Metadata Structure
```typescript
{
  name: "Cosmic Isles — Star Reforged",
  attributes: {
    achievement: "All Islands Complete",
    badges: "Crystal Keeper, Flame Tamer, ...",
    islands_completed: 5,
    completion_time_minutes: 20,
    completion_speed: "normal",
    player_name: "Star Walker",
    avatar_body: "blue",
    avatar_outfit: "outfit-1",
    avatar_accessory: "antenna",
    rarity: "Epic",
    quest_completed: true,
    timestamp: 1234567890
  }
}
```

### Rarity Tiers
- **Legendary**: < 15 minutes
- **Epic**: < 25 minutes OR all 5 badges
- **Rare**: 3+ badges
- **Common**: Any completion

## 🔌 API Endpoints

### POST `/api/mint`
Mint achievement NFT with game completion data.

**Request Body:**
```json
{
  "playerName": "Star Walker",
  "avatar": {
    "bodyColor": "blue",
    "outfit": "outfit-1",
    "accessory": "antenna"
  },
  "badges": ["Crystal Keeper", "Flame Tamer", ...],
  "completionTime": 20,
  "completionSpeed": "normal",
  "allQuestsComplete": true,
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "tx": "0x...",
  "rarity": "Epic"
}
```

### POST `/api/progress`
Save island completion progress.

**Request Body:**
```json
{
  "islandNum": 1,
  "completed": true,
  "badgeEarned": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🎯 Farcaster Integration

### Manifest Configuration
Located at `/.well-known/farcaster.json`:
```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "frame": {
    "version": "1",
    "name": "Cosmic Isles",
    "iconUrl": "https://your-domain.com/icon.png",
    "homeUrl": "https://your-domain.com/game",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#000033"
  }
}
```

### SDK Integration
```typescript
import sdk from '@farcaster/frame-sdk';

// Signal ready state
await sdk.actions.ready();
```

## 📱 Mobile Optimization

### Touch Controls
- Drag to move character
- Tap to interact with objects/NPCs
- Optimized hit areas for mobile
- `touch-action: none` to prevent scrolling

### Responsive Design
- Scales from 320px to 1920px
- Phaser.Scale.FIT mode
- Auto-centers on all devices
- Touch-optimized UI elements

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Farcaster account (for testing mini-app)

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
WALLET_PRIVATE_KEY=your_wallet_private_key
```

### Adding New Islands
1. Create scene in `src/game/scenes/IslandX.ts`
2. Add to `config.ts` scene array
3. Update `QuestState.ts` with new island data
4. Add island constants to `constants.ts`
5. Update progression in previous island

### Testing Checklist
- [ ] Desktop keyboard controls work
- [ ] Mobile touch/drag works
- [ ] All 5 islands completable
- [ ] NPCs provide correct dialogue
- [ ] Collectibles spawn and collect properly
- [ ] Progress saves and loads
- [ ] Star Sanctum appears after Island 5
- [ ] NFT minting succeeds
- [ ] Farcaster manifest accessible
- [ ] Mobile responsive (320px+)

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Setup
1. Set environment variables in Vercel dashboard
2. Ensure `.well-known/farcaster.json` is accessible
3. Configure custom domain
4. Test in Farcaster mobile app

### Post-Deployment
1. Verify manifest at `https://your-domain.com/.well-known/farcaster.json`
2. Test game in Farcaster frame
3. Verify NFT minting works
4. Check mobile responsiveness

## 🎨 Asset Requirements

### Backgrounds (800x600)
- `rooms/roomA.png` - Islands 1, 4
- `rooms/roomB.png` - Islands 2, 5
- `rooms/roomC.png` - Islands 3, Star Sanctum

### Sprites
- `npc-guidebot.png` - Villager NPC
- `npc-starsage.png` - Wizard/Sage NPC
- `npc-villager.png` - Generic NPC
- Avatar parts in `sprites/avatar/`

### Icons
- `icon.png` - App icon (512x512)
- `splash.png` - Splash screen (800x600)

## 📊 Analytics & Tracking

### Tracked Metrics
- Island completion rates
- Average completion time
- Badge earn rates
- NFT mint success rate
- Drop-off points

### Supabase Schema
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY,
  island_number INT,
  quest_completed BOOLEAN,
  badge_earned BOOLEAN,
  timestamp TIMESTAMPTZ,
  player_id TEXT
);
```

## 🔒 Security

- Private keys stored in environment variables
- Client-side validation for game state
- Server-side verification for NFT minting
- Rate limiting on API endpoints
- Sanitized user inputs

## 🐛 Known Issues & Limitations

- LocalStorage limited to ~5-10MB
- No multiplayer support
- NFT minting requires wallet connection
- Mobile Safari may have touch input delays

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly (especially mobile)
5. Submit pull request

## 📞 Support

- Game Guide: See `GAME_GUIDE.md`
- Issues: GitHub Issues
- Farcaster: @cosmicisles

---

**Built with ❤️ for the Farcaster ecosystem**
