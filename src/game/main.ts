import Phaser from "phaser";
import AvatarCreator from "./scenes/AvatarCreator";
import RoomA from "./scenes/RoomA";
import RoomB from "./scenes/RoomB";
import RoomC from "./scenes/RoomC";

new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game",
  scene: [AvatarCreator, RoomA, RoomB, RoomC],
});
