/* config.js: mission content (Person B).
 * Sources approved by the team: NASA Mars Trek and NASA's
 * “Curiosity's Proposed Path up Mount Sharp” map.
 * The five targets have no published coordinate list in those sources, so
 * coordinates remain null until the team verifies them in Mars Trek. */
const CONFIG = {
  mission: {
    title: "Curiosity: Climbing Mount Sharp",
    period: "Curiosity mission in Gale Crater — proposed route map published May 15, 2019",
    objective: "Follow the geological targets identified on NASA's route map, from clay-bearing terrain toward sulfate-bearing units.",
    story: "A science reconnaissance mission in Gale Crater. Mars Trek describes Mount Sharp as layered rock deposits containing clays, sulfates, and salts: sedimentary minerals associated with past water activity.",
    source: {
      label: "NASA — Curiosity's Proposed Path up Mount Sharp",
      url: "https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/"
    }
  },

  // NASA map targets, in the proposed order of travel.
  // level: "ok" | "warning" | "danger"
  // Coordinates will be added after verification in Mars Trek.
  // No photo is set: the supplied raw-image gallery is Perseverance-only,
  // so it must not be presented as a Curiosity ground image.
  steps: [
    {
      name: "Clay-Bearing Unit",
      lat: null, lon: null, level: "ok", photo: "",
      note: "First target on the NASA route. The astronaut documents clay-rich layers and compares them with nearby landforms. Clays are among the sedimentary minerals associated with ancient water in Gale Crater."
    },
    {
      name: "Greenheugh Pediment",
      lat: null, lon: null, level: "warning", photo: "",
      note: "An intermediate landform identified on the proposed route. The observation focuses on the topographic transition between the clay-bearing unit and the Gediz Vallis landforms."
    },
    {
      name: "Gediz Vallis Ridge",
      lat: null, lon: null, level: "warning", photo: "",
      note: "A ridge named on the NASA map. The astronaut records its shape, continuity, and visible structure before continuing toward the channel."
    },
    {
      name: "Gediz Vallis Channel",
      lat: null, lon: null, level: "warning", photo: "",
      note: "A channel shown in the upper section of the route. The goal is to document its morphology and its relationship to nearby geological units."
    },
    {
      name: "Sulfate-Bearing Unit",
      lat: null, lon: null, level: "ok", photo: "",
      note: "The upper target of the proposed route. The astronaut studies sulfate-bearing layers, another set of Mount Sharp sedimentary minerals associated with past water activity."
    }
  ],

  // Areas to avoid.
  // type: "slope" | "rocks" | "radiation"   level: "warning" | "danger"
  // Add a hazard only when its source data can be named.
  hazards: []
};
