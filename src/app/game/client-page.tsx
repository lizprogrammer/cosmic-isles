"use client"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Call Farcaster ready using the installed npm package (non-blocking)
    import("@farcaster/miniapp-sdk").then(({ sdk }) => {
      sdk.actions.ready().catch(err => console.error('SDK ready error:', err));
      console.log('✅ Farcaster SDK ready called!');
    }).catch(err => console.error('SDK import error:', err));
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initGame = async () => {
      try {
        console.log("📦 Step 1/4: Loading Phaser engine...");
        const Phaser = await import("phaser")
        console.log("✅ Phaser loaded");
        
        console.log("📦 Step 2/4: Loading game config...");
        const { config } = await import("../../game/config")
        console.log("✅ Config loaded");
        
        console.log("📦 Step 3/4: Creating Phaser game instance...");
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
        console.log("✅ Step 4/4: Game instance created!");
        console.log("🎮 Game fully initialized - Boot scene should start now");
        
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

  // Always render game container immediately (no loading screen)
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
