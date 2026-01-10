import * as Phaser from "phaser";
import { questState } from "../state/QuestState";

export default class RoomC extends Phaser.Scene {
  constructor() { super("RoomC"); }

  preload() {
    this.load.image("roomC", "/rooms/roomC.png");
    this.load.image("starsage", "/sprites/npc-starsage.png");
  }

  create() {
    this.add.image(0, 0, "roomC").setOrigin(0);

    const sage = this.add.sprite(300, 300, "starsage").setInteractive();

    sage.on("pointerdown", () => {
      questState.complete();
      window.location.href = "/api/mint";
    });
  }
}
