import Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class RoomB extends Phaser.Scene {
  constructor() { super("RoomB"); }

  preload() {
    this.load.image("roomB", "/rooms/roomB.png");
    this.load.image("villager", "/sprites/npc-villager.png");
    this.load.image("doorLocked", "/sprites/door-locked.png");
    this.load.image("doorOpen", "/sprites/door-open.png");
  }

  create() {
    this.add.image(0, 0, "roomB").setOrigin(0);
    this.add.sprite(150, 300, "villager");

    const door = this.add.sprite(500, 300, "doorLocked");

    if (playerState.hasStone) {
      door.setTexture("doorOpen");
      door.setInteractive();
      door.on("pointerdown", () => this.scene.start("RoomC"));
    }
  }
}
