# CIMSCAT FRONTEND AWARDS

## Objectiu

Implementar al frontend el bloc d'awards del perfil d'usuari amb:

- banner d'estadistiques
- donut charts amb Chart.js
- graella d'insignies
- diferenciacio entre perfil propi i perfil alie

Aquest bloc s'ha construït reutilitzant dades reals del projecte quan existeixen i deixant clar quines parts encara depenen d'una definicio temporal al frontend.

## Context funcional

Segons el concepte del projecte, el perfil ha d'incloure un espai de motivacio i seguiment del progres relacionat amb activitat real de muntanya.

Aquest sistema no s'ha plantejat com una capa social basada en likes, sino com un bloc de progres basat en:

- cims assolits
- distancies reals registrades
- reptes de muntanya
- completitud territorial o d'altitud

## Fitxers modificats o creats

### Creats

- `frontend/src/composables/useProfileAwards.js`
- `frontend/src/components/ProfileStatsBanner.vue`
- `frontend/src/components/AwardDonutCard.vue`
- `frontend/src/components/BadgeGrid.vue`

### Modificats

- `frontend/src/views/ProfileView.vue`
- `frontend/src/views/ForeignProfileView.vue`

## Dades reals connectades

La base real del sistema surt principalment de:

- `GET /users/:id/publications`
- `GET /peaks`

Amb aquestes dades es calcula al frontend:

- km aquesta setmana
- km aquest mes
- km aquest any
- cims unics completats
- cims de mes de 3000 m
- comarques diferents explorades
- comarques completades segons el cataleg actual

## Parts temporals al frontend

El backend encara no te un sistema oficial per:

- awards
- badges
- reptes
- estadistiques precomputades

Per aquest motiu, s'ha deixat temporalment al frontend:

- definicio del repte `3000s dels Pirineus catalans`
- definicio del repte `100 cims de la FEC`
- cataleg de badges i regles de desbloqueig

Aixo permet tenir una UX funcional i coherent mentre backend encara no te aquesta part modelada.

## Perfil propi i perfil alie

### Perfil propi

El perfil propi mostra el bloc complet:

- banner de km setmana / mes / any
- donuts de reptes
- llistat resumit de cims completats per repte
- graella completa d'insignies

### Perfil alie

El perfil alie mostra una versio reduida:

- estadistiques
- donuts
- graella d'insignies

Sense carregar tant detall com al perfil propi.

## Donut charts

S'ha fet servir `Chart.js`, que ja estava instal·lat al projecte.

Cada donut mostra:

- nom del repte
- percentatge de progres
- completat / total
- nota explicativa

Els reptes inicials implementats son:

- `3000s dels Pirineus catalans`
- `100 cims de la FEC`

## Banner d'estadistiques

S'ha creat un banner superior amb tres targetes:

- km aquesta setmana
- km aquest mes
- km aquest any

Aquests valors es calculen a partir de les dates i distancies de les publicacions reals de l'usuari.

## Insignies

S'ha implementat una graella completa d'insignies amb dos estats:

- desbloquejades
- bloquejades

Les desbloquejades:

- tenen colors mes vius
- tenen una ombra una mica mes marcada
- tenen una transicio suau

Les bloquejades:

- queden mes apagades
- mantenen el context visual pero sense competir amb les desbloquejades

## Sistema actual d'insignies

El sistema actual inclou:

- Primer cim completat
- 10 cims completats
- Primer +3000
- Tres +3000
- Explorador de comarques
- Comarca completada
- Repte 3000s
- 100 cims FEC

La insignia `Explorador de comarques` es desbloqueja amb cims registrats a 5 comarques diferents.

## Assets visuals

Les insignies fan servir assets SVG guardats a:

- `frontend/src/assets/awards/`

Aquesta solucio permet:

- mantenir una aparenca mes rica que amb text o emojis
- reutilitzar icones visuals al llarg del projecte
- millorar la llegibilitat de les insignies desbloquejades

## Limitacions actuals

- el backend encara no defineix reptes oficials
- el backend encara no guarda awards com a entitat propia
- el backend no envia km setmana / mes / any ja calculats
- els reptes i badges actuals depenen d'una logica temporal al frontend

## Resum final

La part d'awards del perfil ha passat de ser un placeholder visual a un bloc funcional amb:

- dades reals de publicacions
- estadistiques calculades
- donuts amb Chart.js
- insignies amb estat desbloquejat o bloquejat
- diferencia entre perfil propi i perfil alie

Tot plegat s'ha fet sense tocar backend i deixant clara la frontera entre:

- dades reals connectades
- i definicions temporals de reptes al frontend
