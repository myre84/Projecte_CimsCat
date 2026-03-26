# CimsCat Frontend: Perfils

## Objectiu d'aquest resum

Documentar la implementacio feta al frontend per cobrir la part de perfils del projecte, especialment:

- `ProfileView.vue`
- `ForeignProfileView.vue`
- carrusels horitzontals
- modal d'edicio de perfil

Aquest resum explica:

- quina interpretacio funcional s'ha seguit
- quines parts s'han connectat de veritat amb backend
- quines parts s'han deixat preparades per al futur
- quins fitxers s'han creat o modificat

---

## Context funcional del perfil

Per aquesta part del projecte s'ha seguit una combinacio de tres fonts:

1. el wireframe del perfil
2. el document de conceptes del projecte
3. la nomenclatura oficial definida a `docs`

La interpretacio final acordada ha estat aquesta:

- `Ultimes publicacions` = publicacions propies de l'usuari
- `Publicacions guardades` = visualment aquest nom al perfil, pero tecnicament alimentades per `likes`
- `Cims guardats` = cims oficials guardats per l'usuari
- `Rutes planificades` = encara no implementat, es deixa com a placeholder
- `Awards` = encara no implementat, es deixa com a placeholder visual

Per al perfil alie:

- nomes es mostra informacio publica
- no es mostren cims guardats
- no es mostren likes/guardats personals
- no hi ha boto d'edicio

---

## Nomenclatura aplicada

S'ha respectat la nomenclatura oficial del projecte:

- `likes` nomes per publicacions
- `saved` nomes per cims

Per tant:

- la seccio visible `Publicacions guardades` del perfil propi es connecta a `GET /users/:id/likes`
- la seccio `Cims guardats` es connecta a `GET /users/:id/saved`

Aquest punt era important per no barrejar:

- publicacions d'altres usuaris amb like
- cims oficials guardats

---

## Fitxers modificats o creats

- `frontend/src/views/ProfileView.vue`
- `frontend/src/views/ForeignProfileView.vue`
- `frontend/src/components/HorizontalCarousel.vue`
- `frontend/src/components/ProfilePublicationCard.vue`
- `frontend/src/components/ProfilePeakCard.vue`
- `frontend/src/components/EditProfileModal.vue`
- `frontend/src/router/index.js`

---

## 1. Implementacio de `ProfileView.vue`

Fitxer:

- `frontend/src/views/ProfileView.vue`

Objectiu:

- representar el perfil propi de l'usuari autenticat
- mostrar les seves dades personals i les seves seccions principals

Contingut actual de la vista:

- foto/avatar
- nom de l'usuari
- `Ultimes publicacions`
- `Publicacions guardades`
- `Cims guardats`
- `Rutes planificades` placeholder
- `Awards` placeholder
- boto `Editar perfil`
- modal d'edicio

Logica important:

- la ruta es considera de perfil propi
- si l'`id` de la URL no coincideix amb l'usuari autenticat, la vista redirigeix al perfil alie
- la carrega de dades es fa en paral·lel per aprofitar millor el temps:
  - `GET /users/:id`
  - `GET /users/:id/publications`
  - `GET /users/:id/likes`
  - `GET /users/:id/saved`

Resultat:

- el perfil propi queda connectat amb dades reals del backend
- no es barregen dominis
- el layout segueix el wireframe adaptat al projecte real

---

## 2. Implementacio de `ForeignProfileView.vue`

Fitxer:

- `frontend/src/views/ForeignProfileView.vue`

Objectiu:

- mostrar el perfil public d'un altre usuari

Contingut actual:

- avatar/foto
- nom
- `Ultimes publicacions`
- bloc placeholder d'`Awards`

Important:

- no es mostren cims guardats
- no es mostren likes personals
- no hi ha boto `Editar perfil`
- no hi ha modal

Connexio real:

- `GET /users/:id`
- `GET /users/:id/publications`

Resultat:

- es diferencia clarament el perfil propi del perfil alie
- es respecta la idea de privacitat del projecte

---

## 3. Carrusels horitzontals

Fitxer:

- `frontend/src/components/HorizontalCarousel.vue`

Per que s'ha creat:

- el projecte no tenia cap component reutilitzable per mostrar files horitzontals amb desplacament
- el wireframe del perfil demanava seccions amb navegacio lateral

Que fa:

- mostra un titol de seccio
- opcionalment una descripcio
- mostra els elements en una fila horitzontal
- te boto esquerra i boto dreta
- si no hi ha dades, mostra un missatge buit

Avantatge:

- el mateix component es pot reutilitzar per:
  - publicacions
  - likes/publicacions guardades
  - cims guardats
  - altres seccions futures

---

## 4. Targeta de publicacio del perfil

Fitxer:

- `frontend/src/components/ProfilePublicationCard.vue`

Objectiu:

- tenir una targeta simple per a:
  - ultimes publicacions
  - publicacions guardades

Contingut:

- imatge
- titol
- autor
- boto/enllac a la publicacio

Detall important:

- si la publicacio no te imatge propia, es prova d'agafar la imatge del cim associat
- si tampoc n'hi ha, es mostra una imatge fallback

---

## 5. Targeta de cim guardat

Fitxer:

- `frontend/src/components/ProfilePeakCard.vue`

Objectiu:

- representar els cims guardats del perfil propi sense confondre'ls amb publicacions

Contingut:

- imatge del cim
- nom
- alcada
- comarca
- enllac a la fitxa oficial del cim

Aixo reforca la diferenciacio entre:

- contingut creat per usuaris
- fitxes oficials de cims

---

## 6. Modal d'edicio de perfil

Fitxer:

- `frontend/src/components/EditProfileModal.vue`

Objectiu:

- permetre l'edicio del perfil propi des de la mateixa vista

Camps actuals:

- nom
- cognom
- nom d'usuari
- foto de perfil

Validacions aplicades:

- nom obligatori
- cognom obligatori
- validacio basica de `nomUsuari`

Connexio real:

- `PUT /users/:id`

Comportament:

- s'obre des de `ProfileView`
- si l'actualitzacio va be, es refresquen les dades locals del perfil
- tambe s'actualitza la store de l'usuari autenticat

---

## 7. Rutes de perfil

Fitxer:

- `frontend/src/router/index.js`

Canvi aplicat:

- `/perfil/:id` es reserva per al perfil propi
- `/usuari/:id` es fa servir per al perfil alie

Per que es fa aixi:

- evita barreges entre les dues vistes
- fa mes clara la navegacio
- permet redirigir correctament quan una URL de perfil propi en realitat apunta a un usuari diferent

---

## 8. Accessos des de publicacions

Fitxer relacionat:

- `frontend/src/views/PublicationView.vue`

Canvi relacionat amb perfils:

- el nom i la foto de l'autor ja enllacen al perfil corresponent
- si l'autor es l'usuari autenticat:
  - va a `/perfil/:id`
- si es un altre usuari:
  - va a `/usuari/:id`

Aixo evita haver d'escriure URLs manuals per veure un perfil alie.

---

## 9. Què està connectat de veritat

- `GET /users/:id`
- `GET /users/:id/publications`
- `GET /users/:id/likes`
- `GET /users/:id/saved`
- `PUT /users/:id`

Per tant, la part principal del perfil propi ja treballa amb dades reals:

- dades de perfil
- publicacions propies
- publicacions guardades visualment via likes
- cims guardats
- edicio del perfil

I el perfil alie tambe te connexio real en la part publica:

- dades basiques del perfil
- publicacions publiques

---

## 10. Què queda pendent o com a placeholder

Encara no s'ha implementat amb dades reals:

- `Rutes planificades`
- `Awards`
- estadistiques de km
- grafiques
- insígnies
- reptes
- seguir usuaris

Per decisio de tasca, aquestes parts s'han deixat:

- visibles com a estructura
- pero sense inventar backend ni dades falses innecessaries

---

## 11. Resultat funcional

Amb aquesta implementacio:

- el perfil propi ja te estructura real i util
- el perfil alie ja existeix com a vista separada
- la navegacio entre publicacions i perfils ja queda connectada
- la UI segueix la logica del wireframe adaptada al projecte real
- les parts futures no bloquegen la feina actual perquè queden preparades visualment

---

## 12. Limitacions conegudes

- `Awards` no te backend ni dades reals encara
- `Rutes planificades` no te integracio d'usuari encara
- la foto de perfil depen de la ruta real retornada pel backend i dels fitxers disponibles a `uploads`
- si algun endpoint d'usuari falla en local, el perfil no podra carregar aquella seccio concreta

---

## Resum curt final

La part de perfils del frontend queda implementada amb:

- perfil propi real
- perfil alie real
- carrusels horitzontals
- edicio de perfil
- separacio correcta entre publicacions, likes i cims guardats

I es deixa preparat per ampliar mes endavant:

- awards
- estadistiques
- rutes planificades
