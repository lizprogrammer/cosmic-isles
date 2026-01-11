import type { Metadata } from "next"
import GameClientPage from "./(client)/page"

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
  return <GameClientPage />
}
