import "ol/ol.css";
import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import Point from "ol/geom/Point.js";
import Overlay from "ol/Overlay.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from "ol/style.js";
import { fromLonLat } from "ol/proj";
import { ScaleLine, defaults as defaultControls } from "ol/control";
import LineString from "ol/geom/LineString.js";

export class RepatersMap {
  constructor(mapId, tooltipId) {
    const view = new View({
      center: [0, 0],
      zoom: 12,
    });

    const geoLocationLayer = this._buildGeoLocationLayer(view);

    this._map = new Map({
      controls: defaultControls().extend([this._buildScaleControl()]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        geoLocationLayer,
      ],
      target: mapId,
      view: view,
    });

    this._buildTooltip(tooltipId, this._map);
  }

  _buildScaleControl() {
    const scaleControl = new ScaleLine({
      units: "metric",
      bar: true,
      steps: 8,
      text: true,
      minWidth: 400,
    });
    return scaleControl;
  }

  _buildGeoLocationLayer(view) {
    const geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });
    const positionFeature = this._buildPositionFeature();
    const accuracyFeature = new Feature();

    // update the HTML page when the position gets 1st value
    geolocation.on("change", () => {
      if (!this.isCenterOnGeolocation) {
        view.centerOn(geolocation.getPosition(), [0, 0], [0, 0]);
        this.isCenterOnGeolocation = true;
      }
    });

    // handle geolocation error.
    geolocation.on("error", (error) => {
      console.error(error);
    });

    geolocation.on("change:accuracyGeometry", () => {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.on("change:position", () => {
      const coordinates = geolocation.getPosition();
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
      this.currentCoordinates = coordinates;
    });

    geolocation.setTracking(true);

    const geoLocationLayer = new VectorLayer({
      source: new VectorSource({
        features: [accuracyFeature, positionFeature],
      }),
    });
    return geoLocationLayer;
  }

  _buildPositionFeature() {
    const positionFeature = new Feature();
    positionFeature.setStyle(
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
    return positionFeature;
  }

  _buildTooltip(tooltipId, map) {
    const tooltipElement = document.getElementById(tooltipId);
    const popup = new Overlay({
      element: tooltipElement,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });
    map.addOverlay(popup);

    // display popup on click
    map.on("click", (evt) => {
      const features = [];
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        features.push(feature);
      });
      if (features.length) {
        const firstFeature = features[0];
        const coordinates = firstFeature.getGeometry().getCoordinates();
        popup.setPosition(coordinates);

        const repeaters = features.map((feature) => feature.get("repeater"));
        $(tooltipElement).popover("dispose");
        $(tooltipElement).popover(this._buildPopover(repeaters, coordinates));
        $(tooltipElement).popover("show");
      } else {
        $(tooltipElement).popover("dispose");
      }
    });

    // change mouse cursor when over marker
    map.on("pointermove", (e) => {
      if (e.dragging) {
        $(tooltipElement).popover("dispose");
        return;
      }
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });
  }

  _buildPopover(repeaters, coordinates) {
    const line = new LineString([this.currentCoordinates, coordinates]);
    const distanteInKm = Math.round((line.getLength() / 1000) * 100) / 100;

    const firstRepeater = repeaters[0];
    return {
      placement: "top",
      html: true,
      title: `${firstRepeater.signal} - ${firstRepeater.name} (${distanteInKm} km)`,
      content: repeaters
        .filter((repeater) => repeater.signal === firstRepeater.signal)
        .map((repeater) => {
          const frequency = parseInt(repeater.frequency).toLocaleString(
            "ES-ar"
          );
          return `Frequencia: ${frequency} KHz (${repeater.diff})<br/>
                  Subtono: ${repeater.subtone}`;
        })
        .join("<hr/>"),
    };
  }

  addRepeaters(repeaters) {
    const repeaterFeatures = this._buildRepeaterFeatures(repeaters);
    this._buildRepeatersLayer(repeaterFeatures, this._map);
  }

  _buildRepeatersLayer(repeaterFeatures, map) {
    const repeatersLayer = new VectorLayer({
      map: map,
      source: new VectorSource({
        features: repeaterFeatures,
      }),
    });
  }

  _buildRepeaterFeatures(repeaters) {
    return repeaters.map(this._buildRepeaterFeature);
  }

  _buildRepeaterFeature(repeater) {
    const position = fromLonLat([repeater.longitude, repeater.latitude]);

    const repeaterFeature = new Feature({
      geometry: new Point(position),
      repeater: repeater,
    });

    const repeaterStyle = new Style({
      image: new CircleStyle({
        radius: 18,
        fill: new Fill({
          color: "#CC0000",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 4,
        }),
      }),
    });

    repeaterFeature.setStyle(repeaterStyle);

    return repeaterFeature;
  }
}
