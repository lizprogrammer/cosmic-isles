"use client"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load SDK and call ready using a proper module
    if (typeof window !== 'undefined') {
      const moduleCode = `
        import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';
        (async () => {
          try {
            await sdk.actions.ready();
            console.log('✅ Farcaster SDK ready called!');
            window.farcasterReady = true;
          } catch (error) {
            console.error('❌ SDK ready error:', error);
          }
        })();
      `;
      
      const blob = new Blob([moduleCode], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      const script = document.createElement('script');
      script.type = 'module';
      script.src = url;
      document.head.appendChild(script);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initGame = async () => {
      try {
        // Wait for SDK to be ready
        let attempts = 0;
        while (!(window as any).farcasterReady && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
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
