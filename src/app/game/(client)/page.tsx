"use client"

import { useEffect } from "react"
import * as Phaser from "phaser"
import { config } from "../../../game/config"

export default function GameClientPage() {
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
