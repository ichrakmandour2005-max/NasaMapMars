# Mars EVA Field Console

Responsive web interface for planning a science traverse on Mars in the Gale Crater and Mount Sharp region, using NASA data and resources.

The interface is designed as a mission console: a briefing screen presents the mission objective and environmental conditions, then the astronaut opens a 3D Mars map to explore data layers, points of interest and the route.

## Team
novaMIY :
Mandour Ichrak,
Ichi Mina
## Presentation

- [novaMIY presentation (PowerPoint)](.codex-ppt-output/novaMIY_mars_eva_console_updated.pptx)
- [novaMIY presentation (PDF)](.codex-ppt-output/novaMIY_mars_eva_console_updated.pdf)

## Features

### Mission briefing

- Mission: **Curiosity mission in Gale Crater**
- Objective: follow the geological targets from clay-bearing terrain toward sulfate-bearing units
- Scientific context for Mount Sharp and evidence of past water activity
- Interactive EVA checklist; checked items are saved in the browser
- Environmental indicators for radiation, historical weather, relief and geology
- Dark, readable and responsive interface for desktop, tablet and phone

### 3D Mars map

- Mars 3D globe centered on Gale Crater / Mount Sharp when the map opens
- Four switchable and opacity-adjustable Mars Trek layers:
  - Color imagery (Viking)
  - Gale high-res imagery (CTX)
  - Colored relief (MOLA)
  - Thermal infrared (THEMIS)
- Points of interest: Gale Crater / Mount Sharp, Jezero Crater, Olympus Mons and Valles Marineris
- Information tooltip when hovering over a point of interest
- Side panel that can be collapsed on desktop, tablet and phone
- Zoom controls, regional view, global view and camera altitude display

### Curiosity mission stops

The five mission stops are:

1. Clay-Bearing Unit
2. Greenheugh Pediment
3. Gediz Vallis Ridge
4. Gediz Vallis Channel
5. Mg-Sulfate Bearing Unit

Each stop includes a description, a Curiosity ground image, a NASA source and a visual caution level. The coordinates in `config.js` are **representative map waypoints** selected from the NASA annotated route map and Mars Trek layers. They are not official GPS coordinates for the complete geological units.

The **Load these stops as a route** button loads the five waypoints into the route tool.

 
## Displayed data

### Radiation

The briefing displays the MSL/RAD surface dose-rate range published in a NASA radiation briefing: **0.21–0.25 mGy/day**.

This is a historical mission range, not a live measurement and not an automatically calculated radiation-danger map for the route.

### Weather

The briefing displays a historical REMS profile: **−48 to −77 °C** for the REMS Sol 1063 temperature profile, with surface pressure around **800 Pa** in the NASA references used by the project.

These values are not a current forecast. REMS measures air and ground temperature, pressure, humidity, wind and ultraviolet radiation at the rover.

### Relief and geology

The map uses these layers:

- **Viking**: global color imagery
- **CTX**: high-resolution Gale Crater imagery
- **MOLA**: colored relief from laser altimetry
- **THEMIS**: thermal infrared imagery

The mission follows the geological transition described in NASA resources: clay-bearing terrain, Greenheugh Pediment, Gediz Vallis and sulfate-bearing units.

## Technologies

- HTML5
- CSS3 responsive media queries
- Vanilla JavaScript
- CesiumJS for the 3D globe and map entities
- NASA/JPL Mars Trek WMTS tiles for Mars imagery
  
- `localStorage` for checklist persistence
- Google Fonts / Fontshare typography:
  - Clash Display for headings
  - Schibsted Grotesk for subheadings
  - Outfit for body text

The project does not use React, Vite or a bundler. It is a static HTML/CSS/JavaScript application.

## Main project structure

| File | Purpose |
|---|---|
| `index.html` | Briefing screen, map screen and script loading |
| `style.css` | Base map and sidebar styles |
| `briefing.css` | Home-screen layout |
| `briefing-final.css` | Dark spatial design without rounded cards |
| `briefing-type-system.css` | Home-screen font system |
| `briefing-copy.js` | Mission text displayed on the briefing screen |
| `environment.js` | NASA environmental values and references |
| `environment-ui.js` | Checklist and environment-card rendering |
| `environment-cards.js` | Relief and geology card data |
| `status-cleanup.js` | Removes source links from the small briefing cards |
| `app.js` | Cesium initialization, globe, layers and points of interest |
| `config.js` | Mission, stops, descriptions, photos, waypoints and sources |
| `mission.js` | Mission panel, stop details and route loading |
| `route.js` | Manual route, distance, duration and GeoJSON export |
| `safety.js` | Safety analysis based on configured hazard data |
| `map-interactions.js` | Regional view, point hover and collapsible sidebar |
| `map-region.js` | Initial focus on Gale Crater / Mount Sharp |
| `map-sidebar.css` | Collapsible side panel |
| `map-layout.css` | Space reserved between map and sidebar |
| `map-responsive.css` | Responsive map behavior |

Files ending in `1` are old working copies and are not required for the main launch.

## Run locally

### Recommended: VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

An internet connection is required for CesiumJS, Mars Trek tiles and remote fonts.

### Quick verification

- The briefing screen loads without errors.
- **Enter field map** opens only the map screen.
- Mars starts focused on Gale Crater / Mount Sharp.
- The sidebar toggle collapses and expands the side panel.
- The globe uses the space released by the collapsed sidebar.
- Hovering over a point of interest shows its information tooltip.
- **Load these stops as a route** places the five mission points.

## Responsive testing

Use Chrome DevTools with `Ctrl + Shift + M` and test:

- Phone: 375 × 667
- Large phone: 390 × 844
- Tablet: 768 × 1024
- Desktop: 1280 × 800

The sidebar stays on the side at every size and can be collapsed to give the globe more space.

## NASA data sources

- [JPL Mars Trek](https://trek.nasa.gov/mars/) — 3D Mars exploration and imagery layers
- [Mars Trek API / tiles](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars) — tile service used by CesiumJS
- [Curiosity’s Proposed Path up Mount Sharp](https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/) — annotated scientific route map
- [USGS-NASA Planetary Geologic Mapping Program](https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars) — geological mapping reference
- [NASA Worldview](https://worldview.earthdata.nasa.gov/) — NASA Earthdata visual resource supplied for the challenge; not used as local Gale Crater weather
- [Mars Perseverance Raw Images Gallery](https://mars.nasa.gov/mars2020/multimedia/raw-images/) — NASA rover image resource supplied for the challenge
- [NASA Curiosity Science Instruments](https://science.nasa.gov/mission/msl-curiosity/science-instruments/) — REMS and RAD instrument information
- [NASA Radiation Environment briefing](https://www.nasa.gov/wp-content/uploads/2016/05/mars_radiation_environment_nac_july_2017_finaltagged.pdf) — MSL/RAD surface dose-rate range
- [NASA REMS Sol 1063 environmental profile](https://ntrs.nasa.gov/api/citations/20210010977/downloads/TM-20210010977.pdf) — historical REMS temperature profile
- [NASA PDS REMS MODRDR archive](https://pds.nasa.gov/ds-view/pds/viewProfile.jsp?dsid=MSL-M-REMS-5-MODRDR-V1.0) — sol-by-sol weather archive
- [NASA PDS RAD RDR archive](https://pds.nasa.gov/ds-view/pds/viewDataset.jsp?dsid=MSL-M-RAD-3-RDR-V1.0) — calibrated RAD data
- [Curiosity: Clay-Bearing Unit](https://science.nasa.gov/photojournal/curiosity-surveys-the-clay-bearing-unit/)
- [Curiosity: Greenheugh Pediment](https://science.nasa.gov/photojournal/curiositys-view-from-the-top-of-the-greenheugh-pediment/)
- [Curiosity: Gediz Vallis Ridge](https://science.nasa.gov/photojournal/curiosity-views-gediz-vallis-ridge/)
- [Curiosity: Gediz Vallis Channel](https://science.nasa.gov/photojournal/curiositys-view-within-gediz-vallis-channel/)
- [Curiosity: Sulfate-bearing Unit](https://science.nasa.gov/photojournal/curiosity-looks-downslope-from-the-sulfate-unit/)

NASA does not endorse non-U.S. Government entities and is not responsible for information on non-U.S. Government websites. Any external website must be used according to its own data-use terms.

## Known limitations

- Weather and radiation values are historical, not real-time.
- Environmental values are not recalculated automatically for every route point.
- The five stop positions are representative map waypoints, not an official NASA coordinate table for each geological unit.
- The route tool does not yet automatically avoid steep slopes, rocks or radiation zones.
- Relief is presented through imagery and MOLA shading; Cesium terrain remains visually smooth.
- The default walking speed of 1.5 km/h is an adjustable assumption, not an operational NASA value.
- Remote tiles and fonts require an internet connection.

## Project status

- [x] Mission briefing
- [x] Interactive checklist
- [x] 3D Mars globe
- [x] Four Mars Trek layers
- [x] Curiosity images and descriptions
- [x] Historical radiation and weather indicators
- [x] Responsive collapsible sidebar
- [x] Hover information for points of interest
- [x] Route tool and GeoJSON export
- [ ] Automatic hazard-avoiding route calculation
- [ ] Final testing on multiple computers
- [ ] Demo video
- [ ] Presentation slides
- [ ] Space Apps submission
