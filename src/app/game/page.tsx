"use client"

export function generateStaticParams() {
  return []
}

import { useEffect } from "react"
import Phaser from "phaser"
import { config } from "../../game/config"

export default function GamePage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const game = new Phaser.Game(config)
      return () => game.destroy(true)
    }
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


import { useEffect } from "react"
import Phaser from "phaser"
import { config } from "../../game/config"

export default function GamePage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const game = new Phaser.Game(config)
      return () => game.destroy(true)
    }
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
