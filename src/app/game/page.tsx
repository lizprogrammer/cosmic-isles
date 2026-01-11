import GameClientPage from "./client-page"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"
export const runtime = "nodejs"

// Force this route to remain a server component
export const metadata = {}

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
