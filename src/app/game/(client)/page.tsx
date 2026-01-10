"use client"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load Farcaster SDK module
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/farcaster-init.js';
      document.head.appendChild(script);
      console.log('Loading Farcaster SDK module...');
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initGame = async () => {
      try {
        // Wait for SDK to be ready (max 3 seconds)
        let attempts = 0;
        while (!(window as any).farcasterReady && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if ((window as any).farcasterReady) {
          console.log("✅ SDK ready, initializing game...");
        } else {
          console.warn("⚠️ SDK not ready after 3s, starting game anyway...");
        }
        
        // Load Phaser
        const Phaser = await import("phaser")
        const { config } = await import("../../../game/config")
        
        const game = new Phaser.Game(config)
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
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000"
      }}
    />
  )
}
