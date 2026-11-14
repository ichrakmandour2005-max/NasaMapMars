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
              el("p", "muted", M.objective), el("p", "muted", M.story));
<<<<<<< HEAD
  if (M.source) {
    const source = document.createElement("a");
    source.className = "muted";
    source.href = M.source.url;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "Source : " + M.source.label;
    host.append(source);
  }
=======
  if (M.example) host.append(el("span", "badge badge-example", "Example content"));
>>>>>>> 1dbb485fca47af1747a79253a325b127ebaee24c

  host.append(el("h2", "", "Stops"));
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
    } else {
<<<<<<< HEAD
      detail.append(el("p", "muted", "Photo Curiosity non ajoutée : les ressources autorisées ne fournissent pas de galerie Curiosity."));
    }
    if (!Number.isFinite(s.lat) || !Number.isFinite(s.lon)) {
      detail.append(el("p", "muted", "Coordonnées à relever et vérifier dans NASA Mars Trek avant de charger cette étape sur le globe."));
=======
      detail.append(el("p", "muted", "Photo to add (rover images)."));
>>>>>>> 1dbb485fca47af1747a79253a325b127ebaee24c
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
  if (!routeReady) load.title = "Les coordonnées des cibles doivent d'abord être vérifiées dans Mars Trek.";
  load.addEventListener("click", () => {
    if (window.MarsRoute) MarsRoute.setWaypoints(CONFIG.steps);
  });

  host.append(list, detail, load);
})();
