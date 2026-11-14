/* route.js: route tool for the Mars map
 *
 * Features: place points by clicking, draw the line on the globe,
 * compute the distance (on the Mars ellipsoid) and the estimated walking time.
 *
 * Depends on index.html: global variables `viewer` and `MARS` (CesiumJS),
 * and a <div id="route-ui"></div> container in the panel.
 * This file must be loaded AFTER the main script.
 *
 * API for the rest of the project (e.g. predefined routes):
 *   MarsRoute.setWaypoints([{ lat: -5.4, lon: 137.8 }, ...])
 *   MarsRoute.getWaypoints()
 *   MarsRoute.clear()
 */
(function () {
  "use strict";

  if (typeof viewer === "undefined" || typeof MARS === "undefined") {
    console.error("route.js: load this file after the main script of index.html.");
    return;
  }
  const host = document.getElementById("route-ui");
  if (!host) {
    console.error("route.js: index.html is missing <div id=\"route-ui\"></div>.");
    return;
  }

  /* ---------- Settings ---------- */
  const DEFAULT_SPEED_KMH = 1.5;   // assumption, editable in the interface: adjust with NASA information
  const LINE_COLOR = "#f2b366";

  /* ---------- Interface ---------- */
  const style = document.createElement("style");
  style.textContent = `
    #route-ui .rt-btn { display: block; width: 100%; box-sizing: border-box; margin: 0 0 6px; padding: 8px 10px; font: inherit; font-size: 14px;
      text-align: left; background: transparent; color: var(--sand, #f1e4d6); border: 1px solid var(--panel-line, #4a352d); border-radius: 6px; cursor: pointer; }
    #route-ui .rt-btn:hover:not(:disabled) { border-color: var(--sky, #7fb3d5); }
    #route-ui .rt-btn:disabled { opacity: 0.45; cursor: default; }
    #route-ui .rt-btn[aria-pressed="true"] { border-color: var(--sky, #7fb3d5); background: rgba(127, 179, 213, 0.12); }
    #route-ui .rt-btn:focus-visible, #route-ui input:focus-visible { outline: 2px solid var(--sky, #7fb3d5); outline-offset: 2px; }
    #route-ui .rt-row { display: flex; gap: 6px; }
    #route-ui .rt-row .rt-btn { flex: 1; }
    #route-ui .rt-speed { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 8px 0; font-size: 14px; }
    #route-ui .rt-speed input { width: 70px; padding: 5px 6px; font: inherit; color: var(--sand, #f1e4d6);
      background: transparent; border: 1px solid var(--panel-line, #4a352d); border-radius: 6px; }
    #route-ui #rt-summary { margin: 8px 0; font-size: 14px; line-height: 1.45; }
    #route-ui #rt-summary strong { font-weight: 650; }
    #route-ui #rt-steps { margin: 0 0 10px; padding-left: 20px; font-size: 13px; color: var(--muted, #b9a594); line-height: 1.5; }
    #route-ui #rt-msg { margin-top: 6px; font-size: 12px; color: var(--muted, #b9a594); min-height: 1.2em; }
  `;
  document.head.appendChild(style);

  host.innerHTML = `
    <h2>Route</h2>
    <button type="button" id="rt-toggle" class="rt-btn" aria-pressed="false">Draw a route</button>
    <label class="rt-speed">Walking speed (km/h)
      <input id="rt-speed" type="number" min="0.1" step="0.1" value="${DEFAULT_SPEED_KMH}">
    </label>
    <div id="rt-summary" aria-live="polite"></div>
    <ol id="rt-steps"></ol>
    <div class="rt-row">
      <button type="button" id="rt-undo" class="rt-btn">Undo last point</button>
      <button type="button" id="rt-clear" class="rt-btn">Clear</button>
    </div>
    <button type="button" id="rt-copy" class="rt-btn">Copy route (GeoJSON)</button>
    <div id="rt-msg"></div>
  `;

  const $ = id => host.querySelector("#" + id);
  const toggleBtn = $("rt-toggle"), speedInput = $("rt-speed"), summary = $("rt-summary"), stepsList = $("rt-steps");
  const undoBtn = $("rt-undo"), clearBtn = $("rt-clear"), copyBtn = $("rt-copy"), msg = $("rt-msg");

  /* ---------- State and Cesium objects ---------- */
  const positions = [];        // Cartesian3 of the route points
  const pointEntities = [];    // one numbered marker per point

  viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(() => positions.slice(), false),
      width: 4,
      material: Cesium.Color.fromCssColorString(LINE_COLOR),
      arcType: Cesium.ArcType.GEODESIC
    }
  });

  /* ---------- Calculations ---------- */
  function toCarto(cartesian) {
    return Cesium.Cartographic.fromCartesian(cartesian, MARS);
  }

  function segmentDistance(a, b) {
    if (Cesium.Cartesian3.equals(a, b)) return 0;
    const d = new Cesium.EllipsoidGeodesic(toCarto(a), toCarto(b), MARS).surfaceDistance;
    return Number.isFinite(d) ? d : 0;
  }

  function formatDistance(meters) {
    return meters < 1000
      ? Math.round(meters) + " m"
      : (meters / 1000).toFixed(2) + " km";
  }

  function formatDuration(hours) {
    const total = Math.round(hours * 60);
    if (total < 60) return total + " min";
    return Math.floor(total / 60) + " h " + String(total % 60).padStart(2, "0") + " min";
  }

  function speedKmh() {
    const v = parseFloat(speedInput.value);
    return v > 0 ? v : DEFAULT_SPEED_KMH;
  }

  /* ---------- Display update ---------- */
  function refresh() {
    stepsList.innerHTML = "";
    let total = 0;

    for (let i = 1; i < positions.length; i++) {
      const d = segmentDistance(positions[i - 1], positions[i]);
      total += d;
      const li = document.createElement("li");
      li.textContent = "Point " + i + " → " + (i + 1) + ": " + formatDistance(d);
      stepsList.appendChild(li);
    }

    if (positions.length === 0) {
      summary.textContent = "No points yet. Turn on drawing, then click on the globe.";
    } else if (positions.length === 1) {
      summary.textContent = "1 point placed. Add a second one to get a route.";
    } else {
      const hours = total / 1000 / speedKmh();
      summary.innerHTML = "Distance: <strong>" + formatDistance(total) + "</strong><br>" +
                          "Walking time: <strong>" + formatDuration(hours) + "</strong>";
    }

    undoBtn.disabled = positions.length === 0;
    clearBtn.disabled = positions.length === 0;
    copyBtn.disabled = positions.length < 2;

    // Tells the other modules (e.g. safety.js) that the route changed
    window.dispatchEvent(new Event("marsroute:change"));
  }

  /* ---------- Points ---------- */
  function addWaypoint(cartesian) {
    positions.push(cartesian);
    pointEntities.push(viewer.entities.add({
      position: cartesian,
      point: { pixelSize: 9, color: Cesium.Color.fromCssColorString(LINE_COLOR), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
      label: {
        text: String(positions.length), font: "13px system-ui", fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK, outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -18)
      }
    }));
    refresh();
  }

  function undo() {
    if (!positions.length) return;
    positions.pop();
    viewer.entities.remove(pointEntities.pop());
    refresh();
  }

  function clear() {
    positions.length = 0;
    pointEntities.splice(0).forEach(e => viewer.entities.remove(e));
    refresh();
  }

  /* ---------- Drawing mode (left click) ---------- */
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let drawing = false;

  function setDrawing(on) {
    drawing = on;
    toggleBtn.setAttribute("aria-pressed", String(on));
    toggleBtn.textContent = on ? "Finish drawing" : "Draw a route";
    viewer.scene.canvas.style.cursor = on ? "crosshair" : "";
    msg.textContent = on ? "Click on the globe to place each point of the route." : "";

    if (on) {
      handler.setInputAction(click => {
        const p = viewer.camera.pickEllipsoid(click.position, MARS);
        if (p) addWaypoint(p);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }

  toggleBtn.addEventListener("click", () => setDrawing(!drawing));
  undoBtn.addEventListener("click", undo);
  clearBtn.addEventListener("click", clear);
  speedInput.addEventListener("input", refresh);

  /* ---------- Export ---------- */
  function toWaypointList() {
    return positions.map(p => {
      const c = toCarto(p);
      return { lat: Cesium.Math.toDegrees(c.latitude), lon: Cesium.Math.toDegrees(c.longitude) };
    });
  }

  copyBtn.addEventListener("click", async () => {
    const geojson = {
      type: "Feature",
      properties: { name: "Mars route", speedKmh: speedKmh() },
      geometry: { type: "LineString", coordinates: toWaypointList().map(w => [w.lon, w.lat]) }
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(geojson, null, 2));
      msg.textContent = "Route copied. Paste it into a .geojson file.";
    } catch (e) {
      msg.textContent = "Copy not possible from this page: open it with Live Server (localhost).";
    }
  });

  /* ---------- Public API ---------- */
  window.MarsRoute = {
    getWaypoints: toWaypointList,
    setWaypoints(list) {
      clear();
      list.forEach(w => addWaypoint(Cesium.Cartesian3.fromDegrees(w.lon, w.lat, 0, MARS)));
    },
    clear
  };

  refresh();
})();
