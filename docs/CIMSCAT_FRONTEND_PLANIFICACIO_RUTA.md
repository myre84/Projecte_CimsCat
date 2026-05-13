# CIMSCAT FRONTEND PLANIFICACIO RUTA

## Objectiu

Implementar la vista de planificacio de rutes al frontend amb una experiencia inspirada en Komoot, adaptada a l'estil i arquitectura de CimsCat.

Objectius coberts:

- vista `PlanRouteView.vue` funcional
- mapa interactiu amb waypoints
- panell lateral de configuracio de ruta
- resum tecnic de distancia/desnivell/temps
- perfil d'elevacio visual amb Chart.js

## Context funcional

Segons el concepte del projecte, el planificador havia de tenir:

- mapa com a element central
- panell lateral "La teva ruta"
- flux de construccio de ruta pas a pas
- bloc inferior amb lectura tecnica i elevacio

La implementacio actual prioritza aquesta UX, pero mantenint clara la frontera entre:

- funcionalitat real de frontend que ja podem usar
- funcionalitat dependent d'un motor de rutes de backend

## Fitxers creats o modificats

### Creats

- `frontend/src/components/RouteElevationChart.vue`

### Modificats

- `frontend/src/views/PlanRouteView.vue`

## Què funciona ara mateix (real al frontend)

## Mapa i waypoints

- mapa Leaflet centrat a Catalunya per defecte
- clic al mapa per afegir waypoints en ordre
- markers amb etiquetes A, B, C, D...
- polyline connectant els punts en l'ordre actual
- llista lateral amb waypoints editables (nom del punt)
- accions per pujar/baixar ordre i eliminar waypoint
- boto per netejar tots els waypoints

## Configuracio de ruta

El panell lateral permet triar:

- tipus d'activitat (senderisme, trail, alpinisme, BTT)
- ritme (relaxat, moderat, rapid)
- tipus de recorregut (anada, anada i tornada, circular)

## Resum tecnic

Es mostra en viu:

- distancia estimada
- desnivell positiu estimat
- desnivell negatiu estimat
- dificultat orientativa
- temps estimat segons ritme i activitat

## Perfil d'elevacio

- grafica de linia amb Chart.js
- lectura visual de l'elevacio estimada tram a tram
- recalcul automatic quan canvien waypoints

## Avisos UX incorporats

- missatge clar de "Traçat provisional"
- avís en mode circular:
  - no es tanca automaticament la ruta
  - l'usuari ha d'afegir manualment punts de retorn fins al punt inicial
- missatge quan la circular queda tancada manualment

## Què queda pendent de backend (o servei de rutes)

La part actual encara no calcula rutes fiables per camins reals, perquè falta:

- motor de routing (OSRM/GraphHopper/Mapbox Directions o equivalent)
- snap a camins/tracks reals
- elevacio real per coordenada
- persistencia real de rutes i waypoints al backend

Per això la polyline actual:

- uneix punts en linia directa
- no segueix sender/gr oficial

## Decisio sobre "Guardar ruta"

El boto "Guardar ruta" es mostra deshabilitat amb text de pendent, per deixar preparada la UX sense enganyar sobre l'estat real de la connexio.

## Responsive

S'ha treballat la vista per mantenir una composicio usable en:

- desktop: mapa protagonista + sidebar clara
- mobil/tablet: reordenacio de blocs i espais per facilitar lectura i toc

## Resum final

La vista de planificacio de rutes ha passat de placeholder a un flux usable de planificacio al frontend:

- afegir punts al mapa
- ajustar parametres de ruta
- veure metriques estimades
- visualitzar perfil d'elevacio

Amb això tenim una base solida de UX i interaccio per connectar posteriorment el motor real de rutes del backend sense haver de redissenyar la pantalla.
