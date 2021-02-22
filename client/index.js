import "regenerator-runtime/runtime";
import { RepatersMap } from "./map";
import { RepeaterService } from "./repeater-service";

const height = $(window).height();

console.log(
  "Querés colaborar? Bienvenide: https://github.com/ferclaverino/repeaters"
);

window.addEventListener("load", async (event) => {
  $("#map").height(height);

  const map = new RepatersMap("map", "tooltip");
  const repeaterService = new RepeaterService();
  const repeaters = await repeaterService.getAll();
  map.addRepeaters(repeaters);
});
