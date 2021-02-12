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

export class RepatersMap {
  constructor(mapId, tooltipId) {
    const view = new View({
      center: [0, 0],
      zoom: 12,
    });

    const geoLocationLayer = this._buildGeoLocationLayer(view);

    this._map = new Map({
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

    // update the HTML page when the position changes.
    geolocation.on("change", () => {
      view.centerOn(geolocation.getPosition(), [0, 0], [0, 0]);
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
    const element = document.getElementById(tooltipId);

    console.log(element);
    const popup = new Overlay({
      element: element,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });
    map.addOverlay(popup);

    // display popup on click
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return feature;
      });
      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        popup.setPosition(coordinates);
        $(element).popover({
          placement: "top",
          html: true,
          title: feature.get("name"),
          content: `Frequencia: ${feature.get("frequency")}<br/>
                    Subtono: ${feature.get("subtone")}`,
        });
        $(element).popover("show");
      } else {
        $(element).popover("dispose");
      }
    });

    // change mouse cursor when over marker
    map.on("pointermove", (e) => {
      if (e.dragging) {
        $(element).popover("destroy");
        return;
      }
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });
  }

  addRepeaters() {
    const repeaterFeatures = this._buildRepeaterFeatures();
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

  _buildRepeaterFeatures() {
    return [this._buildRepeaterFeature()];
  }

  _buildRepeaterFeature() {
    const position = fromLonLat([-58.4162405, -34.6437888]);
    console.log("position", position);

    const repeaterFeature = new Feature({
      geometry: new Point(position),
      name: "Radio Club Argentino",
      frequency: "146.910 KHz (-600)",
      subtone: 123,
    });

    // const repeaterStyle = new Style({
    //   image: new Icon(
    //     /** @type {module:ol/style/Icon~Options} */ ({
    //       anchor: [0.5, 46],
    //       anchorXUnits: "fraction",
    //       anchorYUnits: "pixels",
    //       src: "icon.png",
    //     })
    //   ),
    // });

    const repeaterStyle = new Style({
      image: new CircleStyle({
        radius: 9,
        fill: new Fill({
          color: "#CC0000",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    });

    repeaterFeature.setStyle(repeaterStyle);

    return repeaterFeature;
  }
}
