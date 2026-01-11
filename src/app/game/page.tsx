import type { Metadata } from "next"
import GameClientPage from "./client-page"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  // FRAME METADATA — forces Next.js to emit property="fc:frame"
  other: {
    "fc:frame": { value: "vNext" },
    "fc:frame:image": { value: "https://cosmic-isles.vercel.app/splash.png" },
    "fc:frame:button:1": { value: "Play Game" },
    "fc:frame:button:1:action": { value: "link" },
    "fc:frame:button:1:target": { value: "https://cosmic-isles.vercel.app/game" },
  },

  // OVERRIDE inherited OG/Twitter metadata so /game is treated as a frame
  openGraph: {
    title: undefined,
    description: undefined,
    url: undefined,
    images: undefined,
  },
  twitter: {
    card: undefined,
    title: undefined,
    description: undefined,
    images: undefined,
  },
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
