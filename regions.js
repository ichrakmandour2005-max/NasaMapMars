/* regions.js: geologic regions traced by the team from NASA’s annotated route map.
 * Depends on: viewer, MARS (index.html). Optional: CONFIG.regions (config.js), index-aligned with REGIONS.
 * The regions are approximate hand-drawn outlines, NOT a mineral map. */
(function () {
  "use strict";
  const host = document.getElementById("regions-ui");
  if (!host || typeof viewer === "undefined") return;

  const STORE = "marsRegions";
  const REGIONS = [
    { name: "Clay-Bearing Unit",    color: "#3fae3f", stop: 0 },
    { name: "Greenheugh Pediment",  color: "#1fb5b0", stop: 1 },
    { name: "Gediz Vallis Ridge",   color: "#e0405a", stop: 2 },
    { name: "Sulfate-Bearing Unit", color: "#e8b020", stop: 4 }
  ];
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const toCart = p => Cesium.Cartesian3.fromDegrees(p[1], p[0], 0, MARS);   // p = [lat, lon]

  // Saved outlines: config.js first, otherwise this browser's storage
  let shapes = REGIONS.map(() => null), savedLocally = false;
  if (typeof CONFIG !== "undefined" && Array.isArray(CONFIG.regions)) {
    CONFIG.regions.forEach((r, i) => { if (r && Array.isArray(r.points) && r.points.length >= 3) shapes[i] = r.points; });
  } else {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "null");
      if (Array.isArray(saved)) {
        shapes = REGIONS.map((_, i) => (Array.isArray(saved[i]) ? saved[i] : null));
        savedLocally = shapes.some(Boolean);
      }
    } catch (e) { /* storage unavailable */ }
  }

  host.innerHTML = `
    <h2>Geologic regions</h2>
    <label class="layer"><input type="checkbox" id="rg-show" checked> Show regions</label>
    <div class="muted">Approximate outlines traced by the team from NASA’s annotated route map. Not a mineral map. Tap a region to open its stop.</div>
    <button type="button" id="rg-trace" class="poi">Trace the regions by clicking on the globe</button>
    <div class="zoombar"><button type="button" id="rg-finish" hidden>Finish region</button><button type="button" id="rg-cancel" hidden>Stop</button></div>
    <div class="muted" id="rg-msg"></div>
    <pre id="rg-code" class="card" style="white-space: pre-wrap; font-size: 12px; user-select: all;" hidden></pre>`;
  const $ = id => host.querySelector("#" + id);
  const show = $("rg-show"), traceBtn = $("rg-trace"), finishBtn = $("rg-finish"), cancelBtn = $("rg-cancel");
  const msg = $("rg-msg"), code = $("rg-code");
  const DEV = new URLSearchParams(location.search).has("dev");   // tracing tools only with index.html?dev
  traceBtn.hidden = !DEV;
  if (savedLocally) host.querySelector(".muted").textContent += " Warning: these outlines are saved only in this browser. Paste them into config.js so everyone sees them.";

  /* ---------- Drawing ---------- */
  const ents = [], picks = new Map();   // picks: region entity -> region index
  function draw() {
    ents.splice(0).forEach(e => viewer.entities.remove(e));
    picks.clear();
    shapes.forEach((pts, i) => {
      if (!pts) return;
      const color = Cesium.Color.fromCssColorString(REGIONS[i].color);
      const cLat = pts.reduce((a, p) => a + p[0], 0) / pts.length, cLon = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const poly = viewer.entities.add({ show: show.checked, polygon: {
        hierarchy: pts.map(toCart), material: color.withAlpha(0.35), height: 0, outline: true, outlineColor: color } });
      ents.push(poly);
      picks.set(poly, i);
      ents.push(viewer.entities.add({ show: show.checked, position: toCart([cLat, cLon]), label: {
        text: REGIONS[i].name, font: "14px system-ui", fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE, distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2.0e6) } }));
    });
  }
  show.addEventListener("change", () => ents.forEach(e => { e.show = show.checked; }));

  /* ---------- Tracing by clicking ---------- */
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let idx = -1, pts = [];
  const outline = viewer.entities.add({ polyline: {
    positions: new Cesium.CallbackProperty(() => (pts.length > 1 ? pts.concat(pts.length > 2 ? [pts[0]] : []).map(toCart) : []), false),
    width: 2, material: Cesium.Color.WHITE } });
  const prompt = () => "Click the corners of the " + REGIONS[idx].name + ", then press “Finish region”.";

  function stop() {
    idx = -1; pts = [];
    viewer.scene.canvas.style.cursor = "";
    finishBtn.hidden = cancelBtn.hidden = true;
  }
  function printCode() {
    code.textContent = "regions: [\n" + shapes.map((p, i) => p
      ? "  { name: \"" + REGIONS[i].name + "\", points: " + JSON.stringify(p) + " },"
      : "  null,").join("\n") + "\n],";
    code.hidden = false;
    if (navigator.clipboard) navigator.clipboard.writeText(code.textContent).catch(() => {});
  }
  function finishRegion() {
    if (pts.length === 0) {                      // nothing clicked: skip this region
      msg.textContent = REGIONS[idx].name + " skipped.";
    } else if (pts.length < 3) {
      msg.textContent = "Place at least 3 corners (or none to skip this region).";
      return;
    } else {
      shapes[idx] = pts.slice();
      draw();
    }
    pts = [];
    idx++;
    if (idx < REGIONS.length) { msg.textContent = prompt(); return; }
    stop();
    try { localStorage.setItem(STORE, JSON.stringify(shapes)); } catch (e) { /* ignore */ }
    printCode();
    msg.textContent = "Done. The regions are saved in this browser. Paste the code below into config.js, inside CONFIG, to make them permanent.";
  }

  traceBtn.addEventListener("click", () => {
    idx = 0; pts = [];
    code.hidden = true;
    finishBtn.hidden = cancelBtn.hidden = false;
    viewer.scene.canvas.style.cursor = "crosshair";
    msg.textContent = prompt();
  });

  // One click handler: adds a corner while tracing, otherwise opens the stop of the tapped region
  handler.setInputAction(click => {
    if (idx >= 0) {
      const p = viewer.camera.pickEllipsoid(click.position, MARS);
      if (!p) return;
      const c = Cesium.Cartographic.fromCartesian(p, MARS);
      pts.push([+Cesium.Math.toDegrees(c.latitude).toFixed(4), +Cesium.Math.toDegrees(c.longitude).toFixed(4)]);
      return;
    }
    const picked = viewer.scene.pick(click.position);
    if (picked && picked.id && picks.has(picked.id) && window.MarsMission) {
      MarsMission.select(REGIONS[picks.get(picked.id)].stop);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  finishBtn.addEventListener("click", finishRegion);
  cancelBtn.addEventListener("click", () => {
    stop();
    try { localStorage.setItem(STORE, JSON.stringify(shapes)); } catch (e) { /* ignore */ }
    printCode();
    msg.textContent = "Tracing stopped. Completed regions are kept.";
  });

  draw();
})();
