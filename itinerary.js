/* itinerary.js: mission itinerary on the globe + simulated astronaut position.
 * Depends on: viewer, MARS (index.html), CONFIG (config.js), MarsMission (mission.js, optional).
 * Stops without coordinates can be placed by clicking on the globe. Placements are saved in this
 * browser; paste the printed lat/lon values into config.js to make them permanent. */
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

  // Restore stops placed earlier in this browser (only where config.js has no coordinates)
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (Array.isArray(saved)) saved.forEach((c, i) => {
      if (steps[i] && !hasCoords(steps[i]) && c && Number.isFinite(c.lat) && Number.isFinite(c.lon)) {
        steps[i].lat = c.lat; steps[i].lon = c.lon;
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
    <pre id="it-code" class="card" style="white-space: pre-wrap; font-size: 12px; user-select: all;" hidden></pre>
    <h2>Astronaut position (simulated)</h2>
    <input id="it-slider" class="opacity" autocomplete="off" type="range" min="0" max="1000" value="0" aria-label="Position along the itinerary">
    <div class="zoombar">
      <button type="button" id="it-play">Play</button>
    </div>
    <label class="layer"><input type="checkbox" id="it-follow" autocomplete="off"> Follow the astronaut (oblique view)</label>
    <div id="it-pos" class="card"></div>`;
  const $ = id => host.querySelector("#" + id);
  const summary = $("it-summary"), legsList = $("it-legs"), fitBtn = $("it-fit"), placeBtn = $("it-place");
  const msg = $("it-msg"), code = $("it-code"), slider = $("it-slider"), playBtn = $("it-play");
  const follow = $("it-follow"), pos = $("it-pos");

  /* ---------- State ---------- */
  let legs = [], total = 0, cur = 0, ready = false, placing = -1;
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

  // Position (and leg) after travelling `dist` meters along the itinerary
  function at(dist) {
    let acc = 0;
    for (let i = 0; i < legs.length; i++) {
      const L = legs[i];
      if (dist <= acc + L.d || i === legs.length - 1) {
        const f = L.d ? Math.min(1, Math.max(0, (dist - acc) / L.d)) : 0;
        const c = L.geo ? L.geo.interpolateUsingFraction(f) : carto(L.a);
        return { cart: Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, 0, MARS), lat: deg(c.latitude), lon: deg(c.longitude), leg: i, done: acc + L.d * f };
      }
      acc += L.d;
    }
    return null;
  }

  /* ---------- Route lines and astronaut marker ---------- */
  viewer.entities.add({ polyline: {   // already travelled: solid white
    positions: new Cesium.CallbackProperty(() => {
      const p = ready && at(cur);
      if (!p) return [];
      const pts = steps.slice(0, p.leg + 1).map(cart3);
      pts.push(p.cart);
      return pts;
    }, false),
    width: 4, material: Cesium.Color.WHITE, arcType: Cesium.ArcType.GEODESIC } });
  viewer.entities.add({ polyline: {   // still ahead: dashed white
    positions: new Cesium.CallbackProperty(() => {
      const p = ready && at(cur);
      if (!p) return [];
      return [p.cart].concat(steps.slice(p.leg + 1).map(cart3));
    }, false),
    width: 4, material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.WHITE, dashLength: 16 }),
    arcType: Cesium.ArcType.GEODESIC } });
  viewer.entities.add({
    position: new Cesium.CallbackProperty(() => { const p = ready && at(cur); return p ? p.cart : undefined; }, false),
    point: { pixelSize: 14, color: Cesium.Color.CYAN, outlineColor: Cesium.Color.WHITE, outlineWidth: 3, disableDepthTestDistance: Number.POSITIVE_INFINITY },
    label: { text: "Astronaut (simulated)", font: "13px system-ui", fillColor: Cesium.Color.CYAN, outlineColor: Cesium.Color.BLACK,
             outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, 24) }
  });

  /* ---------- Display ---------- */
  function render() {
    legsList.replaceChildren();
    legs.forEach((L, i) => legsList.append(el("li", "", (i + 1) + " → " + (i + 2) + ": " + L.a.name + " → " + L.b.name + " (" + fmtDist(L.d) + ")")));
    slider.disabled = playBtn.disabled = fitBtn.disabled = !ready;
    if (!ready) {
      summary.textContent = "Stops placed: " + steps.filter(hasCoords).length + "/" + steps.length +
        ". Use “Place the stops by clicking on the globe” (or add their coordinates to config.js).";
      pos.textContent = "";
      return;
    }
    summary.textContent = steps.length + " stops · " + fmtDist(total) + " · about " + fmtTime(total / 1000 / speed()) +
      " on foot at " + speed() + " km/h (walking speed is an assumption).";
    updatePos();
  }

  function updatePos() {
    if (!ready) return;
    const p = at(cur), L = legs[p.leg], left = total - p.done;
    pos.replaceChildren(
      el("strong", "", "Leg " + (p.leg + 1) + ": " + L.a.name + " → " + L.b.name),
      el("p", "muted", "Position: " + p.lat.toFixed(3) + "°, " + p.lon.toFixed(3) + "° (simulated: Mars has no GPS)"),
      el("p", "muted", "Travelled: " + fmtDist(p.done) + " · Remaining: " + fmtDist(left) + " · Time left: " + fmtTime(left / 1000 / speed())));
    if (follow.checked) {
      const heading = Math.atan2((L.b.lon - L.a.lon) * Math.cos(Cesium.Math.toRadians(p.lat)), L.b.lat - L.a.lat);
      viewer.camera.lookAt(p.cart, new Cesium.HeadingPitchRange(heading, Cesium.Math.toRadians(-35), 20000));
    }
  }

  /* ---------- Controls ---------- */
  slider.addEventListener("input", () => { cur = (slider.value / 1000) * total; updatePos(); });
  follow.addEventListener("change", () => {
    if (follow.checked) updatePos(); else viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  });

  let playing = false, last = 0;
  function tick(ts) {
    if (!playing) return;
    cur = Math.min(total, cur + (total * (last ? ts - last : 0)) / 40000);   // full itinerary in about 40 s
    last = ts;
    slider.value = total ? (cur / total) * 1000 : 0;
    updatePos();
    if (cur >= total) setPlaying(false); else requestAnimationFrame(tick);
  }
  function setPlaying(on) {
    playing = on; last = 0;
    playBtn.textContent = on ? "Pause" : "Play";
    if (on) { if (cur >= total) cur = 0; requestAnimationFrame(tick); }
  }
  playBtn.addEventListener("click", () => setPlaying(!playing));

  fitBtn.addEventListener("click", () => {
    follow.checked = false;
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    const lons = steps.map(s => s.lon), lats = steps.map(s => s.lat);
    const [w, e, s, n] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
    const pad = Math.max(0.03, 0.25 * Math.max(e - w, n - s));
    viewer.camera.flyTo({ destination: Cesium.Rectangle.fromDegrees(w - pad, s - pad, e + pad, n + pad), duration: 2 });
  });

  /* ---------- Placing the stops by clicking ---------- */
  const prompt = i => "Click on the globe to place stop " + (i + 1) + " of " + steps.length + ": " + steps[i].name;
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  placeBtn.addEventListener("click", () => {
    setPlaying(false);
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
      viewer.scene.canvas.style.cursor = "";
      try { localStorage.setItem(STORE, JSON.stringify(steps.map(s => ({ lat: s.lat, lon: s.lon })))); } catch (e) { /* ignore */ }
      code.textContent = steps.map(s => "lat: " + s.lat + ", lon: " + s.lon + ",  // " + s.name).join("\n");
      code.hidden = false;
      msg.textContent = "Stops placed. Verify them against NASA’s route map, then paste these values into config.js.";
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
