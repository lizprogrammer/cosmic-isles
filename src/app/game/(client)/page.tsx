"use client"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load and call SDK ready immediately
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'module';
      script.innerHTML = `
        import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
        try {
          await sdk.actions.ready();
          console.log('✅ Farcaster SDK ready called successfully!');
        } catch (error) {
          console.error('❌ Error calling ready:', error);
        }
      `;
      document.head.appendChild(script);
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initGame = async () => {
      try {
        // Small delay to ensure SDK is ready
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log("Initializing game...");
        
        // Load Phaser
        const Phaser = await import("phaser")
        const { config } = await import("../../../game/config")
        
        const game = new Phaser.Game(config)
        console.log("Game initialized!");
        
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
