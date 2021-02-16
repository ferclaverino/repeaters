import { RepatersMap } from "./map";
import { RepeaterService } from "./repeater-service";

window.addEventListener("load", (event) => {
  const map = new RepatersMap("map", "tooltip");
  const repeaterService = new RepeaterService();
  const repeaters = repeaterService.getAll();
  map.addRepeaters(repeaters);
});
