# CimsCat Frontend: Login i Registre

## Objectiu d'aquest resum

Documentar la implementacio feta al frontend per tenir autenticacio funcional amb el backend actual del projecte.

Aquest bloc inclou:

- login real contra backend
- registre real contra backend
- persistencia de sessio amb `localStorage`
- integracio amb Pinia
- guards de ruta
- interceptor Axios amb token Bearer
- ajust visual de `LoginView` i `RegisterView` per apropar-los al wireframe

---

## Context actual del projecte

El backend ja exposa els endpoints d'autenticacio:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Des del frontend s'ha treballat nomes amb aquest contracte existent, sense tocar cap fitxer de backend.

Important:

- el backend requereix `nom`
- el backend requereix `cognom`
- el backend requereix `nomUsuari`
- el backend requereix `mail`
- el backend requereix `contrasenya`

Per tant, el formulari de registre del frontend s'ha adaptat a aquests camps reals.

---

## Fitxers modificats

- `frontend/src/api/axios.js`
- `frontend/src/stores/user.js`
- `frontend/src/main.js`
- `frontend/src/router/index.js`
- `frontend/src/views/LoginView.vue`
- `frontend/src/views/RegisterView.vue`
- `frontend/public/abres_login.png`

---

## 1. Integracio d'autenticacio amb Pinia

Fitxer:

- `frontend/src/stores/user.js`

Què s'ha fet:

- s'ha mantingut l'estat global amb:
  - `token`
  - `user`
- s'han mantingut els getters:
  - `isAuthenticated`
  - `isAdmin`
- s'han implementat les accions:
  - `login`
  - `register`
  - `logout`
  - `loadFromStorage`

Com funciona:

- `login(credentials)` envia credencials a `POST /auth/login`
- `register(payload)` envia el formulari a `POST /auth/register`
- quan el backend retorna `token` i `user`, s'executa `setUser(...)`
- `setUser(...)` actualitza la store i desa la sessio a `localStorage`
- `loadFromStorage()` recupera `token` i `user` quan l'app arrenca

Resultat:

- l'usuari manté la sessio encara que recarregui la pagina
- la resta de components poden saber si hi ha sessio iniciada

---

## 2. Persistencia de sessio

Fitxers:

- `frontend/src/stores/user.js`
- `frontend/src/main.js`

Què s'ha fet:

- s'ha deixat `token` a `localStorage`
- s'ha deixat `user` a `localStorage`
- a `main.js` es carrega la store de Pinia i es crida `loadFromStorage()`

Objectiu:

- si l'usuari recarrega la web, no perd la sessio
- el navbar i els guards poden continuar funcionant sense tornar a loguejar-se

---

## 3. Interceptor Axios

Fitxer:

- `frontend/src/api/axios.js`

Què s'ha fet:

- s'ha mantingut una instancia centralitzada d'Axios
- s'ha ajustat la `baseURL` a `http://localhost:3000`
- s'ha mantingut l'interceptor de request
- ara el token es llegeix directament de `localStorage`

Capçalera afegida automaticament:

- `Authorization: Bearer <token>`

Nomes s'afegeix si hi ha token.

Per què s'ha fet aixi:

- evita dependencies circulars entre `api/axios.js` i la store
- manté el comportament simple i coherent amb el projecte

---

## 4. Guards de ruta

Fitxer:

- `frontend/src/router/index.js`

Què s'ha fet:

- s'han mantingut els guards existents d'admin
- s'han afegit regles per autenticacio i guest

Meta utilitzada:

- `guestOnly`
- `requiresAuth`
- `requiresAdmin`

Comportament actual:

- `/login` i `/registre` son `guestOnly`
  - si l'usuari ja esta autenticat, es redirigeix a `/`
- `/crear-publicacio` es `requiresAuth`
  - si no hi ha sessio, es redirigeix a `/login`
- `/admin` es `requiresAuth` + `requiresAdmin`
  - si no compleix, es redirigeix a `/`

Com es comprova la sessio al router:

- llegint el token des de `localStorage`
- llegint `user` des de `localStorage`

---

## 5. LoginView funcional

Fitxer:

- `frontend/src/views/LoginView.vue`

Què s'ha implementat:

- formulari de login amb:
  - correu electronic
  - contrasenya
- validacio de frontend
- loading al boto
- errors visibles de validacio
- error de servidor visible

Flux de funcionament:

1. l'usuari omple el formulari
2. es valida email i password
3. es crida `userStore.login(form)`
4. si el backend respon correctament:
   - es desa token i user
   - es redirigeix a la Home
5. si hi ha error:
   - es mostra el missatge del backend

---

## 6. RegisterView funcional

Fitxer:

- `frontend/src/views/RegisterView.vue`

Què s'ha implementat:

- formulari de registre amb:
  - `nom`
  - `cognom`
  - `nomUsuari`
  - `email`
  - `password`
  - `confirmPassword`

Validacions afegides:

- nom obligatori
- cognom obligatori
- `nomUsuari` valid segons regex del backend
- email valid
- password amb:
  - minim 8 caracters
  - almenys 1 majuscula
  - almenys 1 numero
- `confirmPassword` coincident

Flux de funcionament:

1. l'usuari omple el formulari
2. es fan validacions locals
3. es crida `userStore.register(form)`
4. el backend crea l'usuari i retorna `token`
5. el frontend desa la sessio i redirigeix a `/`

Comportament actual:

- si el backend retorna token, es fa auto-login directe
- si hi hagués un backend sense token, la vista ja esta preparada per enviar a `/login`

---

## 7. Ajust visual de les vistes segons wireframe

Fitxers:

- `frontend/src/views/LoginView.vue`
- `frontend/src/views/RegisterView.vue`
- `frontend/public/abres_login.png`

Què s'ha ajustat:

### Login

- barra superior grisa amb logo
- titol gran centrat `Log in`
- formulari mes compacte i centrat
- inputs amb estil proper al wireframe
- boto verd clar
- imatge inferior de bosc amb `abres_login.png`

### Registre

- barra superior grisa amb logo
- titol gran centrat `Pagina de Registre`
- formulari distribuït en bloc esquerre + bloc dret
- bloc visual de foto de perfil com a placeholder
- boto `Crear Compte` amb estil de maqueta
- footer gris simple amb `CIMSCAT`

Important:

- la UI de foto de perfil es nomes visual
- no s'ha connectat pujada real d'imatge

---

## 8. Què s'ha provat funcionalment

Durant la validacio s'ha comprovat:

- el registre envia correctament al backend
- el backend crea l'usuari si la BD esta en marxa
- el login respon correctament
- la sessio es desa a `localStorage`
- la sessio es manté en recarregar
- la build del frontend compila correctament amb `npm run build`

Nota important:

- quan la base de dades no estava aixecada, el frontend mostrava l'error retornat pel backend
- un cop aixecat Docker/PostgreSQL, el registre ja va funcionar correctament

---

## Limitacions actuals

- no s'ha tocat backend
- no s'ha implementat cap logout real encara; nomes hi ha boto visual a la navbar
- la foto de perfil a registre no es puja encara
- no s'ha integrat `GET /auth/me` al flux actual, tot i que el backend ja el te

---

## Resum funcional curt

Amb aquesta tasca el frontend ja te:

- login funcional
- registre funcional
- sessio persistent
- token JWT guardat al navegador
- guards de ruta
- axios autenticat
- pantalles de login i registre mes properes al wireframe

En resum:

- l'usuari es pot registrar
- l'usuari es pot loguejar
- la sessio es manté
- el frontend ja queda preparat per continuar creixent sobre una base d'autenticacio real
