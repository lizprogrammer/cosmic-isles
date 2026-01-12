"use client"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Call Farcaster ready using the installed npm package
    const callReady = async () => {
      try {
        const { sdk } = await import("@farcaster/frame-sdk");
        await sdk.actions.ready();
        console.log('✅ Farcaster SDK ready called!');
      } catch (error) {
        console.error('❌ SDK ready error:', error);
      }
    };
    
    callReady();
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initGame = async () => {
      try {
        // Small delay to ensure SDK finished calling ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log("Initializing game...");
        
        // Load Phaser
        const Phaser = await import("phaser")
        const { config } = await import("../../game/config")
        
        // Override config for responsive sizing
        const responsiveConfig = {
          ...config,
          scale: {
            mode: Phaser.Scale.RESIZE,
            width: '100%',
            height: '100%',
            autoCenter: Phaser.Scale.NO_CENTER
          }
        };

        const game = new Phaser.Game(responsiveConfig)
        console.log("🎮 Game initialized!");
        
        return () => game.destroy(true)
      } catch (error) {
        console.error("❌ Game init error:", error)
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
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    />
  )
}
