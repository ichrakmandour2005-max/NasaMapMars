# Mars 3D : planificateur de sortie pour astronaute

Projet réalisé pour le **NASA International Space Apps Challenge**, défi : créer une carte, un outil ou une interface qu'un astronaute pourrait utiliser pendant une exploration de la surface de Mars, à partir de données et d'outils NASA.

> Statut : prototype en cours de développement.

## Objectif

Donner à un astronaute une vue 3D de Mars où il peut superposer plusieurs types de données NASA, repérer sa zone d'exploration et préparer un trajet à pied.

- **Utilisateur visé** : un astronaute qui prépare une sortie sur la surface de Mars
- **Lieu et objectif scientifique** : _à compléter (par exemple : étudier les formations « boxwork » au mont Sharp)_

## Fonctionnalités actuelles

- Globe 3D de Mars (CesiumJS) avec les dimensions réelles de la planète
- Trois couches de données NASA activables, avec réglage de l'opacité :
  - imagerie couleur (Viking)
  - relief coloré (MOLA)
  - températures infrarouges (THEMIS)
- Zoom (molette, boutons + et −, retour à la vue globale) et affichage de l'altitude de la caméra
- Quatre zones d'intérêt avec vol de caméra : mont Sharp (cratère Gale), cratère Jezero, Olympus Mons, Valles Marineris
- Outil de trajet : poser des points sur le globe, tracer la ligne, calculer la distance et la durée de marche estimée, exporter en GeoJSON

## Lancer le projet

1. Cloner le dépôt ou télécharger les fichiers
2. Ouvrir le dossier dans **Visual Studio Code**
3. Installer l'extension **Live Server**
4. Clic droit sur `index.html`, puis **Open with Live Server**

Une connexion internet est nécessaire : CesiumJS et les tuiles de cartes sont chargés en ligne.

## Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` | Page principale : globe, couches, zoom, zones d'intérêt |
| `route.js` | Module de trajet (points, ligne, distance, durée). Doit rester dans le même dossier que `index.html` |
| `README.md` | Ce document |

## Sources de données

Toutes les couches viennent de **NASA/JPL Mars Trek** (service de tuiles WMTS, trek.nasa.gov) :

| Couche | Origine |
|---|---|
| Imagerie couleur | Mosaïque globale Viking, 232 m/pixel |
| Relief coloré | Altimètre laser MOLA (Mars Global Surveyor) |
| Thermique | THEMIS, jour, infrarouge, 100 m/pixel (couverture entre 65° S et 65° N) |

_À compléter avec les données des ressources officielles du défi._

## Limites connues

- Le globe affiche des **images** : le relief est coloré, mais le terrain en 3D reste lisse.
- La résolution des couches ne permet pas encore une navigation à l'échelle d'un astronaute à pied.
- La **vitesse de marche** de l'outil de trajet (1,5 km/h) est une **hypothèse modifiable**, pas une valeur NASA.
- Le trajet est tracé par l'utilisateur : il n'y a pas encore de calcul automatique évitant pentes, obstacles ou zones de radiation.

## Prochaines étapes

- [ ] Choisir le lieu et l'objectif scientifique de la mission
- [ ] Brancher les données des ressources officielles
- [ ] Ajouter des photos de rovers (points de vue) aux étapes
- [ ] Ajouter des informations de sécurité (radiation, météo spatiale)
- [ ] Évaluer un calcul de trajet évitant les zones dangereuses
- [ ] Enregistrer la vidéo de démonstration
- [ ] Soumettre le projet avant la date limite (bouton « Submit for Judging »)

## Équipe

- _Nom 1 : rôle_
- _Nom 2 : rôle_

## Crédits

Données : NASA/JPL Mars Trek. Affichage 3D : [CesiumJS](https://cesium.com/platform/cesiumjs/).
