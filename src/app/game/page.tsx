"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { useEffect } from "react"
import Phaser from "phaser"
import { config } from "../../game/config"

export default function GamePage() {
  useEffect(() => {
    const game = new Phaser.Game(config)
    return () => game.destroy(true)
  }, [])

  return (
    <div
      id="game"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000"
      }}
    />
  )
}
