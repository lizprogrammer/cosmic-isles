import { NextResponse } from "next/server";

/**
 * NFT Metadata Endpoint
 * Returns ERC-721 compliant metadata for Farcaster collectables
 * 
 * This endpoint is called by Farcaster/OpenSea when viewing the NFT
 * Format: /api/nft/[tokenId]
 * 
 * Farcaster will call: https://your-domain.com/api/nft/1
 * Based on contract's tokenURI() which returns: https://your-domain.com/api/nft/1
 */
export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  try {
    const tokenId = params.tokenId;
    
    // TODO: In production, retrieve actual metadata from database
    // For now, return template metadata that follows ERC-721 standard
    
    // Get base URL for images
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farcaster.xyz/miniapps/Hys_Qc3Q5KF_/cosmic-isles';
    
    const metadata = {
      // Required ERC-721 fields
      name: `Cosmic Isles Badge #${tokenId}`,
      description: "🌟 A legendary achievement NFT from Cosmic Isles! The Shattered Star has been reforged through completing all 3 island quests. This NFT represents mastery of the Cosmic Isles adventure.",
      image: `${baseUrl}/sprites/star-fragment.png`, // Full URL to image
      external_url: `${baseUrl}`, // Link back to game
      
      // Attributes for Farcaster/OpenSea display
      attributes: [
        {
          trait_type: "Achievement",
          value: "Star Reforged"
        },
        {
          trait_type: "Quest Status",
          value: "Complete"
        },
        {
          trait_type: "Islands Completed",
          value: "3/3"
        },
        {
          trait_type: "Badges Earned",
          value: "3"
        },
        {
          trait_type: "Rarity",
          value: "Epic"
        },
        {
          trait_type: "Game",
          value: "Cosmic Isles"
        }
      ],
      
      // Additional OpenSea/Farcaster fields
      background_color: "0a0a1a", // Dark blue background
      animation_url: null,
      youtube_url: null
    };
    
    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow Farcaster to fetch
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error("NFT metadata error:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFT metadata" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
