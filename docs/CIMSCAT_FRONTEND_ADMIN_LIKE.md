# CimsCat Frontend: Admin i Canvi de Like a Guardar Cim

## Objectiu d'aquest resum

Documentar els canvis fets al frontend per:

- afegir el panell d'administracio
- protegir l'acces per rol admin
- substituir la interaccio de "like" de les fitxes de cims destacats per "guardar cim"
- alinear la nomenclatura del frontend amb la nomenclatura oficial acordada amb backend

---

## Nomenclatura funcional adoptada

Seguint el document `CIMSCAT_BACKEND_NOMENCLATURA_INTERACCIONS.md`, a partir d'ara al frontend s'utilitza aquest criteri:

### 1. Likes

- `like` nomes fa referencia a una `Publicacio`
- equival funcionalment a "publicacio favorita"
- la terminologia recomanada al codi i a la UI es:
  - `likes`
  - `likesCount`
  - "Donar like a una publicacio"

### 2. Saved / cims guardats

- `saved` fa referencia a un `Cim`
- la terminologia recomanada al codi i a la UI es:
  - `saved`
  - `savedCount`
  - `savedPeaks`
  - `savedByUsers`
  - "Guardar-se un cim"
  - "Cims guardats"

Conseqüencia funcional:

- a la Home, la interaccio de la card del cim deixa de parlar de `like`
- la Home passa a parlar de `guardar cim`
- la paraula `like` es reserva per publicacions

---

## Què s'ha implementat

## 1. Panell d'administracio

S'ha creat una nova vista d'administracio:

- `frontend/src/views/AdminDashboard.vue`

Funcionalitat actual:

- capcalera de panell amb resum visual
- seccio de gestio de cims
- llistat simple de cims destacats
- seccio de moderacio amb:
  - publicacions
  - comentaris
  - usuaris

Estat actual:

- la UI esta implementada
- les accions de crear, editar i eliminar estan preparades visualment
- les accions queden deshabilitades fins que hi hagi endpoints reals disponibles

No s'ha inventat cap endpoint de backend.

---

## 2. Ruta protegida `/admin`

S'ha ampliat el router a:

- `frontend/src/router/index.js`

Canvis fets:

- nova ruta `/admin`
- meta `requiresAdmin`
- guard de navegacio

Com funciona:

- si `user.rol === 'admin'`, l'usuari pot entrar al panell
- si no, es redirigeix a la Home

---

## 3. Suport de rol admin a la store d'usuari

Fitxer modificat:

- `frontend/src/stores/user.js`

Canvis fets:

- es mante l'estat global de `user` i `token`
- s'afegeix el computed `isAdmin`
- es reforca la lectura del `user` des de `localStorage`

Això permet:

- saber des del frontend si l'usuari actual es admin
- condicionar rutes i elements visuals sense tocar backend

---

## 4. Acces visual a admin des de la navbar

Fitxer modificat:

- `frontend/src/components/NavBar.vue`

Canvi fet:

- s'afegeix un boto/enllac `Admin` visible nomes per usuaris admin

Objectiu:

- donar acces rapid al panell
- mantenir la mateixa logica visual que la resta del projecte

---

## 5. Canvi del cor a "guardar cim"

Fitxer modificat:

- `frontend/src/components/PeakCard.vue`

Abans:

- la interaccio es mostrava com un cor
- la logica i els comentaris parlaven de `like`
- l'estat era local i visual

Ara:

- s'utilitza una icona tipus bookmark
- la interaccio passa a ser "guardar cim"
- l'estat visual es gestiona amb:
  - `isSaved`
  - `savedCount`
  - `handleSave`

Comportament actual:

- si l'usuari no esta autenticat, es redirigeix a `/registre`
- si esta autenticat, es canvia l'estat local de guardat
- el recompte visual de guardats puja o baixa localment

També s'ha afegit:

- tooltip visual en hover/focus:
  - `Guardar cim`
  - `Treure de guardats`

Important:

- aquesta logica encara es local al frontend
- no s'ha connectat a endpoints reals de `saved peaks`

---

## 6. Home ordenada per cims guardats

Fitxers modificats:

- `frontend/src/views/HomeView.vue`
- `frontend/src/mocks/homeFeaturedPublications.js`

Canvis fets:

- els cims destacats ja no s'ordenen per `likes`
- ara s'ordenen per `savedCount`
- el mock temporal s'ha adaptat a la nova terminologia

Objectiu:

- fer coherent la Home amb la nomenclatura oficial
- mostrar clarament que aquesta interaccio es de cims guardats i no de likes de publicacions

---

## Fitxers de frontend afectats

- `frontend/src/views/AdminDashboard.vue`
- `frontend/src/router/index.js`
- `frontend/src/stores/user.js`
- `frontend/src/components/NavBar.vue`
- `frontend/src/components/PeakCard.vue`
- `frontend/src/views/HomeView.vue`
- `frontend/src/mocks/homeFeaturedPublications.js`

---

## Limitacions actuals

- el panell admin esta implementat a nivell d'UI, pero no connectat a CRUD real
- la moderacio no executa eliminacions reals
- el sistema de "guardar cim" continua sent local/visual
- no s'han creat endpoints nous ni s'ha tocat backend

---

## Resum funcional curt

En aquest bloc de feina s'ha fet el seguent:

- panell `/admin` creat
- accés a admin protegit per rol
- enllac visual a admin a la navbar
- substitucio del cor per la interaccio "guardar cim"
- canvi de nomenclatura a `savedCount` per cims
- reserva de la paraula `like` nomes per publicacions

Amb això el frontend queda alineat amb la nomenclatura oficial acordada amb backend:

- `like` per publicacions
- `saved` per cims
