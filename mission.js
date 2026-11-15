/* mission.js: mission briefing and stops (content lives in config.js).
 * Depends on: viewer, MARS (index.html), CONFIG (config.js), MarsRoute (route.js, optional). */
(function () {
  "use strict";
  const host = document.getElementById("mission-ui");
  if (!host || typeof CONFIG === "undefined" || typeof viewer === "undefined") return;

  const LEVELS = { ok: "Safe", warning: "Caution", danger: "Danger" };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const badge = level => el("span", "badge badge-" + level, LEVELS[level] || level);

  const M = CONFIG.mission;
  host.append(el("h2", "", "Mission"), el("p", "mission-title", M.title),
              el("p", "muted", M.period), el("p", "muted", M.objective), el("p", "muted", M.story));
  if (M.source) {
    const source = document.createElement("a");
    source.className = "muted";
    source.href = M.source.url;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "Source: " + M.source.label;
    host.append(source);
  }

  host.append(el("h2", "", "Mission stops"));
  const list = el("div", "steps");
  const detail = el("div", "card");
  detail.hidden = true;

  function flyTo(s) {
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(s.lon, s.lat - 1.5, 450000, MARS),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-50), roll: 0 },
      duration: 3
    });
  }

  function showDetail(s) {
    detail.replaceChildren(el("strong", "", s.name), badge(s.level), el("p", "muted", s.note));
    if (s.photo) {
      const img = el("img", "step-photo");
      img.src = s.photo;
      img.alt = "Ground view: " + s.name;
      detail.append(img);
      if (s.photoCaption) detail.append(el("p", "muted", s.photoCaption));
      if (s.photoSource) {
        const photoSource = document.createElement("a");
        photoSource.className = "muted";
        photoSource.href = s.photoSource;
        photoSource.target = "_blank";
        photoSource.rel = "noopener noreferrer";
        photoSource.textContent = "Photo source: NASA/JPL-Caltech/MSSS";
        detail.append(photoSource);
      }
    } else {
      detail.append(el("p", "muted", "Ground photo unavailable: the approved resources do not provide a Curiosity image gallery for this target."));
    }
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) {
      detail.append(el("p", "muted", "Coordinates must be collected and verified in NASA Mars Trek before this stop can be placed on the globe."));
    }
    detail.hidden = false;
  }

  CONFIG.steps.forEach((s, i) => {
    const b = el("button", "poi");
    b.type = "button";
    b.append((i + 1) + ". " + s.name + " ", badge(s.level));
    b.addEventListener("click", () => { flyTo(s); showDetail(s); });
    list.append(b);
  });

  const load = el("button", "poi", "Load these stops as a route");
  load.type = "button";
  const routeReady = CONFIG.steps.length >= 2 && CONFIG.steps.every(s =>
    Number.isFinite(s.lat) && Number.isFinite(s.lon)
  );
  load.disabled = !routeReady;
  if (!routeReady) load.title = "Target coordinates must first be verified in Mars Trek.";
  const loadMessage = el("p", "muted", "");
  loadMessage.setAttribute("aria-live", "polite");
  load.addEventListener("click", () => {
    if (!window.MarsRoute) {
      loadMessage.textContent = "Route tool is not ready. Reload the page with Live Server.";
      return;
    }
    MarsRoute.setWaypoints(CONFIG.steps);
    const center = CONFIG.steps[Math.floor(CONFIG.steps.length / 2)];
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(center.lon, center.lat - 1.5, 450000, MARS),
      duration: 2
    });
    loadMessage.textContent = "Five NASA map waypoints loaded. Adjust the route in the Route panel below.";
  });

  host.append(list, detail, load, loadMessage);
})();
