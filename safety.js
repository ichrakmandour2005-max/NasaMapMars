/* safety.js : zones à risque (config.js) affichées sur le globe + analyse du trajet tracé.
 * Dépend de : viewer, MARS (index.html), CONFIG (config.js), MarsRoute (route.js). */
(function () {
  "use strict";
  const host = document.getElementById("safety-ui");
  if (!host || typeof CONFIG === "undefined" || typeof viewer === "undefined") return;

  const COLORS = { warning: "#e0b04a", danger: "#e0705a" };
  const LEVELS = { ok: "Sûr", warning: "Attention", danger: "Danger" };
  const TYPES = { slope: "pente forte", rocks: "zone rocheuse", radiation: "radiation / météo spatiale" };
  const SAMPLES_PER_SEGMENT = 20;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  /* ---------- Zones sur le globe ---------- */
  const zones = CONFIG.hazards.map(h => {
    const color = Cesium.Color.fromCssColorString(COLORS[h.level]);
    return viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, 0, MARS),
      ellipse: {
        semiMajorAxis: h.radiusKm * 1000, semiMinorAxis: h.radiusKm * 1000, height: 0,
        material: color.withAlpha(0.3), outline: true, outlineColor: color
      }
    });
  });

  /* ---------- Calculs ---------- */
  const carto = p => Cesium.Cartographic.fromDegrees(p.lon, p.lat);
  const same = (a, b) => a.longitude === b.longitude && a.latitude === b.latitude;

  function distanceM(a, b) {
    const ca = carto(a), cb = carto(b);
    if (same(ca, cb)) return 0;
    const d = new Cesium.EllipsoidGeodesic(ca, cb, MARS).surfaceDistance;
    return Number.isFinite(d) ? d : 0;
  }

  // Points régulièrement répartis le long du trajet
  function samples(wps) {
    const out = wps.length ? [wps[0]] : [];
    for (let i = 1; i < wps.length; i++) {
      const a = carto(wps[i - 1]), b = carto(wps[i]);
      if (same(a, b)) continue;
      const g = new Cesium.EllipsoidGeodesic(a, b, MARS);
      for (let k = 1; k <= SAMPLES_PER_SEGMENT; k++) {
        const c = g.interpolateUsingFraction(k / SAMPLES_PER_SEGMENT);
        out.push({ lat: Cesium.Math.toDegrees(c.latitude), lon: Cesium.Math.toDegrees(c.longitude) });
      }
    }
    return out;
  }

  /* ---------- Interface ---------- */
  host.append(el("h2", "", "Sécurité"));
  host.append(el("p", "muted", "Les zones à risque actuelles sont des exemples, à remplacer par des données réelles."));

  const toggle = el("label", "layer");
  const check = el("input");
  check.type = "checkbox";
  check.checked = true;
  check.addEventListener("change", () => zones.forEach(z => { z.show = check.checked; }));
  toggle.append(check, " Afficher les zones à risque");

  const result = el("div", "card");
  host.append(toggle, result);

  function analyse() {
    const wps = window.MarsRoute ? MarsRoute.getWaypoints() : [];
    result.replaceChildren();
    if (wps.length < 2) {
      result.append(el("p", "muted", "Trace un trajet pour l’analyser."));
      return;
    }
    const pts = samples(wps);
    const hit = CONFIG.hazards.filter(h => pts.some(p => distanceM(p, h) <= h.radiusKm * 1000));
    const level = hit.some(h => h.level === "danger") ? "danger" : hit.length ? "warning" : "ok";

    result.append(el("span", "badge badge-" + level, LEVELS[level]));
    if (!hit.length) {
      result.append(el("p", "muted", "Le trajet ne traverse aucune zone à risque connue."));
    } else {
      result.append(el("p", "muted", "Le trajet traverse " + hit.length + " zone(s) :"));
      const ul = el("ul", "muted");
      hit.forEach(h => ul.append(el("li", "", h.label + " : " + (TYPES[h.type] || h.type))));
      result.append(ul);
    }
  }

  window.addEventListener("marsroute:change", analyse);
  analyse();
})();
