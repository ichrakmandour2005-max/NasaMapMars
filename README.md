# Mars 3D : planificateur de sortie pour astronaute

Projet réalisé pour le **NASA International Space Apps Challenge**, défi : créer une carte, un outil ou une interface qu'un astronaute pourrait utiliser pendant une exploration de la surface de Mars, à partir de données et d'outils NASA.

> Statut : prototype en cours de développement.

## Objectif

Donner à un astronaute une vue 3D de Mars où il peut superposer plusieurs types de données NASA, repérer sa zone d'exploration et préparer un trajet à pied.

- **Utilisateur visé** : un astronaute qui prépare une sortie sur la surface de Mars
- **Lieu et objectif scientifique** : _à compléter (par exemple : étudier les formations « boxwork » au mont Sharp)_

## Fonctionnalités actuelles

- Globe 3D de Mars (CesiumJS) avec les dimensions réelles de la planète
- Quatre couches de données NASA activables, avec réglage de l'opacité :
  - imagerie couleur (Viking)
  - imagerie haute résolution de Gale (CTX)
  - relief coloré (MOLA)
  - températures infrarouges (THEMIS)
- Zoom (molette, boutons + et −, retour à la vue globale) et affichage de l'altitude de la caméra
- Quatre zones d'intérêt avec vol de caméra : mont Sharp (cratère Gale), cratère Jezero, Olympus Mons, Valles Marineris
- Outil de trajet : poser des points sur le globe, tracer la ligne, calculer la distance et la durée de marche estimée, exporter en GeoJSON
- Cartes environnementales sourcées : plage de dose de surface publiée par NASA/RAD et lien direct vers l'archive météo REMS (les observations météo restent historiques et sol-spécifiques, sans fausse prévision)

## Lancer le projet

Le projet est une application statique en **HTML, CSS et JavaScript**. Ouvrez
`index.html` avec l'extension **Live Server** de Visual Studio Code.

Une connexion internet est nécessaire : CesiumJS et les tuiles de Mars Trek sont chargés en ligne.

## Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` | Écran de briefing et carte Mars |
| `style.css` | Interface responsive (mobile, tablette, bureau) |
| `app.js` | Contrôles de l'application, globe Cesium, couches et points d'intérêt |
| `environment.js` / `environment-ui.js` | Métadonnées NASA de radiation et météo et rendu des cartes du briefing |
| `config.js` | Données JavaScript de la mission, arrêts et sources NASA |
| `README.md` | Ce document |

## Sources de données

Toutes les couches viennent de **NASA/JPL Mars Trek** (service de tuiles WMTS, trek.nasa.gov) :

| Couche | Origine |
|---|---|
| Imagerie couleur | Mosaïque globale Viking, 232 m/pixel |
| Relief coloré | Altimètre laser MOLA (Mars Global Surveyor) |
| Thermique | THEMIS, jour, infrarouge, 100 m/pixel (couverture entre 65° S et 65° N) |

Les photos des étapes Curiosity utilisent également les pages officielles NASA Science Photojournal indiquées dans `config.js`.

Les cartes environnementales utilisent le résumé NASA du rayonnement mesuré par MSL/RAD (0,21–0,25 mGy/jour en surface) et l'archive NASA PDS des mesures REMS. Ces informations ne sont pas une télémétrie temps réel et ne représentent pas automatiquement chaque arrêt de l'itinéraire.

## Limites connues

- Le globe affiche des **images** : le relief est coloré, mais le terrain en 3D reste lisse.
- La résolution des couches ne permet pas encore une navigation à l'échelle d'un astronaute à pied.
- La **vitesse de marche** de l'outil de trajet (1,5 km/h) est une **hypothèse modifiable**, pas une valeur NASA.
- Le trajet est tracé par l'utilisateur : il n'y a pas encore de calcul automatique évitant pentes, obstacles ou zones de radiation.
- Les cinq étapes utilisent des waypoints représentatifs de la carte NASA/Mars Trek ; ils ne sont pas des coordonnées GPS officielles de toute une unité géologique.

## Prochaines étapes

- [x] Choisir le lieu et l'objectif scientifique de la mission
- [x] Brancher les données des ressources officielles
- [x] Ajouter des photos Curiosity et des descriptions aux étapes
- [x] Ajouter un indicateur de radiation sourcé et un accès à l'archive météo REMS, sans inventer de prévision
- [x] Ajouter cinq waypoints de carte NASA/Mars Trek pour permettre le zoom et l'itinéraire de démonstration
- [ ] Remplacer les waypoints par des coordonnées officielles ponctuelles si une table NASA est publiée
- [ ] Évaluer un calcul de trajet évitant les zones dangereuses
- [ ] Enregistrer la vidéo de démonstration
- [ ] Soumettre le projet avant la date limite (bouton « Submit for Judging »)

## Équipe

- _Nom 1 : rôle_
- _Nom 2 : rôle_

## Crédits

Données : NASA/JPL Mars Trek. Affichage 3D : [CesiumJS](https://cesium.com/platform/cesiumjs/).
