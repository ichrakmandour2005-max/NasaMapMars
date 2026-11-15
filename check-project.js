/* check-project.js: quick health check of the project folder.
 * Run from the project root:   node check-project.js
 * It looks for merge-conflict markers, syntax errors, missing files or containers,
 * French text, and invalid data in config.js. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const problems = [], notes = [];
const read = f => fs.readFileSync(f, "utf8");
const files = fs.readdirSync(".").filter(f => /\.(js|html|css|md)$/.test(f) && f !== "check-project.js");

// 1. Merge-conflict markers (any file)
files.forEach(f => read(f).split("\n").forEach((l, i) => {
  if (/^(<<<<<<<|=======|>>>>>>>)/.test(l)) problems.push(f + ":" + (i + 1) + " merge-conflict marker (" + l.slice(0, 7) + ")");
}));

// 2. JavaScript syntax
files.filter(f => f.endsWith(".js")).forEach(f => {
  try { new vm.Script(read(f), { filename: f }); } catch (e) { problems.push(f + " syntax error: " + e.message); }
});

// 3. index.html: local scripts exist, no duplicates, containers used by the modules exist
if (!fs.existsSync("index.html")) problems.push("index.html not found (run this from the project root)");
else {
  const html = read("index.html");
  const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]).filter(s => !/^https?:/.test(s));
  srcs.forEach((s, i) => {
    if (!fs.existsSync(s)) problems.push("index.html loads " + s + " but the file is missing");
    if (srcs.indexOf(s) !== i) problems.push("index.html loads " + s + " more than once");
  });
  files.filter(f => f.endsWith(".js") && f !== "config.js").forEach(f => {
    if (!srcs.includes(f)) notes.push(f + " is not loaded by index.html");
    [...read(f).matchAll(/getElementById\("([a-z]+-ui)"\)/g)].forEach(m => {
      if (!html.includes('id="' + m[1] + '"')) problems.push(f + " needs <div id=\"" + m[1] + "\"> in index.html");
    });
  });
  const order = ["config.js", "route.js", "mission.js", "itinerary.js", "regions.js"].filter(s => srcs.includes(s));
  if (order.join() !== order.slice().sort((a, b) => srcs.indexOf(a) - srcs.indexOf(b)).join()) problems.push("script order in index.html looks wrong");
}

// 4. French text left in the project
files.forEach(f => read(f).split("\n").forEach((l, i) => {
  if (/[àâçéèêëîïôûùœÀÉÈ]/.test(l.replace(/NASA’s|“|”|’/g, ""))) notes.push(f + ":" + (i + 1) + " may contain French: " + l.trim().slice(0, 70));
}));

// 5. config.js content
if (fs.existsSync("config.js")) {
  try {
    const ctx = {}; vm.createContext(ctx);
    vm.runInContext(read("config.js").replace(/^const CONFIG/m, "var CONFIG"), ctx);
    const C = ctx.CONFIG, levels = ["ok", "warning", "danger", "unknown"];
    if (!C.mission || !C.mission.title) problems.push("config.js: mission.title is missing");
    if (C.mission && C.mission.example) notes.push("config.js: mission.example is still true (the page labels the mission as an example)");
    if (!Array.isArray(C.steps) || !C.steps.length) problems.push("config.js: steps is missing or empty");
    else {
      C.steps.forEach((s, i) => {
        const nul = s.lat === null && s.lon === null, ok = Number.isFinite(s.lat) && Number.isFinite(s.lon);
        if (!nul && !ok) problems.push("config.js: step " + (i + 1) + " (" + s.name + ") has invalid lat/lon");
        if (ok && (s.lat > 0 || s.lon < 0)) notes.push("config.js: step " + (i + 1) + " is outside the expected Gale area: check lat/lon order");
        if (!levels.includes(s.level)) problems.push("config.js: step " + (i + 1) + " has invalid level " + s.level);
      });
      const placed = C.steps.filter(s => Number.isFinite(s.lat)).length;
      if (placed < C.steps.length) notes.push("config.js: " + placed + "/" + C.steps.length + " stops have coordinates");
    }
    if (!Array.isArray(C.hazards)) problems.push("config.js: hazards must be an array");
    else C.hazards.forEach(h => { if (!Number.isFinite(h.lat) || !Number.isFinite(h.lon) || !(h.radiusKm > 0)) problems.push("config.js: hazard " + h.id + " has invalid lat/lon/radiusKm"); if (h.example) notes.push("config.js: hazard " + h.id + " is still marked as an example"); });
    if (C.regions && !Array.isArray(C.regions)) problems.push("config.js: regions must be an array");
    if (!C.regions) notes.push("config.js: no regions defined yet");
  } catch (e) { problems.push("config.js cannot be loaded: " + e.message); }
}

console.log(problems.length ? "PROBLEMS (" + problems.length + "):\n - " + problems.join("\n - ") : "No problems found.");
if (notes.length) console.log("\nNOTES (" + notes.length + "):\n - " + notes.join("\n - "));
