/* config.js: all mission content in one place.
 * Edit this file with your team. Entries marked `example: true` are
 * PLACEHOLDERS showing the structure, not real data: replace them, then set
 * `example` to false (or delete it) so the interface stops labeling them. */
const CONFIG = {
  mission: {
    title: "Mount Sharp excursion",
    objective: "Study boxwork formations .",
    story: "Briefing to write: length of the excursion, crew, vehicle, main risks.",
    example: true
  },

  // Mission stops, in order of travel.
  // level: "ok" | "warning" | "danger"
  // photo: path or URL of a ground image (optional), e.g. "images/stop1.jpg"
  steps: [
    { name: "Start: habitat (example)",        lat: -4.95, lon: 137.40, level: "ok",      note: "Starting point. Suit and equipment checks.",          photo: "" },
    { name: "Stop 1 (example)",                lat: -5.05, lon: 137.45, level: "warning", note: "Describe the terrain using real data.",               photo: "" },
    { name: "Science target (example)",        lat: -5.15, lon: 137.50, level: "ok",      note: "Study area: to be described.",                        photo: "" }
  ],

  // Areas to avoid.
  // type: "slope" | "rocks" | "radiation"   level: "warning" | "danger"
  // Only mark a hazard as real (remove `example`) if you can name the data it comes from.
  hazards: [
    { id: "h1", type: "slope", label: "Steep slope (example)",  lat: -5.02, lon: 137.42, radiusKm: 6, level: "warning", example: true },
    { id: "h2", type: "rocks", label: "Rocky area (example)",   lat: -5.35, lon: 137.70, radiusKm: 8, level: "danger",  example: true }
  ]
};
