"use client"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initGame = async () => {
      try {
        // Initialize Farcaster SDK FIRST
        const { initFarcaster } = await import("../../../lib/farcaster")
        await initFarcaster()
        
        // Small delay to ensure SDK is fully ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Then load Phaser
        const Phaser = await import("phaser")
        const { config } = await import("../../../game/config")
        
        const game = new Phaser.Game(config)
        
        return () => game.destroy(true)
      } catch (error) {
        console.error("Game init error:", error)
      }
    }
    
    let cleanup: (() => void) | undefined
    
    initGame().then(cleanupFn => {
      cleanup = cleanupFn
    })
    
    return () => {
      if (cleanup) cleanup()
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff"
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      id="game"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000"
      }}
    />
  )
}
