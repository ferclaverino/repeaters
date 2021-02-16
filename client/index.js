import "regenerator-runtime/runtime";
import { RepatersMap } from "./map";
import { RepeaterService } from "./repeater-service";

window.addEventListener("load", async (event) => {
  const map = new RepatersMap("map", "tooltip");
  const repeaterService = new RepeaterService();
  const repeaters = await repeaterService.getAll();
  map.addRepeaters(repeaters);
});
