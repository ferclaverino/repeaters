import { RepatersMap } from "./map";

window.addEventListener("load", (event) => {
  var map = new RepatersMap("map", "tooltip");
  map.addRepeaters();
});
