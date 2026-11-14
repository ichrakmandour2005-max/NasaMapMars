/* config.js : tout le contenu de la mission, au même endroit.
 * À modifier demain avec l’équipe. Les éléments marqués `example: true`
 * sont des EXEMPLES de structure, pas des données réelles : à remplacer. */
const CONFIG = {
  mission: {
    title: "Sortie au mont Sharp (à confirmer)",
    objective: "Étudier les formations « boxwork » (objectif à confirmer par l’équipe).",
    story: "Briefing à écrire : durée de la sortie, équipage, véhicule, risques principaux.",
    example: true
  },

  // Étapes du trajet de la mission. level : "ok" | "warning" | "danger"
  // photo : adresse d’une image prise par un rover (optionnel)
  steps: [
    { name: "Départ : habitat (exemple)",   lat: -4.95, lon: 137.40, level: "ok",      note: "Point de départ. Vérification des combinaisons.", photo: "" },
    { name: "Étape 1 (exemple)",            lat: -5.05, lon: 137.45, level: "warning", note: "Terrain à décrire d’après les données réelles.",  photo: "" },
    { name: "Objectif scientifique (exemple)", lat: -5.15, lon: 137.50, level: "ok",   note: "Zone d’étude : à décrire.",                       photo: "" }
  ],

  // Zones à éviter. type : "slope" | "rocks" | "radiation". level : "warning" | "danger"
  hazards: [
    { id: "h1", type: "slope", label: "Pente forte (exemple)",    lat: -5.02, lon: 137.42, radiusKm: 6, level: "warning", example: true },
    { id: "h2", type: "rocks", label: "Zone rocheuse (exemple)",  lat: -5.35, lon: 137.70, radiusKm: 8, level: "danger",  example: true }
  ]
};
