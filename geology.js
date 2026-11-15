/* geology.js: USGS geologic map of Mars (SIM 3292) for the Gale area.
 * Loads the polygons from the public USGS/ArcGIS feature service and draws them on the globe.
 * Scale of the source map is 1:20,000,000: regional context only, not route-level detail.
 * Depends on: viewer (index.html) and a <div id="geology-ui"></div> container. */
(function () {
  "use strict";
  const host = document.getElementById("geology-ui");
  if (!host || typeof viewer === "undefined") return;

  const SERVICE = "https://services.arcgis.com/nzS0F0zdNLvs7nc8/ArcGIS/rest/services/Mars_Geology_feature_layer/FeatureServer/0/query";
  const BBOX = [136.6, -6.2, 138.6, -3.8];   // west, south, east, north (degrees) around Gale

  host.innerHTML = `
    <h2>Geologic map (USGS)</h2>
    <label class="layer"><input type="checkbox" id="geo-check"> Show geologic units</label>
    <div class="muted">Source: USGS SIM 3292, scale 1:20,000,000. Regional context only: not precise enough for route planning.</div>
    <div id="geo-legend" class="muted"></div>`;
  const check = host.querySelector("#geo-check"), legend = host.querySelector("#geo-legend");
  let ds = null, loading = false;

  // One stable color per unit code
  const colorFor = unit => {
    let h = 0;
    for (const ch of unit) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return Cesium.Color.fromHsl(h / 360, 0.65, 0.5, 0.35);
  };

  async function load() {
    loading = true;
    legend.textContent = "Loading…";
    const url = SERVICE + "?" + new URLSearchParams({
      where: "1=1", geometry: BBOX.join(","), geometryType: "esriGeometryEnvelope",
      spatialRel: "esriSpatialRelIntersects", outFields: "Unit,UnitDesc",
      maxAllowableOffset: "0.01", f: "geojson"
    });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!json.features || !json.features.length) throw new Error("no units returned");

      ds = await Cesium.GeoJsonDataSource.load(json);
      const seen = new Map();
      ds.entities.values.forEach(e => {
        const unit = (e.properties && e.properties.Unit && e.properties.Unit.getValue()) || "?";
        const desc = (e.properties && e.properties.UnitDesc && e.properties.UnitDesc.getValue()) || "";
        if (e.polygon) {
          e.polygon.material = colorFor(unit);
          e.polygon.height = 0;
          e.polygon.outline = true;
          e.polygon.outlineColor = Cesium.Color.WHITE.withAlpha(0.6);
        }
        seen.set(unit, desc);
      });
      await viewer.dataSources.add(ds);
      ds.show = check.checked;

      legend.replaceChildren();
      seen.forEach((desc, unit) => {
        const row = document.createElement("div");
        const sw = document.createElement("span");
        sw.style.cssText = "display:inline-block;width:10px;height:10px;margin-right:6px;border-radius:2px;background:" +
                           colorFor(unit).withAlpha(1).toCssColorString();
        row.append(sw, unit + (desc ? ": " + desc : ""));
        legend.append(row);
      });
    } catch (err) {
      ds = null;
      legend.textContent = "Could not load the geologic map (" + err.message + "). Check your connection and try again.";
    }
    loading = false;
  }

  check.addEventListener("change", () => {
    if (ds) { ds.show = check.checked; return; }
    if (check.checked && !loading) load();
  });
})();
