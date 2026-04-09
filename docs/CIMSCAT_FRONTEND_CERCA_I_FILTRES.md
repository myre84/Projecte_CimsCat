# CimsCat Frontend: Cerca i filtres

## Objectiu d'aquest resum

Documentar la implementacio feta al frontend per cobrir la part de:

- cerca global de cims
- autocompletat des de la `NavBar`
- suport de cerca per cims i comarques
- estats de loading, error i sense resultats
- responsive de la Home i de la navegacio

Aquest resum explica:

- quina interpretacio funcional s'ha acabat seguint
- quines parts s'han connectat de veritat amb backend
- quins fitxers s'han modificat o creat
- quines limitacions continuen depenent d'altres tasques o del backend

---

## Interpretacio funcional final

Inicialment es va estudiar si la cerca havia de:

- actualitzar la zona de `Cims destacats` a la Home
- o funcionar com una cerca global independent

Despres de revisar el document de conceptes i d'ajustar la UX amb captures i proves reals, la interpretacio final ha estat aquesta:

- el cercador viu a la `NavBar`
- ha de funcionar igual a totes les pagines
- quan l'usuari escriu el nom d'un cim, el sistema autocompleta i pot obrir directament la fitxa del cim
- quan l'usuari escriu una comarca, al desplegable apareix la comarca i a sota els cims d'aquella comarca
- no es reutilitzen les cards de la Home com a pantalla de resultats
- no es redirigeix a la Home per resoldre la cerca

A nivell de producte, aquesta interpretacio s'ha considerat mes coherent perquè la `NavBar` deixa de ser una UI que nomes "sembla" funcional a la Home i passa a ser una eina global de navegacio real.

---

## Context backend utilitzat

Per aquesta part del frontend nomes s'ha aprofitat el que ja existia al backend.

L'endpoint real utilitzat ha estat:

- `GET /peaks`

I els camps rellevants per la cerca han estat:

- `id`
- `nom`
- `comarca`
- `alcada`
- `dificultat`
- `lat`
- `lon`
- `imatgeUrl`
- `massis`
- `zonaProtegida`

També es va revisar que el backend admetia filtres com:

- `search`
- `comarca`
- `dificultat`
- `minAlcada`
- `maxAlcada`

Pero la implementacio final acordada no s'ha orientat a una pantalla de resultats filtrats a la Home, sino a una cerca global de navegacio cap a cims.

---

## Fitxers modificats o creats

- `frontend/src/components/NavBar.vue`
- `frontend/src/views/HomeView.vue`
- `frontend/src/composables/usePeakSearch.js`

---

## 1. Refactor del cercador per fer-lo global

Fitxers:

- `frontend/src/components/NavBar.vue`
- `frontend/src/composables/usePeakSearch.js`

Problema inicial:

- la logica de cerca vivia dins de `HomeView.vue`
- la `NavBar` nomes funcionava de veritat a la Home
- a la resta de pagines es podia escriure, pero no hi havia desplegable ni comportament coherent

Canvi aplicat:

- s'ha tret la logica de cerca de `HomeView`
- s'ha creat el composable `usePeakSearch.js`
- aquest composable concentra:
  - la carrega del cataleg de cims
  - la normalitzacio del text
  - la construccio de suggeriments
  - la distincio entre cims i comarques
  - la navegacio a la fitxa del cim

Resultat:

- la `NavBar` funciona igual a la Home, a publicacions, a perfils, a fitxes de cim i a la resta de vistes
- la cerca deixa de dependre de la Home

---

## 2. Autocompletat de cims

Fitxers:

- `frontend/src/composables/usePeakSearch.js`
- `frontend/src/components/NavBar.vue`

Com funciona:

- mentre l'usuari escriu, es comparen les coincidencies amb el cataleg carregat de cims
- si el text encaixa amb noms de cims, el desplegable mostra suggeriments de tipus `Cim`
- si l'usuari prem `Enter` i hi ha un cim clar, el sistema navega directament a:
  - `/cim/:id`

Regla funcional aplicada:

- si hi ha una coincidencia exacta de nom, es prioritza aquesta
- si no hi ha coincidencia exacta, es pot agafar el primer cim clar del desplegable

Objectiu:

- fer que el cercador serveixi realment per arribar a la fitxa oficial del cim
- reduir passos innecessaris de navegacio

---

## 3. Cerca per comarques amb desplegable agrupat

Fitxers:

- `frontend/src/composables/usePeakSearch.js`
- `frontend/src/components/NavBar.vue`

Interpretacio funcional acordada:

- la comarca no te fitxa propia
- per tant, no te sentit navegar automaticament a una "pagina de comarca"
- quan l'usuari escriu una comarca, el desplegable mostra:
  - el nom de la comarca
  - i a sota, els cims que hi pertanyen

Exemple conceptual:

- `Comarca: Bergueda`
  - `Pedraforca`
  - `Comabona`
  - etc.

Decisio important:

- si l'usuari esta en un cas de comarca, el `Enter` no obre una fitxa inventada
- l'usuari ha de triar un dels cims del grup

Resultat:

- es suporta la cerca per comarca sense haver d'inventar una pantalla nova
- el flux continua sent coherent amb el domini real del projecte: el desti final segueix sent un cim

---

## 4. Millora visual del desplegable

Fitxer:

- `frontend/src/components/NavBar.vue`

Durant la implementacio es van fer diversos ajustos visuals perquè el desplegable:

- no fos massa estret
- no repetis informacio innecessaria
- no quedes sobrecarregat en mobil

Canvis finals:

- el bloc de comarca es veu com un grup clar
- s'ha tret la repetició de la comarca dins de cada cim del grup
- el desplegable te una amplada mes amable
- els subelements de cim dins la comarca tenen un estil mes net i separat

Resultat:

- el cercador es veu mes ordenat
- s'entenen millor els dos nivells:
  - comarca
  - cims dins la comarca

---

## 5. Responsive i navegacio movil

Fitxer principal:

- `frontend/src/components/NavBar.vue`

Part de la tasca també consistia a fer que el cercador fos usable en mobil i tauleta.

Canvis aplicats:

- la `NavBar` d'escriptori es manté estable
- en mobil, la cerca es pot obrir i tancar amb la lupa
- la barra oberta s'integra dins la mateixa franja de navegacio
- el desplegable continua penjant del camp de cerca
- s'han anat ajustant amplades i comportament per evitar superposicions amb:
  - hamburguesa
  - icona de perfil
  - botons d'autenticacio

Resultat:

- la cerca global es pot fer servir tambe en mobil
- la navegacio no depen d'una sola mida de pantalla

---

## 6. Simplificacio de `HomeView.vue`

Fitxer:

- `frontend/src/views/HomeView.vue`

Abans:

- la Home feia alhora de:
  - portada visual
  - llistat destacat
  - mapa
  - i motor principal de cerca

Despres del canvi:

- la Home torna a quedar centrada en:
  - hero
  - `Cims destacats`
  - mapa

I el cercador:

- deixa de viure funcionalment dins la Home
- passa a ser responsabilitat global de la `NavBar`

Resultat:

- menys duplicacio de logica
- menys dependencia entre la Home i la cerca
- estructura mes neta del projecte

---

## 7. Estats de loading, error i sense resultats

Fitxer principal:

- `frontend/src/views/HomeView.vue`

Per la part de Home i de cims destacats s'han deixat visibles els estats basics:

- `loading`
- `error`
- `sense resultats` / missatge buit

Part important:

- no s'ha convertit la Home en una pantalla de resultats del cercador global
- per tant, aquests estats continuen aplicant a la carrega dels cims destacats i del mapa

La cerca global del `NavBar` no mostra una vista completa de resultats:

- mostra suggeriments
- i navega a la fitxa del cim

Per tant, els estats de loading/error/empty de la tasca s'han resolt principalment a la part de Home, que era la zona que ja tenia llistat i mapa.

---

## 8. Connexio real amb backend

Aquest bloc s'ha connectat de veritat amb backend en tot el que ja existia:

- carrega del cataleg de cims amb `GET /peaks`
- lectura de `nom` i `comarca` per a l'autocompletat
- navegacio a la fitxa real del cim

No s'ha inventat backend ni s'ha tocat res del backend.

Tampoc s'ha necessitat mock per aquesta part de la cerca global.

---

## 9. Limitacions i coses que queden fora

No s'ha implementat en aquest bloc:

- una pagina propia de resultats de cerca
- una fitxa de comarca
- filtres visuals avançats dins del desplegable
- ordenacions o filtres extra com `massis`, `sortBy` o `sortOrder`

I tampoc s'ha convertit tota l'app a "zero dades estatiques", perquè:

- aquesta part depèn d'altres tasques del projecte
- i no era l'objectiu realista d'aquest bloc

---

## Resum final

La feina de `cerca i filtres` ha acabat derivant cap a una solucio mes neta i mes coherent amb el producte:

- la `NavBar` funciona de veritat a totes les pagines
- la cerca per cims porta directament a la fitxa del cim
- la cerca per comarques es resol amb un desplegable agrupat que mostra els cims d'aquella comarca
- la Home deixa de ser un pseudo-resultat de cerca i recupera el seu paper de portada amb destacats i mapa

La connexio amb backend s'ha fet nomes on ja existia contracte real, sense inventar res i sense tocar backend.
