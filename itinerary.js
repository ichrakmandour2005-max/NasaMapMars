/* itinerary.js: mission itinerary and route on the globe.
 * Depends on: viewer, MARS (index.html), CONFIG (config1.js), MarsMission (mission.js, optional).
 * Stops without coordinates can be placed by clicking on the globe. Placements are saved in this
 * browser; paste the printed lat/lon values into config1.js to make them permanent. */
(function () {
  "use strict";
  const host = document.getElementById("itinerary-ui");
  if (!host || typeof CONFIG === "undefined" || typeof viewer === "undefined") return;

  const steps = CONFIG.steps, STORE = "marsStops", deg = Cesium.Math.toDegrees;
  const hasCoords = s => Number.isFinite(s.lat) && Number.isFinite(s.lon);
  const carto = s => Cesium.Cartographic.fromDegrees(s.lon, s.lat);
  const cart3 = s => Cesium.Cartesian3.fromDegrees(s.lon, s.lat, 0, MARS);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const fmtDist = m => (m < 1000 ? Math.round(m) + " m" : (m / 1000).toFixed(2) + " km");
  const fmtTime = h => {
    const t = Math.round(h * 60);
    return t < 60 ? t + " min" : Math.floor(t / 60) + " h " + String(t % 60).padStart(2, "0") + " min";
  };
  const speed = () => {
    const v = parseFloat((document.getElementById("rt-speed") || {}).value);
    return v > 0 ? v : 1.5;
  };

  // Restore stops placed earlier in this browser (only where config1.js has no coordinates)
  let fromStorage = false;   // true while some coordinates exist only in this browser
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (Array.isArray(saved)) saved.forEach((c, i) => {
      if (steps[i] && !hasCoords(steps[i]) && c && Number.isFinite(c.lat) && Number.isFinite(c.lon)) {
        steps[i].lat = c.lat; steps[i].lon = c.lon; fromStorage = true;
      }
    });
  } catch (e) { /* storage unavailable */ }

  /* ---------- Interface ---------- */
  host.innerHTML = `
    <h2>Mission itinerary</h2>
    <div id="it-summary" class="muted"></div>
    <ol id="it-legs" class="muted"></ol>
    <button type="button" id="it-fit" class="poi">Show full itinerary</button>
    <button type="button" id="it-place" class="poi">Place the stops by clicking on the globe</button>
    <div id="it-msg" class="muted"></div>
    <pre id="it-code" class="card" style="white-space: pre-wrap; font-size: 12px; user-select: all;" hidden></pre>`;
  const $ = id => host.querySelector("#" + id);
  const summary = $("it-summary"), legsList = $("it-legs"), fitBtn = $("it-fit"), placeBtn = $("it-place");
  const msg = $("it-msg"), code = $("it-code");

  /* ---------- State ---------- */
  let legs = [], total = 0, ready = false, placing = -1;
  const markers = new Map();

  function recompute() {
    legs = []; total = 0;
    for (let i = 0; i < steps.length - 1; i++) {
      const a = steps[i], b = steps[i + 1];
      if (!hasCoords(a) || !hasCoords(b)) break;
      const ca = carto(a), cb = carto(b);
      const same = ca.longitude === cb.longitude && ca.latitude === cb.latitude;
      const geo = same ? null : new Cesium.EllipsoidGeodesic(ca, cb, MARS);
      const d = geo && Number.isFinite(geo.surfaceDistance) ? geo.surfaceDistance : 0;
      legs.push({ a, b, geo, d });
      total += d;
    }
    ready = steps.length >= 2 && legs.length === steps.length - 1;

    markers.forEach((i, e) => viewer.entities.remove(e));
    markers.clear();
    steps.forEach((s, i) => {
      if (!hasCoords(s)) return;
      markers.set(viewer.entities.add({
        position: cart3(s),
        point: { pixelSize: 11, color: Cesium.Color.fromCssColorString("#f2b366"), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
        label: { text: (i + 1) + ". " + s.name, font: "13px system-ui", fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
                 outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, -20) }
      }), i);
    });
    render();
  }

  /* ---------- Static itinerary route line ---------- */
  viewer.entities.add({ polyline: {
    positions: new Cesium.CallbackProperty(() => ready ? steps.map(cart3) : [], false),
    width: 4, material: Cesium.Color.WHITE, arcType: Cesium.ArcType.GEODESIC
  } });

  /* ---------- Display ---------- */
  function render() {
    legsList.replaceChildren();
    legs.forEach((L, i) => legsList.append(el("li", "", (i + 1) + " → " + (i + 2) + ": " + L.a.name + " → " + L.b.name + " (" + fmtDist(L.d) + ")")));
    fitBtn.disabled = !ready;
    if (!ready) {
      summary.textContent = "Stops placed: " + steps.filter(hasCoords).length + "/" + steps.length + ". Use “Place the stops by clicking on the globe” or add their coordinates to config1.js.";
      return;
    }
    summary.textContent = steps.length + " stops · " + fmtDist(total) + " · about " + fmtTime(total / 1000 / speed()) +
      " on foot at " + speed() + " km/h (walking speed is an assumption)." +
      (fromStorage ? " These coordinates are saved only in this browser; paste them into config1.js to share them." : "");
  }

  /* ---------- Controls ---------- */
  fitBtn.addEventListener("click", () => {
    const lons = steps.map(s => s.lon), lats = steps.map(s => s.lat);
    const [w, e, s, n] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
    const pad = Math.max(0.03, 0.25 * Math.max(e - w, n - s));
    viewer.camera.flyTo({ destination: Cesium.Rectangle.fromDegrees(w - pad, s - pad, e + pad, n + pad), duration: 2 });
  });

  /* ---------- Placing the stops by clicking ---------- */
  const prompt = i => "Click on the globe to place stop " + (i + 1) + " of " + steps.length + ": " + steps[i].name;
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  placeBtn.addEventListener("click", () => {
    steps.forEach(s => { s.lat = null; s.lon = null; });
    placing = 0;
    code.hidden = true;
    viewer.scene.canvas.style.cursor = "crosshair";
    msg.textContent = prompt(0);
    recompute();
  });

  function place(position) {
    const p = viewer.camera.pickEllipsoid(position, MARS);
    if (!p) return;
    const c = Cesium.Cartographic.fromCartesian(p, MARS);
    steps[placing].lat = +deg(c.latitude).toFixed(4);
    steps[placing].lon = +deg(c.longitude).toFixed(4);
    placing++;
    if (placing < steps.length) {
      msg.textContent = prompt(placing);
    } else {
      placing = -1;
      fromStorage = true;
      viewer.scene.canvas.style.cursor = "";
      try { localStorage.setItem(STORE, JSON.stringify(steps.map(s => ({ lat: s.lat, lon: s.lon })))); } catch (e) { /* ignore */ }
      code.textContent = steps.map(s => "lat: " + s.lat + ", lon: " + s.lon + ",  // " + s.name).join("\n");
      code.hidden = false;
      msg.textContent = "Stops placed. Verify them against the route map, then paste these values into config1.js.";
      if (navigator.clipboard) navigator.clipboard.writeText(code.textContent).catch(() => {});
    }
    recompute();
    window.dispatchEvent(new Event("marsstops:change"));
  }

  handler.setInputAction(click => {
    if (placing >= 0) { place(click.position); return; }
    const picked = viewer.scene.pick(click.position);
    if (picked && picked.id && markers.has(picked.id)) {
      if (window.MarsMission) MarsMission.select(markers.get(picked.id));
      document.getElementById("panel").scrollTo({ top: 0, behavior: "smooth" });   // the itinerary comes first
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  recompute();
  window.dispatchEvent(new Event("marsstops:change"));
  if (ready) fitBtn.click();
})();
