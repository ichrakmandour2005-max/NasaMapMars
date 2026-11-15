/* picker.js: team tool to measure a hazard zone with two clicks (center, then edge).
 * It prints a ready-to-paste line for the `hazards` list of config.js.
 * Depends on: viewer, MARS (index.html), optional CONFIG (config.js).
 * Turn off route drawing before using it. Remove this file before the final submission if you wish. */
(function () {
  "use strict";
  const host = document.getElementById("picker-ui");
  if (!host || typeof viewer === "undefined") return;
  if (!new URLSearchParams(location.search).has("dev")) return;   // team tool: only with index.html?dev

  host.innerHTML = `
    <h2>Hazard picker (team tool)</h2>
    <button type="button" id="pk-btn" class="poi" aria-pressed="false">Measure a hazard</button>
    <div class="muted" id="pk-msg">Click the button, then click the center and the edge of a hazard.</div>
    <pre id="pk-out" class="card" style="white-space: pre-wrap; font-size: 12px; user-select: all;" hidden></pre>`;

  const btn = host.querySelector("#pk-btn"), msg = host.querySelector("#pk-msg"), out = host.querySelector("#pk-out");
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let active = false, center = null, preview = [];
  let counter = (typeof CONFIG !== "undefined" ? CONFIG.hazards.length : 0) + 1;

  const deg = (c, k) => Cesium.Math.toDegrees(c[k]);
  const clearPreview = () => { preview.splice(0).forEach(e => viewer.entities.remove(e)); };

  function setActive(on) {
    active = on; center = null;
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "Cancel" : "Measure a hazard";
    viewer.scene.canvas.style.cursor = on ? "crosshair" : "";
    if (on) {
      msg.textContent = "Click the CENTER of the hazard.";
      handler.setInputAction(onClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }

  async function onClick(click) {
    const p = viewer.camera.pickEllipsoid(click.position, MARS);
    if (!p) return;

    if (!center) {
      center = p;
      clearPreview();
      preview.push(viewer.entities.add({ position: p, point: { pixelSize: 8, color: Cesium.Color.WHITE } }));
      msg.textContent = "Now click the EDGE of the hazard.";
      return;
    }

    const a = Cesium.Cartographic.fromCartesian(center, MARS), b = Cesium.Cartographic.fromCartesian(p, MARS);
    const meters = new Cesium.EllipsoidGeodesic(a, b, MARS).surfaceDistance;
    preview.push(viewer.entities.add({
      position: center,
      ellipse: { semiMajorAxis: meters, semiMinorAxis: meters, height: 0,
                 material: Cesium.Color.WHITE.withAlpha(0.2), outline: true, outlineColor: Cesium.Color.WHITE }
    }));

    const line = `{ id: "h${counter++}", type: "rocks", label: "TODO name (identified on CTX imagery)", ` +
      `lat: ${deg(a, "latitude").toFixed(3)}, lon: ${deg(a, "longitude").toFixed(3)}, ` +
      `radiusKm: ${(meters / 1000).toFixed(1)}, level: "warning" },`;
    out.textContent = line;
    out.hidden = false;
    msg.textContent = "Edit type, label and level, then paste the line into config.js.";
    try { await navigator.clipboard.writeText(line); msg.textContent += " (Copied to the clipboard.)"; } catch (e) { /* manual copy */ }
    setActive(false);
  }

  btn.addEventListener("click", () => setActive(!active));
})();
