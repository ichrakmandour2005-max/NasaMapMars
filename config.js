/* config.js: contenu scientifique de la mission.
 * Sources autorisées par l'équipe : NASA Mars Trek et la carte NASA
 * « Curiosity's Proposed Path up Mount Sharp ».
 * Les coordonnées précises des cinq cibles ne sont pas fournies par ces
 * ressources sous forme de liste : elles restent volontairement null jusqu'à
 * leur relevé dans Mars Trek. */
const CONFIG = {
  mission: {
    title: "Curiosity : montée vers le mont Sharp",
    objective: "Suivre les cibles géologiques indiquées par la carte de route NASA, des terrains argileux vers les unités porteuses de sulfates.",
    story: "Mission de reconnaissance scientifique dans le cratère Gale. Mars Trek indique que le mont Sharp contient des dépôts rocheux stratifiés avec argiles, sulfates et sels, des minéraux associés à l'action passée de l'eau.",
    source: {
      label: "NASA — Curiosity’s Proposed Path up Mount Sharp",
      url: "https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/"
    }
  },

  // Cibles de la carte NASA, dans l'ordre proposé de progression.
  // level: "ok" | "warning" | "danger"
  // Les coordonnées seront ajoutées après leur vérification dans Mars Trek.
  // Aucune photo n'est renseignée : la galerie fournie concerne Perseverance,
  // pas Curiosity, et ne doit donc pas être utilisée ici.
  steps: [
    {
      name: "Clay-Bearing Unit",
      lat: null, lon: null, level: "ok", photo: "",
      note: "Première cible de la route NASA. L'astronaute y documente des couches riches en argiles et les compare aux reliefs voisins. Les argiles font partie des minéraux sédimentaires associés à l'eau ancienne dans le cratère Gale."
    },
    {
      name: "Greenheugh Pediment",
      lat: null, lon: null, level: "warning", photo: "",
      note: "Relief intermédiaire identifié sur la route proposée. L'observation porte sur la transition topographique entre l'unité argileuse et les reliefs de Gediz Vallis."
    },
    {
      name: "Gediz Vallis Ridge",
      lat: null, lon: null, level: "warning", photo: "",
      note: "Crête nommée dans la carte NASA. L'astronaute relève la forme, la continuité et la structure visible de ce relief avant la progression vers le chenal."
    },
    {
      name: "Gediz Vallis Channel",
      lat: null, lon: null, level: "warning", photo: "",
      note: "Chenal indiqué dans la partie haute de l'itinéraire. L'objectif est de documenter sa morphologie et ses relations avec les unités géologiques voisines."
    },
    {
      name: "Sulfate-Bearing Unit",
      lat: null, lon: null, level: "ok", photo: "",
      note: "Cible haute de l'itinéraire proposé. L'astronaute étudie les couches porteuses de sulfates, un autre ensemble de minéraux sédimentaires du mont Sharp associé à l'action passée de l'eau."
    }
  ],

  // Areas to avoid.
  // type: "slope" | "rocks" | "radiation"   level: "warning" | "danger"
  // Only mark a hazard as real (remove `example`) if you can name the data it comes from.
  hazards: []
};
