# CimsCat Frontend: Fitxa del Cim

## Objectiu d'aquest resum

Documentar els canvis fets al frontend per implementar la fitxa del cim i connectar la Home amb el cataleg real de cims del backend.

Aquest bloc inclou:

- implementacio de `PeakDetailView.vue`
- connexio real a `GET /peaks` i `GET /peaks/:id`
- sidebar amb publicacions relacionades al cim
- ajust de la fitxa del cim per acostar-la al wireframe final
- resolucio correcta de les imatges servides pel backend des de `/uploads/...`
- fallback temporal amb mock quan el backend del detall encara no esta disponible

---

## Context actual del projecte

El backend ja exposa aquests endpoints publics de cims:

- `GET /peaks`
- `GET /peaks/:id`

Des del frontend s'ha treballat nomes amb aquest contracte existent, sense tocar cap fitxer de backend.

El backend retorna:

- un cataleg resumit de cims a `GET /peaks`
- una fitxa rica del cim a `GET /peaks/:id`

Important:

- la Home abans treballava amb un mock local
- aquests mocks feien servir `peakId` numerics (`101`, `102`, `103`, ...)
- el backend real treballa amb ids de tipus:
  - `cim_la_mola`
  - `cim_pedraforca`
  - `cim_puigmal`

Per tant, per fer que la navegacio entre Home i fitxa del cim fos coherent amb la base de dades real, s'ha substituit la Home mock per consum real de l'API.

---

## Fitxers modificats

- `frontend/src/views/HomeView.vue`
- `frontend/src/views/PeakDetailView.vue`
- `frontend/src/mocks/peakDetails.js`
- `frontend/src/utils/media.js`

---

## 1. Home connectada a `GET /peaks`

Fitxer:

- `frontend/src/views/HomeView.vue`

Abans:

- la Home mostrava cims destacats a partir de `homeFeaturedPublications`
- les cards feien servir ids mock
- en clicar una card, la fitxa del cim anava a un id que no existia al backend real

Ara:

- la Home fa peticio real a `GET /peaks`
- es guarden els cims recuperats a `peaks`
- aquestes dades es transformen al format que espera `PeakCard`

Transformacio principal:

- `id` del cim -> `peakId`
- `nom` -> `peakName`
- `alcada` -> `elevation`
- `comarca` -> `region`
- `stats.savedCount` -> `savedCount`
- `imatgeUrl` -> `imageUrl`

Resultat:

- les cards ja fan servir ids reals del backend
- en clicar una card, la fitxa del cim pot anar a `GET /peaks/:id` amb l'id correcte

---

## 2. Ordenacio dels cims destacats

Fitxer:

- `frontend/src/views/HomeView.vue`

Què s'ha fet:

- la Home ara ordena els cims per `stats.savedCount`
- l'ordre es descendent: primer els mes guardats, despres la resta

Objectiu:

- fer coherent la Home amb la logica de "cims guardats"
- mostrar primer els cims amb mes interaccio d'usuaris

---

## 3. Mapa de la Home amb dades reals

Fitxer:

- `frontend/src/views/HomeView.vue`

Què s'ha fet:

- el mapa Leaflet de la Home ja no treballa amb coordenades mock
- ara agafa latitud i longitud dels cims retornats per `GET /peaks`
- cada marcador mostra:
  - nom del cim
  - comarca

També s'ha ajustat el render del mapa:

- es recalcula la mida quan el mapa es crea
- es recalcula la mida quan arriben els cims de l'API
- es recalculen els bounds segons els marcadors reals

Objectiu:

- evitar que Leaflet quedi descentrat o amb mida incorrecta en carregar dades asincrones

---

## 4. Implementacio de la fitxa del cim

Fitxer:

- `frontend/src/views/PeakDetailView.vue`

Què s'ha implementat:

- carrega real de `GET /peaks/:id`
- estat de `loading`
- missatge d'error visible
- maquetacio de la fitxa seguint el wireframe final

Estructura actual de la pagina:

- columna esquerra:
  - titol del cim
  - alcada
  - comarca
  - `Localitzacio`
  - `Accessos principals`
  - `Caracteristiques tecniques`
  - `Refugis i punts d'interes`

- columna dreta:
  - imatge principal del cim
  - `Publicacions sobre el cim`

Important:

- inicialment s'havia muntat mapa i descripcio com a blocs grans
- despres s'ha refet la pagina per acostar-la molt mes al wireframe
- per aquest motiu, la fitxa final no mostra mapa incrustat dins de `PeakDetailView`

---

## 5. Sidebar de publicacions relacionades

Fitxer:

- `frontend/src/views/PeakDetailView.vue`

Què s'ha fet:

- es pinta la llista de `peak.publications`
- cada publicacio mostra:
  - miniatura
  - titol
  - autor
  - boto visual

La ruta queda preparada a:

- `/publicacio/:id`

Estat actual:

- la relacio entre cim i publicacions ja queda preparada
- la vista de publicacio encara pot estar incompleta, pero la navegacio ja queda pensada per a futures implementacions

---

## 6. Fallback temporal amb mock de detall

Fitxer:

- `frontend/src/mocks/peakDetails.js`

Per què s'ha fet:

- durant la implementacio, el backend del detall del cim va fallar en alguns entorns locals per problemes de base de dades
- per no bloquejar la maquetacio del frontend, s'ha afegit un fallback temporal

Com funciona:

1. `PeakDetailView` intenta primer `GET /peaks/:id`
2. si la peticio va be, es fa servir backend real
3. si falla i hi ha un mock equivalent, es carreguen dades temporals
4. es mostra un avís indicant que s'estan mostrant dades temporals

Objectiu:

- poder veure i ajustar la fitxa del cim encara que el backend local no estigui alineat

Important:

- aquest fallback es nomes temporal
- quan el backend del detall funciona correctament, la vista ja consumeix dades reals sense canvis addicionals

---

## 7. Resolucio de les imatges del backend

Fitxer:

- `frontend/src/utils/media.js`

Problema detectat:

- el backend retorna camps com:
  - `imatgeUrl: "/uploads/cims/la-mola.jpg"`
  - `fotoPerfil: "/uploads/usuaris/dalia.jpg"`
- aquestes rutes son correctes a nivell de backend, pero son relatives

Per què no funcionaven directament:

- el frontend corre a `http://localhost:5173`
- el backend corre a `http://localhost:3000`
- si el navegador veu un `<img src="/uploads/cims/la-mola.jpg">`, intenta carregar-ho des de:
  - `http://localhost:5173/uploads/cims/la-mola.jpg`
- pero qui serveix realment `/uploads` es el backend:
  - `http://localhost:3000/uploads/cims/la-mola.jpg`

Solucio aplicada:

- s'ha creat el helper `resolveMediaUrl(path)`
- aquest helper:
  - deixa igual les URLs completes (`http://...`, `https://...`)
  - converteix `/uploads/...` en `http://localhost:3000/uploads/...`

On s'aplica:

- `frontend/src/views/HomeView.vue`
- `frontend/src/views/PeakDetailView.vue`

Objectiu:

- evitar hardcodejar `http://localhost:3000` a cada component
- centralitzar la logica d'imatges del backend en un sol lloc

Nota important:

- si les imatges continuen sense veure's, el problema ja no es del frontend
- vol dir que la ruta existeix a la BD, pero el fitxer fisic encara no existeix dins de `backend/uploads/...`

---

## 8. Limitacions actuals

- `PeakDetailView` no mostra mapa incrustat, per decisio de fidelitat al wireframe final
- la vista de publicacio encara pot no estar completada
- la fitxa del cim encara manté fallback mock temporal si l'API del detall falla
- les imatges del backend nomes es veuran si els fitxers reals existeixen dins de `backend/uploads`

---

## Resum funcional curt

En aquest bloc de feina s'ha fet el seguent:

- la Home ha deixat de consumir mock local i ja fa `GET /peaks`
- els cims destacats s'ordenen pels mes guardats (`stats.savedCount`)
- el mapa de la Home treballa amb coordenades reals del backend
- s'ha implementat la fitxa del cim a `PeakDetailView.vue`
- s'ha afegit la sidebar de publicacions relacionades
- s'ha deixat preparada la navegacio cap a futures fitxes de publicacio
- s'ha creat un helper per resoldre correctament les imatges `/uploads/...` del backend

Amb aixo el frontend queda molt mes alineat amb el backend real i la fitxa del cim deixa de dependre de ids mock locals.
