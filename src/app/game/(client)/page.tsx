"use client"
import { useEffect, useState } from "react"
import Script from "next/script"

export const dynamic = 'force-dynamic'

export default function GameClientPage() {
  const [mounted, setMounted] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Call ready IMMEDIATELY on mount
    const callReady = async () => {
      try {
        console.log("Attempting to call ready...");
        
        // Try multiple ways to access the SDK
        if (typeof window !== 'undefined') {
          // Method 1: Direct window access
          // @ts-ignore
          if (window.sdk?.actions?.ready) {
            console.log("Found SDK on window, calling ready...");
            // @ts-ignore
            await window.sdk.actions.ready();
            console.log("Ready called successfully!");
            setSdkReady(true);
            return;
          }
          
          // Method 2: Import SDK
          try {
            const { default: sdk } = await import("@farcaster/frame-sdk");
            console.log("Imported SDK, calling ready...");
            await sdk.actions.ready();
            console.log("Ready called successfully!");
            setSdkReady(true);
            return;
          } catch (e) {
            console.log("Could not import SDK:", e);
          }
          
          // Method 3: Wait and retry
          console.log("SDK not found, waiting...");
          setTimeout(callReady, 100);
        }
      } catch (error) {
        console.error("Error calling ready:", error);
        // Try again after delay
        setTimeout(callReady, 100);
      }
    };
    
    callReady();
  }, [])

  useEffect(() => {
    if (!mounted || !sdkReady) return
    
    const initGame = async () => {
      try {
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
  }, [mounted, sdkReady])

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          gap: "1rem"
        }}
      >
        <div>Loading Farcaster SDK...</div>
        <div style={{ fontSize: "12px", opacity: 0.7 }}>
          {sdkReady ? "SDK Ready ✓" : "Waiting for SDK..."}
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://esm.sh/@farcaster/frame-sdk"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("SDK script loaded from Script tag");
        }}
      />
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
    </>
  )
}
