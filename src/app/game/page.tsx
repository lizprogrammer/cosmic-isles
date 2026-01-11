import type { Metadata } from "next"
import GameClientPage from "./client-page"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Frame metadata (required for embed)
export const metadata: Metadata = {
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://cosmic-isles.vercel.app/splash.png",
    "fc:frame:button:1": "Play Game",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://cosmic-isles.vercel.app/game",
  }
}

export default function GamePage() {
  // Prevent tree-shaking and ensure server wrapper runs
  console.log("SERVER WRAPPER LOADED")

  // Call ready as early as possible (before hydration)
  Promise.resolve().then(async () => {
    try {
      const { sdk } = await import("@farcaster/frame-sdk")
      await sdk.actions.ready()
      console.log("SDK ready called from server wrapper")
    } catch (err) {
      console.error("SDK ready failed in server wrapper", err)
    }
  })

  return (
    <div>
      <GameClientPage />
    </div>
  )
}
