# Resum HomeView MVP

## Objectiu d'aquest issue

Implementar la pantalla d'inici (`HomeView`) completa amb la secció hero, el navbar dinàmic, les cards de cims destacats amb scroll i el mapa Leaflet amb marcadors personalitzats.

---

## Què s'ha fet

### 1. Secció hero amb slideshow (`HomeView.vue`)

S'ha implementat la part superior de la pantalla d'inici.

Fitxer: `frontend/src/views/HomeView.vue`

Què conté:

- Un **slideshow d'imatges** de muntanya que canvia automàticament cada 3,5 segons. Les imatges estan carregades des d'Unsplash com a placeholder.
- Un **overlay** sobre la foto amb degradat fosc a la part baixa que conté el subtítol "Explora cims, descobreix rutes i guarda les millors sortides."
- **Punts de navegació** (dots) fora de la foto, a sota, per saber en quina imatge ets i poder canviar manualment.
- El títol **CimsCat** a sota de la foto, en Inter Bold 64px amb letter-spacing -2% (tipografia del disseny).

Com funciona el slideshow tècnicament:

- `currentSlide` és una variable reactiva (`ref`) que guarda l'índex de la imatge activa.
- `onMounted` arrenca un `setInterval` que incrementa `currentSlide` cada 3,5 segons.
- `onBeforeUnmount` neteja l'interval per evitar memory leaks quan l'usuari navega fora.

---

### 2. Navbar dinàmic al home (`AppLayout.vue` + `HomeView.vue`)

El disseny demana que al home el navbar aparegui **després de la foto**, no a la part superior com a la resta de pàgines.

Fitxers modificats:

- `frontend/src/layouts/AppLayout.vue`
- `frontend/src/views/HomeView.vue`

Com s'ha fet:

- `AppLayout.vue` ara detecta la ruta actual amb `useRoute()` de Vue Router i amaga el `<NavBar>` quan la ruta és `Home` (`v-if="!isHome"`).
- `HomeView.vue` importa i renderitza el seu propi `<NavBar>` just després de la secció hero.
- A totes les altres pàgines (login, registre, perfil, cerca...) el navbar segueix apareixent a la part superior com sempre, perquè `AppLayout` el torna a mostrar.

El navbar ja era dinàmic pel que fa a l'autenticació (fet en l'issue anterior):

- Si l'usuari **no està autenticat**: mostra "Iniciar sessió" i "Registrar-se".
- Si l'usuari **està autenticat**: mostra el `nomUsuari` com a enllaç al seu perfil.
- El botó "Planificar nova ruta" apunta a `/registre` si no està loguejat i a `/planificar` si sí ho està.

---

### 3. Cards "Cims destacats" amb scroll (`HomeView.vue` + `PeakCard.vue`)

S'ha implementat la llista de cims a la part inferior de la pantalla.

Fitxer de dades: `frontend/src/mocks/homeFeaturedPublications.js`

Conté 7 cims amb els camps: `id`, `peakId`, `publicationId`, `peakName`, `elevation`, `region`, `authorName`, `likes`, `excerpt`, `imageUrl`, `lat`, `lng`.

Cims inclosos (en ordre de likes): Montserrat (52), Puigmal (41), Canigó (37), Pedraforca (34), Pica d'Estats (28), La Mola (19), Port Aigüe (15).

Com s'ordena i mostra:

- `featuredPublications` és un `computed` que fa una còpia del mock, l'ordena per `likes` de major a menor i retorna tots els elements.
- La llista té `max-height: 520px` i `overflow-y: auto`, de manera que mostra els primers cims i permet fer scroll per veure la resta.
- La scrollbar és visible i estilitzada (grisa, arrodonida) amb `::-webkit-scrollbar`.

Per què no es limita a 3 cims: veure comentari GitHub adjunt.

Per què s'usen mocks: l'API de cims no està disponible encara. L'estructura del mock és idèntica a la que retornarà l'API, per tant la substitució per una crida Axios serà directa.

---

### 4. Mapa Leaflet amb marcadors personalitzats (`HomeView.vue`)

S'ha integrat un mapa interactiu de Catalunya a la dreta de les cards.

Llibreria: `Leaflet` (ja instal·lada en l'issue anterior)

Com funciona:

- `onMounted` inicialitza el mapa centrat a Catalunya (`[41.95, 1.9]`, zoom 8) sobre el node del DOM referenciat amb `ref="mapContainer"`.
- S'usa el tileset d'OpenStreetMap com a capa base.
- Per cada cim del mock que tingui `lat` i `lng`, s'afegeix un marcador al mapa. En clicar el marcador, apareix un popup amb el nom del cim i la comarca.

Marcador personalitzat:

- El marcador per defecte de Leaflet no carrega correctament amb Vite per un problema de resolució de rutes d'imatges.
- S'ha substituït per un `L.divIcon` (marcador fet amb HTML/CSS pur) amb forma de pin (rombe verd fosc amb vora blanca), sense dependències d'imatges externes.

---

### 5. Tipografia Inter importada (`index.html`)

Fitxer: `frontend/index.html`

S'ha afegit la font **Inter** de Google Fonts perquè el títol CimsCat coincideixi exactament amb l'especificació del disseny (Inter Bold, 64px, letter-spacing -2%).

S'han importat els pesos 400, 600 i 700 per tenir flexibilitat en altres components.

De pas s'ha canviat el `<title>` de la pàgina de "frontend" a "CimsCat".

---

## Fitxers modificats en aquest issue

| Fitxer | Què s'ha fet |
|---|---|
| `src/views/HomeView.vue` | Hero slideshow, overlay, dots, títol, navbar posicionat, cards amb scroll, mapa Leaflet, marcadors personalitzats |
| `src/layouts/AppLayout.vue` | Navbar condicional: s'amaga al home perquè HomeView el renderitza ell mateix |
| `src/mocks/homeFeaturedPublications.js` | 7 cims amb coordenades, likes i imatges per alimentar cards i mapa |
| `index.html` | Importació Inter Google Fonts, títol canviat a CimsCat |

---

## Tecnologies usades en aquest issue

### Vue 3 Composition API

S'usa `ref`, `computed`, `onMounted` i `onBeforeUnmount` per gestionar el slideshow, el mapa i les dades reactives. Tot dins de `<script setup>`, que és la forma moderna i concisa d'escriure components Vue 3.

### Vue Router (`useRoute`)

Permet saber en quina ruta es troba l'usuari en cada moment. S'usa a `AppLayout` per decidir si mostrar o amagar el navbar global.

### Pinia (`useUserStore`)

La store d'usuari creada en l'issue anterior s'usa al navbar per mostrar el nom d'usuari si està autenticat o els botons de login/registre si no ho està.

### Leaflet

Llibreria de mapes de codi obert. S'inicialitza programàticament, s'afegeix una capa de teseles d'OpenStreetMap i marcadors dinàmics a partir de les coordenades dels cims.

### CSS personalitzat (scoped)

Tots els estils de `HomeView` estan encapsulats amb `<style scoped>` per evitar conflictes amb altres components. S'usen variables CSS globals del projecte (`--color-text`, `--color-surface`, etc.) per mantenir coherència de disseny.