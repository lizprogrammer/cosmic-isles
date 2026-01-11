import GameClientPage from "./client-page"

export const dynamic = "force-dynamic"
export const revalidate = 0

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
