/* mission.js: mission briefing and stops (content lives in config.js).
 * Depends on: viewer, MARS (index.html), CONFIG (config.js), MarsRoute (route.js, optional). */
(function () {
  "use strict";
  const host = document.getElementById("mission-ui");
  if (!host || typeof CONFIG === "undefined" || typeof viewer === "undefined") return;

  const LEVELS = { ok: "Safe", warning: "Caution", danger: "Danger", unknown: "Not assessed" };
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const badge = level => el("span", "badge badge-" + level, LEVELS[level] || level);
  const link = (href, text) => {
    const a = el("a", "muted", text);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  };

  const M = CONFIG.mission;
  host.append(el("h2", "", "Mission"), el("p", "mission-title", M.title),
              el("p", "muted", M.period), el("p", "muted", M.objective), el("p", "muted", M.story));
  if (M.source) host.append(link(M.source.url, "Source: " + M.source.label));

  host.append(el("h2", "", "Mission stops"));
  const list = el("div", "steps");
  const detail = el("div", "card");
  detail.hidden = true;

  const hasCoords = s => Number.isFinite(s.lat) && Number.isFinite(s.lon);

  function flyTo(s) {
    if (!hasCoords(s)) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(s.lon, s.lat - 1.5, 450000, MARS),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-50), roll: 0 },
      duration: 3
    });
  }

  function showDetail(s) {
    detail.replaceChildren(el("strong", "", s.name), badge(s.level || "unknown"), el("p", "muted", s.note));
    if (s.photo) {
      const img = el("img", "step-photo");
      img.src = s.photo;
      img.alt = "Ground view: " + s.name;
      img.addEventListener("error", () => {
        img.replaceWith(el("p", "muted", "Photo could not be loaded. Use the source link below."));
      });
      detail.append(img);
      if (s.photoCaption) detail.append(el("p", "muted", s.photoCaption));
      if (s.photoSource) detail.append(link(s.photoSource, "Photo source: " + (s.photoCredit || "NASA")));
    } else {
      detail.append(el("p", "muted", "Ground photo unavailable: the approved resources do not provide a Curiosity image gallery for this target."));
    }
    if (!hasCoords(s)) {
      detail.append(el("p", "muted", "Coordinates must be collected and verified in NASA Mars Trek before this stop can be placed on the globe."));
    }
    detail.hidden = false;
  }

  CONFIG.steps.forEach((s, i) => {
    const b = el("button", "poi");
    b.type = "button";
    b.append((i + 1) + ". " + s.name + " ", badge(s.level || "unknown"));
    b.addEventListener("click", () => { flyTo(s); showDetail(s); });
    list.append(b);
  });

  const load = el("button", "poi", "Load these stops as a route");
  load.type = "button";
  load.hidden = !window.MarsRoute;
  const updateLoad = () => {
    const ready = CONFIG.steps.length >= 2 && CONFIG.steps.every(hasCoords);
    load.disabled = !ready;
    load.title = ready ? "" : "Target coordinates must first be verified in Mars Trek.";
  };
  updateLoad();
  window.addEventListener("marsstops:change", updateLoad);
  load.addEventListener("click", () => {
    if (window.MarsRoute) MarsRoute.setWaypoints(CONFIG.steps);
  });

  host.append(list, detail, load);

  // Lets itinerary.js open a stop when its marker is clicked on the globe
  window.MarsMission = {
    select(i) {
      const s = CONFIG.steps[i];
      if (s) { flyTo(s); showDetail(s); }
    }
  };
})();
