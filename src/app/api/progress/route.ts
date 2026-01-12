import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Enhanced progress tracking for all 5 islands
    const { data, error } = await supabase
      .from("progress")
      .insert({
        island_number: body.islandNum || 1,
        quest_completed: body.completed || false,
        badge_earned: body.badgeEarned || false,
        timestamp: body.timestamp || new Date().toISOString(),
        player_id: body.playerId || null, // Could link to Farcaster ID
      });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("Progress API error:", e);
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}
