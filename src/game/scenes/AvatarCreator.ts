import Phaser from "phaser";
import { playerState } from "../state/PlayerState";

export default class AvatarCreator extends Phaser.Scene {
  constructor() {
    super("AvatarCreator");
  }

  preload() {
    this.load.image("base-blue", "/sprites/avatar/base-blue.png");
    this.load.image("base-green", "/sprites/avatar/base-green.png");
    this.load.image("outfit1", "/sprites/avatar/outfit-1.png");
    this.load.image("outfit2", "/sprites/avatar/outfit-2.png");
    this.load.image("outfit3", "/sprites/avatar/outfit-3.png");
    this.load.image("hat", "/sprites/avatar/hat.png");
    this.load.image("glasses", "/sprites/avatar/glasses.png");
    this.load.image("antenna", "/sprites/avatar/antenna.png");
  }

  create() {
    const preview = this.add.container(200, 200);

    const update = () => {
      preview.removeAll(true);
      preview.add(this.add.sprite(0, 0, playerState.bodyColor));
      preview.add(this.add.sprite(0, 0, playerState.outfit));
      if (playerState.accessory) preview.add(this.add.sprite(0, 0, playerState.accessory));
    };

    ["base-blue", "base-green"].forEach((key, i) => {
      this.add.text(20, 20 + i * 30, key, { color: "#fff" })
        .setInteractive()
        .on("pointerdown", () => { playerState.bodyColor = key; update(); });
    });

    ["outfit1", "outfit2", "outfit3"].forEach((key, i) => {
      this.add.text(150, 20 + i * 30, key, { color: "#fff" })
        .setInteractive()
        .on("pointerdown", () => { playerState.outfit = key; update(); });
    });

    ["hat", "glasses", "antenna"].forEach((key, i) => {
      this.add.text(300, 20 + i * 30, key, { color: "#fff" })
        .setInteractive()
        .on("pointerdown", () => { playerState.accessory = key; update(); });
    });

    update();

    this.add.text(150, 350, "Start Adventure", { color: "#0f0" })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("RoomA"));
  }
}
