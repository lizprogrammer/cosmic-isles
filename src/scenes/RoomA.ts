import Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class RoomA extends Phaser.Scene {
  constructor() { super("RoomA"); }

  preload() {
    this.load.image("roomA", "/rooms/roomA.png");
    this.load.image("stone", "/sprites/glowing-stone.png");
    this.load.image("guidebot", "/sprites/npc-guidebot.png");
  }

  create() {
    this.add.image(0, 0, "roomA").setOrigin(0);
    this.add.sprite(150, 300, "guidebot");

    const stone = this.add.sprite(400, 320, "stone").setInteractive();

    stone.on("pointerdown", () => {
      playerState.hasStone = true;
      stone.destroy();
      this.scene.start("RoomB");
    });
  }
}
