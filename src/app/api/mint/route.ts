import { NextResponse } from "next/server";
import { mintBadge } from "../../../lib/mint";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Enhanced metadata for complete game
    const badges = body.badges || [];
    const badgeList = badges.join(', ') || 'Star Reforged';
    const completionSpeed = body.completionSpeed || 'normal';
    const playTime = body.completionTime || 0;
    
    // Determine rarity based on completion speed
    let rarity = 'Common';
    if (completionSpeed === 'fast' && playTime < 15) {
      rarity = 'Legendary';
    } else if (completionSpeed === 'fast' || badges.length === 5) {
      rarity = 'Epic';
    } else if (badges.length >= 3) {
      rarity = 'Rare';
    }
    
    const tx = await mintBadge({
      name: body.allQuestsComplete 
        ? "Cosmic Isles — Star Reforged" 
        : `Cosmic Isles — ${badges[badges.length - 1] || 'Explorer'}`,
      attributes: {
        achievement: body.allQuestsComplete ? 'All Islands Complete' : 'In Progress',
        badges: badgeList,
        islands_completed: badges.length,
        completion_time_minutes: playTime,
        completion_speed: completionSpeed,
        player_name: body.playerName || 'Star Walker',
        avatar_body: body.avatar?.bodyColor || 'blue',
        avatar_outfit: body.avatar?.outfit || 'default',
        avatar_accessory: body.avatar?.accessory || 'none',
        rarity: rarity,
        quest_completed: body.allQuestsComplete || false,
        timestamp: body.timestamp || Date.now(),
      },
    });
    
    return NextResponse.json({ success: true, tx, rarity });
  } catch (e) {
    console.error("Minting error:", e);
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Default mint for testing
    const tx = await mintBadge({
      name: "Cosmic Isles — Star Reforged",
      attributes: {
        achievement: 'All Islands Complete',
        badges: 'Crystal Keeper, Flame Tamer, Grove Guardian, Tidecaller, Stormbinder',
        islands_completed: 5,
        completion_time_minutes: 20,
        completion_speed: 'normal',
        player_name: 'Star Walker',
        rarity: 'Epic',
        quest_completed: true,
        timestamp: Date.now(),
      },
    });
    
    return NextResponse.json({ success: true, tx });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}
