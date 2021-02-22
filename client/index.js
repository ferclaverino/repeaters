import "regenerator-runtime/runtime";
import { RepatersMap } from "./map";
import { RepeaterService } from "./repeater-service";

const height = $(window).height();

console.log(
  "Querés colaborar? Bienvenide: https://github.com/ferclaverino/repeaters"
);

async function buildMap() {
  const map = new RepatersMap("map", "tooltip");
  const repeaterService = new RepeaterService();
  const repeaters = await repeaterService.getAll();
  map.addRepeaters(repeaters);
}

function geoError() {
  alert("Por favor permita acceder a su ubicación para ver mejor el mapa");
  buildMap();
}

window.addEventListener("load", async (event) => {
  $("#map").height(height);
  navigator.geolocation.getCurrentPosition(await buildMap, geoError);
});
