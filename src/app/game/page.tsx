import type { Metadata } from "next"
import GameClientPage from "./client-page"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://cosmic-isles.vercel.app/splash.png",
    "fc:frame:button:1": "Play Game",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://cosmic-isles.vercel.app/game",
  },

  // Stop inheriting homepage OG/Twitter on /game
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
  console.log("SERVER WRAPPER LOADED")

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
