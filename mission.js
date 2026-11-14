/* mission.js : briefing de mission et étapes (contenu dans config.js).
 * Dépend de : viewer, MARS (index.html), CONFIG (config.js), MarsRoute (route.js, optionnel). */
(function () {
  "use strict";
  const host = document.getElementById("mission-ui");
  if (!host || typeof CONFIG === "undefined" || typeof viewer === "undefined") return;

  const LEVELS = { ok: "Sûr", warning: "Attention", danger: "Danger" };
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
  if (M.example) host.append(el("span", "badge badge-example", "Contenu d’exemple"));

  host.append(el("h2", "", "Étapes"));
  const list = el("div", "steps");
  const detail = el("div", "card");
  detail.hidden = true;

  function flyTo(s) {
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
      img.alt = "Vue au sol : " + s.name;
      detail.append(img);
    } else {
      detail.append(el("p", "muted", "Photo à ajouter (images des rovers)."));
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

  const load = el("button", "poi", "Charger ces étapes comme trajet");
  load.type = "button";
  load.addEventListener("click", () => {
    if (window.MarsRoute) MarsRoute.setWaypoints(CONFIG.steps);
  });

  host.append(list, detail, load);
})();
