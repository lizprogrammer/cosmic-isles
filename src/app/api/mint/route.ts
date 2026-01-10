import { NextResponse } from "next/server";
import { mintBadge } from "../../../lib/mint";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const tx = await mintBadge({
      name: body.name || "Cosmic Explorer Badge — Island One",
      attributes: {
        island: body.island || "Cosmic Isles — Island One",
        rarity: body.rarity || "Common",
        questCompleted: true,
        timestamp: Date.now(),
      },
    });
    
    return NextResponse.json({ success: true, tx });
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
    const tx = await mintBadge({
      name: "Cosmic Explorer Badge — Island One",
      attributes: {
        island: "Cosmic Isles — Island One",
        rarity: "Common",
        questCompleted: true,
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
