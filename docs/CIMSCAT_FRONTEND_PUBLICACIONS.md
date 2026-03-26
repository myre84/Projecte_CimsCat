# CimsCat Frontend: Publicacions

## Objectiu d'aquest resum

Documentar la implementacio feta al frontend per cobrir la part de publicacions del projecte, especialment les vistes `PublicationView.vue` i `CreatePublicationView.vue`.

Aquest bloc inclou:

- implementacio de `PublicationView.vue`
- implementacio de `CreatePublicationView.vue`
- separacio entre `Planificar ruta` i `Crear publicacio`
- connexio real amb backend quan els endpoints estan disponibles
- fallback temporal amb mock quan backend o base de dades fallen
- galeria d'imatges, fitxa tecnica i enllac al cim relacionat
- preparacio visual de likes i comentaris segons el contracte actual del projecte

---

## Context actual del projecte

El backend ja exposa o intenta exposar aquesta part del domini de publicacions:

- `GET /publicacions`
- `GET /publicacions/:id`
- `POST /publicacions`
- `POST /uploads/publicacions`

Des del frontend s'ha treballat nomes amb aquest contracte existent, sense tocar cap fitxer de backend.

També s'ha tingut en compte la nomenclatura oficial del projecte:

- `likes` nomes per publicacions
- `saved` nomes per cims

Per tant:

- el boto de cor de `PublicationView` representa likes de publicacio
- no s'ha barrejat en cap moment amb `cims guardats`

Important:

- durant la implementacio, el backend local ha tingut errors puntuals a `GET /peaks` i `POST /publicacions`
- per no bloquejar el desenvolupament del frontend, s'han afegit fallbacks temporals amb mocks
- aquests fallbacks no substitueixen backend; nomes permeten continuar maquetant i validant UX mentre la part de dades es corregeix

---

## Fitxers modificats o creats

- `frontend/src/views/PublicationView.vue`
- `frontend/src/views/CreatePublicationView.vue`
- `frontend/src/views/PlanRouteView.vue`
- `frontend/src/router/index.js`
- `frontend/src/components/NavBar.vue`
- `frontend/src/utils/media.js`
- `frontend/src/utils/mockPublications.js`

---

## 1. Separacio entre crear publicacio i planificar ruta

Fitxers:

- `frontend/src/router/index.js`
- `frontend/src/components/NavBar.vue`
- `frontend/src/views/PlanRouteView.vue`

Problema detectat:

- inicialment `/planificar` era un alias de `CreatePublicationView`
- conceptualment aixó no era correcte, perquè al document funcional del projecte `Planificar ruta` i `Crear publicacio` son fluxos diferents

Canvi aplicat:

- `CreatePublicationView` queda associada a:
  - `/crear-publicacio`
- `Planificar nova ruta` queda separada a:
  - `/planificar`
- s'ha creat `PlanRouteView.vue` com a vista placeholder per indicar que el planificador encara no esta implementat

Resultat:

- l'usuari ja no entra a crear una publicacio quan en realitat vol planificar una ruta
- el `NavBar` mostra una accio clara de `Crear publicacio`
- el flux queda mes coherent amb el document funcional del projecte

---

## 2. Implementacio de `CreatePublicationView.vue`

Fitxer:

- `frontend/src/views/CreatePublicationView.vue`

Objectiu de la vista:

- oferir un formulari complet perquè l'usuari prepari una publicacio
- permetre que, un cop creada, es pugui veure a `PublicationView.vue`

Estructura actual del formulari:

- `Informacio principal`
  - titol
  - cim relacionat
  - dificultat
  - data de l'activitat
  - `trackUrl` opcional

- `Fitxa tecnica`
  - distancia
  - desnivell positiu
  - desnivell negatiu
  - temps estimat
  - altitud maxima
  - altitud minima

- `Relat de la sortida`
  - descripcio llarga

- `Fotos`
  - seleccio multiple
  - preview local
  - possibilitat d'afegir imatges en diverses tandes
  - boto per treure una imatge concreta

- `Track i mapa`
  - seccio placeholder
  - prepara la UI per a la futura integracio amb el planificador

També s'ha afegit:

- una targeta superior de `Resum previ`
- validacions de frontend
- missatges d'error
- estat de `Publicant...`

Important:

- el camp visual `Tipus d'activitat` es va retirar de la UI per decisio funcional
- tot i aixó, mentre backend el continuava esperant, el frontend ha seguit enviant internament un valor fix de `tipusActivitat`
- això es fa nomes per no bloquejar la creacio mentre el contracte real encara no esta tancat del tot

---

## 3. Connexio de `CreatePublicationView` amb backend real

Fitxer:

- `frontend/src/views/CreatePublicationView.vue`

Flux real implementat:

1. carregar cims amb `GET /peaks`
2. validar dades del formulari
3. pujar imatges a `POST /uploads/publicacions`
4. recollir les `url` retornades
5. crear la publicacio amb `POST /publicacions`

Contracte usat al frontend:

- `cimId`
- `titol`
- `descripcio`
- `dificultat`
- `dataActivitat`
- `distanciaKm`
- `desnivellPosM`
- `desnivellNegM`
- `tempsMin`
- `altitudMaxM`
- `altitudMinM`
- `trackUrl` si existeix
- `imageUrls`

Tractament del temps:

- l'usuari escriu el temps en format humà
  - `hh:mm`
  - `hh:mm:ss`
- el frontend el converteix a minuts abans d'enviar-lo al backend

Objectiu:

- evitar que l'usuari hagi d'escriure directament `120 min`
- mantenir una experiència més natural al formulari

---

## 4. Fallback temporal quan backend falla a crear publicacions

Fitxers:

- `frontend/src/views/CreatePublicationView.vue`
- `frontend/src/utils/mockPublications.js`

Per què s'ha fet:

- en alguns moments `POST /publicacions` fallava per problemes de base de dades local
- per no bloquejar la maquetacio ni les proves del flux de frontend, s'ha creat un fallback temporal

Com funciona:

1. el frontend intenta crear la publicacio real
2. si backend respon correctament, es redirigeix a `/publicacio/:id`
3. si backend falla, el frontend construeix una publicacio temporal
4. aquesta publicacio temporal es desa a `localStorage`
5. la navegacio redirigeix igualment a una URL tipus:
   - `/publicacio/mock-publicacio-...`

Resultat:

- l'usuari pot continuar veient la pagina final de publicacio
- es pot validar el disseny i el flux visual encara que backend no guardi a la BD

Important:

- aquestes publicacions temporals no existeixen a la base de dades
- per tant no apareixen a les llistes que venen de backend, com ara les publicacions relacionades d'un cim

---

## 5. Fallback temporal de cims a `CreatePublicationView`

Fitxer:

- `frontend/src/views/CreatePublicationView.vue`

Problema detectat:

- el selector de `Cim relacionat` depenia de `GET /peaks`
- quan aquest endpoint fallava al backend, el formulari quedava trencat i no es podia continuar provant

Solucio aplicada:

- si `GET /peaks` falla, el frontend carrega una llista temporal de cims mock
- aquesta llista usa ids reals del seed del backend sempre que ha estat possible:
  - `cim_la_mola`
  - `cim_pedraforca`
  - `cim_puigmal`
  - etc.

Resultat:

- el formulari continua sent usable
- el `Cim relacionat` continua tenint sentit
- quan backend es recupera, la vista torna a consumir l'endpoint real sense canvis addicionals

---

## 6. Implementacio de `PublicationView.vue`

Fitxer:

- `frontend/src/views/PublicationView.vue`

Objectiu de la vista:

- mostrar la publicacio final com una pagina visual i editorial, seguint la maqueta del projecte

Estructura actual:

- capçalera de publicacio
  - titol
  - autoria (`by Usuari`)
  - foto de perfil o avatar de fallback
  - boto de `Veure cim`
  - boto de cor amb comptador de likes

- `Fitxa tecnica ruta`
  - distancia
  - desnivell positiu
  - desnivell negatiu
  - dificultat
  - altitud maxima
  - altitud minima
  - temps
  - data de realitzacio
  - comarca
  - cim associat

- `Descripcio`

- `Imatges destacades`
  - visor principal
  - navegacio anterior/seguent
  - miniatures si hi ha mes d'una imatge

- `Mapa de la ruta`
  - placeholder visual
  - text indicant que arribara amb la integracio de `Planificar ruta`
  - enllac a `trackUrl` si existeix

- `Comentaris`
  - llistat de comentaris
  - formulari visual preparat

Resultat:

- la publicacio ja te una estructura molt semblant a la maqueta
- el detall ja queda pensat per connectar-se mes endavant amb les parts de likes, comentaris i planificador

---

## 7. Galeria d'imatges i tractament de media

Fitxers:

- `frontend/src/views/PublicationView.vue`
- `frontend/src/views/CreatePublicationView.vue`
- `frontend/src/utils/media.js`

Què s'ha fet:

- la publicacio intenta mostrar primer `images`
- si no hi ha galeria pero hi ha `portadaUrl`, es construeix una galeria d'una sola imatge
- es resolen correctament rutes relatives del backend com:
  - `/uploads/publicacions/...`

Millora afegida:

- el helper `resolveMediaUrl` ara tambe deixa passar correctament:
  - `data:`
  - `blob:`

Per què era necessari:

- les publicacions temporals mock creen imatges locals amb `data:` o `blob:`
- sense aquesta adaptacio, aquestes imatges es trencaven al visor

Resultat:

- les imatges reals del backend es poden resoldre correctament
- les imatges temporals de publicacions mock també es poden veure

---

## 8. Likes de publicacio: què s'ha pogut fer

Fitxer:

- `frontend/src/views/PublicationView.vue`

Què s'ha implementat:

- boto de cor visible a la capçalera
- comptador de likes
- estil visual d'estat actiu
- comprovacio de login abans d'interaccionar

Què no s'ha pogut connectar del tot:

- no s'ha trobat un endpoint clar de toggle like al backend
- per tant, el boto encara no pot:
  - afegir like real
  - treure like real

Estat actual:

- visualment i a nivell de UX, el boto esta preparat
- funcionalment, depen de backend

---

## 9. Comentaris: què s'ha pogut fer

Fitxer:

- `frontend/src/views/PublicationView.vue`

Què s'ha implementat:

- llistat de comentaris si venen del backend
- formulari visual per afegir comentari
- control de login

Què no s'ha pogut connectar del tot:

- no s'ha trobat un endpoint clar de creacio de comentaris
- per tant, el formulari encara no pot publicar comentaris reals

Estat actual:

- la lectura ja esta preparada
- la creacio queda pendent del backend

---

## 10. Mock fallback de `PublicationView`

Fitxers:

- `frontend/src/views/PublicationView.vue`
- `frontend/src/utils/mockPublications.js`
- `frontend/src/mocks/peakDetails.js`

Com funciona:

1. `PublicationView` intenta carregar `GET /publicacions/:id`
2. si funciona, es mostra la publicacio real
3. si falla, es busca si aquella publicacio existeix:
   - al `localStorage` de publicacions temporals
   - als mocks associats a fitxa de cim
4. si existeix, es mostra la publicacio mock
5. la vista mostra un avís indicant que es tracta d'una publicacio temporal

Objectiu:

- no bloquejar el treball de frontend
- poder continuar validant el disseny encara que backend falli

---

## 11. Què s'ha cobert al frontend respecte la issue

Issue:

- `PublicationView: banner tecnic, descripcio, galeria fotos, mapa de ruta`
- `CreatePublicationView: formulari complet`
- `Boto like reactiu (requereix login)`
- `Seccio de comentaris (llistar i crear)`

Cobertura real del frontend:

- `PublicationView`
  - banner tecnic: sí
  - descripcio: sí
  - galeria de fotos: sí
  - mapa de ruta: no real; s'ha deixat placeholder pendent del planificador

- `CreatePublicationView`
  - formulari complet: sí
  - dificultat, distancia, fotos, descripcio, cim relacionat, dades tecniques: sí
  - `Tipus d'activitat`: no visible per decisio funcional; el frontend encara envia un valor intern mentre backend el necessita

- `Boto like reactiu`
  - login i estat visual: sí
  - toggle real: no, pendent del backend

- `Comentaris`
  - llistat: sí
  - creacio real: no, pendent del backend

---

## 12. Limitacions reals detectades al backend

Aquestes limitacions no son del frontend, pero afecten la prova completa:

- `GET /peaks` ha fallat en alguns entorns locals amb error intern
- `POST /publicacions` ha fallat en alguns entorns locals per desalineacio de base de dades
- no s'ha trobat endpoint clar per:
  - afegir/treure like
  - crear comentari
- el mapa real de ruta no s'ha pogut integrar encara perquè depen del flux de `Planificar ruta`

Per aquest motiu:

- el frontend s'ha deixat preparat amb fallbacks i placeholders honestos
- quan backend estigui complet i estable, aquestes parts es podran connectar sense haver de redissenyar la vista

---

## Resum final

Al frontend ja s'ha deixat resolta la part principal de publicacions:

- crear una publicacio des d'un formulari complet
- veure una publicacio en una pagina final coherent amb la maqueta
- vincular la publicacio amb un cim
- mostrar fitxa tecnica, descripcio i galeria
- separar correctament `Planificar ruta` de `Crear publicacio`

També s'ha deixat preparada la UX per a:

- likes de publicacio
- comentaris
- track i mapa

I, molt important, s'ha afegit infraestructura temporal de mock perquè el desenvolupament del frontend pugui continuar encara que backend o base de dades no estiguin del tot alineats.
