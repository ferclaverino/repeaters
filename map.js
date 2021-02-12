import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import Point from "ol/geom/Point.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";

export class RepatersMap {
  constructor() {
    this.view = new View({
      center: [0, 0],
      zoom: 12,
    });

    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: "map",
      view: this.view,
    });

    this.accuracyFeature = new Feature();
    this._buildPositionFeature();
    this._buildGeoLocation();

    new VectorLayer({
      map: this.map,
      source: new VectorSource({
        features: [this.accuracyFeature, this.positionFeature],
      }),
    });
  }

  _buildGeoLocation() {
    this.geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: this.view.getProjection(),
    });

    // update the HTML page when the position changes.
    this.geolocation.on("change", () => {
      this.view.centerOn(this.geolocation.getPosition(), [0, 0], [0, 0]);
      // this.view.setZoom(10);
    });

    // handle geolocation error.
    this.geolocation.on("error", (error) => {
      console.error(error);
    });

    this.geolocation.on("change:accuracyGeometry", () => {
      this.accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
    });

    this.geolocation.on("change:position", () => {
      var coordinates = this.geolocation.getPosition();
      this.positionFeature.setGeometry(
        coordinates ? new Point(coordinates) : null
      );
    });
  }

  _buildPositionFeature() {
    this.positionFeature = new Feature();
    this.positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      })
    );
  }

  setTracking() {
    this.geolocation.setTracking(true);
  }
}
