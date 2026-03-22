# Resum del frontend MVP

## Objectiu d'aquest primer issue

Crear l'estructura base del frontend amb:

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Leaflet
- Chart.js

També s'ha deixat preparada una estructura base de layout i una primera paleta de colors inspirada en els wireframes.

## Què s'ha fet

### 1. Projecte base creat

S'ha creat un projecte `frontend` amb Vite i Vue 3.

Fitxers principals:

- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/src/main.js`
- `frontend/src/App.vue`

### 2. Router configurat

S'ha configurat Vue Router per les rutes base del MVP.

Fitxer:

- `frontend/src/router/index.js`

Rutes actuals:

- `/`
- `/login`
- `/registre`
- `/cim/:id`
- `/publicacio/:id`
- `/crear-publicacio`
- `/planificar`
- `/perfil/:id`
- `/cerca`

Nota:

- La ruta `/planificar` s'ha plantejat per a la pantalla de planificació de ruta.
- El botó "Planificar nova ruta" de la `NavBar` s'ha preparat perquè pugui anar a `/registre` si l'usuari no està autenticat i a `/planificar` si sí que ho està.

### 3. Pinia instal·lat i store d'usuari creada

S'ha instal·lat Pinia i s'ha registrat a l'aplicació.

Fitxers:

- `frontend/src/main.js`
- `frontend/src/stores/user.js`

Què fa Pinia:

- És el sistema d'estat global de Vue.
- Serveix per compartir dades entre components sense haver-les d'anar passant manualment.
- En aquest projecte s'utilitza per guardar l'usuari autenticat i el token.

Què fa la store `user`:

- guarda `user`
- guarda `token`
- exposa `isAuthenticated`
- té una funció `setUser(...)`
- té una funció `logout()`

### 4. Axios instal·lat i instància creada

S'ha instal·lat Axios i s'ha preparat una instància base.

Fitxer:

- `frontend/src/api/axios.js`

Què és Axios:

- És una llibreria per fer peticions HTTP al backend.
- Serveix per fer `GET`, `POST`, `PUT`, `DELETE`, etc.

Per què el fem servir amb una instància pròpia:

- per tenir una `baseURL` comuna
- per reutilitzar configuració
- per afegir automàticament el token a les peticions si l'usuari està autenticat

### 5. Components base de layout creats

S'han creat els components estructurals mínims:

- `frontend/src/layouts/AppLayout.vue`
- `frontend/src/components/NavBar.vue`
- `frontend/src/components/Footer.vue`

Què fan:

- `AppLayout.vue`: estructura general amb `NavBar`, `RouterView` i `Footer`
- `NavBar.vue`: barra superior amb marca, cerca i botons
- `Footer.vue`: peu de pàgina base

### 6. Views placeholder creades

S'han creat pantalles base per no deixar el router trencat mentre es construeix el projecte.

Fitxers:

- `frontend/src/views/HomeView.vue`
- `frontend/src/views/LoginView.vue`
- `frontend/src/views/RegisterView.vue`
- `frontend/src/views/PeakDetailView.vue`
- `frontend/src/views/PublicationView.vue`
- `frontend/src/views/CreatePublicationView.vue`
- `frontend/src/views/ProfileView.vue`
- `frontend/src/views/SearchView.vue`
- `frontend/src/views/PlanRouteView.vue`

### 7. Variables CSS definides

S'ha començat una paleta basada en els wireframes.

Fitxer:

- `frontend/src/assets/main.css`

Variables actuals:

- `--color-background`
- `--color-surface`
- `--color-navbar`
- `--color-footer`
- `--color-text`
- `--color-text-soft`
- `--color-border`
- `--color-button-primary`
- `--color-button-primary-text`
- `--color-button-secondary`
- `--color-button-secondary-text`
- `--color-input-background`
- `--color-accent-green`
- `--color-accent-green-soft`

## Què s'ha ajustat durant la feina

### Logo

S'ha detectat que `frontend/public/logo.svg` no era un SVG vàlid, sinó un fitxer guardat en format RTF.

Conseqüència:

- el navegador no podia renderitzar el logo
- com que l'etiqueta `<img>` tenia un `onerror`, el logo quedava amagat

Acció pendent:

- reexportar el logo com a SVG real

### NavBar

S'ha ajustat perquè:

- utilitzi variables CSS en lloc de colors escrits a mà
- tingui el botó "Planificar nova ruta" preparat per funcionar segons autenticació

### Router i planificació de ruta

S'ha detectat que el botó "Planificar nova ruta" no podia apuntar a una ruta inexistent.

Decisió funcional actual:

- si l'usuari no està loguejat, el botó ha d'anar a registre
- si l'usuari està loguejat, el botó ha d'anar a planificació de ruta

## Què falta revisar o acabar

### Per tancar bé aquest primer issue

- revisar que les fonts també estiguin definides com a variables, si es vol complir el criteri literal de "colors i fonts"
- validar que totes les rutes carreguen sense error
- deixar clar si `/planificar` serà una vista pròpia o una evolució d'una altra pantalla

### Més endavant

- substituir placeholders per pantalles reals
- connectar formularis amb backend
- començar lògica de login i registre
- connectar mapes amb Leaflet
- afegir gràfiques amb Chart.js

## Fitxers clau per entendre el projecte

- `frontend/src/main.js`
- `frontend/src/router/index.js`
- `frontend/src/stores/user.js`
- `frontend/src/api/axios.js`
- `frontend/src/layouts/AppLayout.vue`
- `frontend/src/components/NavBar.vue`
- `frontend/src/components/Footer.vue`
- `frontend/src/assets/main.css`

## Estat local abans de pujar a GitHub

Hi ha canvis locals encara no pujats.

En aquest moment, el `frontend` surt principalment com a fitxers nous sense trackejar al `git status`, així que abans de fer commit caldrà:

- revisar `git status`
- afegir els fitxers correctes amb `git add`
- comprovar que no hi hagi fitxers temporals o incorrectes

## Resum curt de tecnologies

### Vue Router

Gestiona la navegació entre pantalles del frontend.

### Pinia

Gestiona l'estat global de l'aplicació, com la sessió de l'usuari.

### Axios

Gestiona les peticions HTTP al backend.

### Leaflet

Servirà per mostrar mapes i rutes.

### Chart.js

Servirà per mostrar gràfiques, com desnivell, estadístiques o dades visuals.
