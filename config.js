/* config.js: mission content (Person B).
 * Sources approved by the team: NASA Mars Trek and NASA's
 * “Curiosity's Proposed Path up Mount Sharp” map.
 * Coordinates below are representative map waypoints selected from the NASA
 * annotated Mount Sharp route and Mars Trek layers. They are not rover GPS
 * fixes for the full geological units. */
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
  // Coordinates are map waypoints; coordinateType makes that limitation visible.
  // Each photo below is an official Curiosity image from NASA Photojournal.
  steps: [
    {
      name: "Clay-Bearing Unit",
      lat: -4.7297, lon: 137.3857, coordinateType: "NASA map waypoint", level: "ok",
      photo: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia23/pia23139/PIA23139.jpg?fit=clip&h=600&w=1200",
      photoCaption: "Curiosity's Mastcam mosaic of the clay-bearing unit (Sol 2309).",
      photoSource: "https://science.nasa.gov/photojournal/curiosity-surveys-the-clay-bearing-unit/",
      note: "First target on the NASA route. The astronaut documents clay-rich layers and compares them with nearby landforms. NASA's orbital observations found a strong clay signal here, indicating that water may have played a role in its formation."
    },
    {
      name: "Greenheugh Pediment",
      lat: -4.63, lon: 137.41, coordinateType: "NASA map waypoint", level: "warning",
      photo: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia23/pia23974/PIA23974.jpg?fit=clip&h=600&w=1200",
      photoCaption: "Curiosity's view from the top of Greenheugh Pediment (Sol 2729).",
      photoSource: "https://science.nasa.gov/photojournal/curiositys-view-from-the-top-of-the-greenheugh-pediment/",
      note: "An intermediate landform identified on the proposed route. Curiosity reached this steep feature in 2020; the view shows its crusty sandstone cap and looks back toward the clay-bearing unit."
    },
    {
      name: "Gediz Vallis Ridge",
      lat: -4.77, lon: 137.395, coordinateType: "NASA map waypoint", level: "warning",
      photo: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26019/PIA26019.jpg?fit=clip&h=600&w=1200",
      photoCaption: "Curiosity's Mastcam panorama below Gediz Vallis Ridge (Sol 3923).",
      photoSource: "https://science.nasa.gov/photojournal/curiosity-views-gediz-vallis-ridge/",
      note: "A ridge named on the NASA map. Curiosity reached it after a difficult climb; NASA describes it as preserving evidence from one of the last wet periods in this area of Mars."
    },
    {
      name: "Gediz Vallis Channel",
      lat: -4.85, lon: 137.44, coordinateType: "NASA map waypoint", level: "warning",
      photo: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26410/PIA26410.jpg?fit=clip&h=600&w=1200",
      photoCaption: "Curiosity's Mastcam panorama inside Gediz Vallis Channel (Sols 4311–4312).",
      photoSource: "https://science.nasa.gov/photojournal/curiositys-view-within-gediz-vallis-channel/",
      note: "A channel shown in the upper section of the route. Curiosity's panorama records a field of bright sulfur stones; the rover exposed the first pure sulfur discovered on Mars in this channel."
    },
    {
      name: "Mg-Sulfate Bearing Unit",
      lat: -4.75, lon: 137.42, coordinateType: "NASA map waypoint", level: "ok",
      photo: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26551/PIA26551.jpg?fit=clip&h=600&w=1200",
      photoCaption: "Curiosity looks downslope from the sulfate-bearing unit (Sol 4447).",
      photoSource: "https://science.nasa.gov/photojournal/curiosity-looks-downslope-from-the-sulfate-unit/",
      note: "The upper target of the proposed route. The astronaut studies sulfate-bearing layers, which help scientists compare the changing environments recorded in Mount Sharp's successive rock layers."
    }
  ],

  // Areas to avoid.
  // type: "slope" | "rocks" | "radiation"   level: "warning" | "danger"
  // Add a hazard only when its source data can be named.
  hazards: []
};
