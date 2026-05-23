# CIMSCAT PULIR DETALLS

## Objectiu

Documentar els ajustos finals aplicats al frontend per deixar l'aplicacio mes coherent visualment, mes clara per a l'usuari i mes propera a les pantalles previstes al disseny del projecte.

Aquest document recull canvis de polit i millora d'experiencia d'usuari. No inclou canvis de backend, Prisma, migracions ni seeds.

## Context funcional

Durant la revisio final del projecte es van detectar diversos detalls visuals i de navegacio que podien millorar-se abans de tancar la versio. La major part dels canvis estaven relacionats amb:

- textos i accents en catala
- ordre i claredat dels formularis
- coherencia entre targetes i carrusels
- connexio visual entre mapa i llistats
- simplificacio d'elements duplicats
- millora de la vista de planificacio de rutes

L'objectiu ha estat mantenir la funcionalitat ja existent, pero polir la presentacio per fer que l'aplicacio sembli mes acabada i mes facil d'utilitzar.

## Fitxers modificats

### Frontend

- `frontend/src/components/AdminPeakModal.vue`
- `frontend/src/components/NavBar.vue`
- `frontend/src/components/PeakCard.vue`
- `frontend/src/views/AdminDashboard.vue`
- `frontend/src/views/CreatePublicationView.vue`
- `frontend/src/views/HomeView.vue`
- `frontend/src/views/PeakDetailView.vue`
- `frontend/src/views/PlanRouteView.vue`
- `frontend/src/views/ProfileView.vue`
- `frontend/src/views/PublicationView.vue`

## 1. Ajustos de navegacio i navbar

S'ha simplificat la navegacio superior per evitar elements duplicats o poc clars.

Canvis principals:

- s'ha eliminat el boto negre amb el nom d'usuari quan ja hi havia l'avatar circular que porta al perfil
- en usuaris administradors, s'ha mantingut l'acces al panell i s'han amagat accions que no corresponen al rol admin, com crear publicacions o planificar rutes
- s'ha canviat el text `Admin` per `Panell`
- s'han corregit textos com `Tancar sessio` per `Tancar sessió`

Resultat:

- la navbar queda mes neta
- l'acces al perfil es manté amb l'avatar
- el rol admin queda separat del flux normal d'usuari

## 2. Home: connexio entre mapa i cims destacats

A la Home s'ha millorat la relacio entre el mapa i el llistat de cims destacats.

Abans:

- el mapa mostrava els marcadors dels cims
- el llistat de l'esquerra funcionava de manera independent
- si es clicava un marcador, no sempre quedava clar quin cim corresponia al llistat

Ara:

- quan es clica una card de cim, el mapa se centra en aquell cim i obre el marcador corresponent
- quan es clica un marcador del mapa, la card del cim es ressalta i el llistat fa scroll fins deixar-la visible
- el marcador seleccionat es mostra mes destacat visualment

Resultat:

- el mapa i el llistat treballen junts
- l'usuari pot localitzar mes facilment un cim concret
- la Home queda mes interactiva i mes coherent

## 3. Fitxa de cim

S'ha ajustat la fitxa de cim per acostar-la mes al disseny previst.

Canvis principals:

- s'ha eliminat dependencia de dades mock quan no calia
- s'ha donat mes pes a la informacio oficial del cim
- s'han tret estadistiques internes de la part tecnica quan no aportaven valor a la fitxa publica
- s'ha reorganitzat el contingut per semblar mes una fitxa professional
- s'han mantingut espais buits quan encara no hi ha dades reals, en comptes d'omplir amb informacio inventada

Resultat:

- la fitxa mostra millor el cim com a element oficial de la plataforma
- les publicacions relacionades queden separades de les dades tecniques
- la pantalla queda mes clara i menys carregada

## 4. Formulari de creacio de publicacions

La vista de crear publicacio s'ha revisat per millorar ordre, textos i coherencia.

Canvis principals:

- s'ha mantingut el camp `Dificultat`, ja que continua formant part del contracte real de publicacio
- s'ha eliminat el camp visible d'enllac manual del track
- s'ha mogut la seleccio de rutes guardades a la part inferior del formulari, just abans de `Track i mapa`
- s'ha canviat `Ruta planificada vinculada` per `Rutes guardades`
- s'ha eliminat el boto `Recarregar rutes` i el recompte visual de rutes disponibles
- s'ha simplificat el format del temps estimat a `h:mm`
- s'han corregit textos i accents

Resultat:

- el formulari queda mes ordenat
- la ruta guardada queda mes ben situada dins el flux de publicacio
- el temps estimat es demana amb un format mes clar

## 5. Planificador de rutes

La vista del planificador s'ha modificat per apropar-la al wireframe previst inicialment.

Canvis visuals:

- s'ha tret el text superior `Planificador de rutes`
- s'ha mantingut el titol principal `Planificar Ruta`
- s'ha afegit un buscador visual de cim, comarca o ruta
- s'ha ampliat el mapa com a element principal
- s'ha col.locat el panell `La teva ruta` sobre el mapa
- s'ha afegit una fitxa tecnica inferior amb dades resumides
- s'ha evitat afegir una seccio de comentaris, ja que no formava part de l'abast final

Canvis funcionals de frontend:

- quan l'usuari selecciona un cim principal, el mapa s'apropa automaticament a aquell cim si te coordenades
- el planificador pot carregar una ruta existent mitjancant `routeId` a la URL
- si s'obre una ruta existent des del perfil, es carreguen el cim, el nom, el tipus d'activitat, el ritme, el tipus de recorregut i els punts
- el boto passa de `Guardar ruta` a `Guardar canvis` quan s'esta editant una ruta existent

Resultat:

- la pantalla s'assembla mes al disseny plantejat
- l'usuari no ha de buscar manualment el cim al mapa
- una ruta planificada es pot recuperar i modificar des del frontend utilitzant els endpoints ja existents

## 6. Perfil: rutes planificades i carrusels

S'ha revisat la seccio de perfil per fer que les rutes planificades encaixin millor amb la resta de carrusels.

Canvis principals:

- s'han eliminat textos descriptius sobrants sota alguns titols
- les targetes de rutes planificades tenen el mateix estil base que les altres targetes
- s'ha canviat el fons de les rutes a blanc per unificar el disseny
- s'ha ajustat l'alcada de les targetes per evitar espai buit excessiu
- s'ha afegit el boto `Veure ruta`
- el boto porta al planificador amb la ruta carregada

Resultat:

- la seccio `Rutes planificades` queda visualment mes coherent
- l'usuari pot tornar a una ruta ja guardada
- es pot modificar una ruta existent sense crear una pantalla nova

## 7. Panell d'administracio

S'han polit textos del panell d'administracio per mantenir coherencia lingüistica.

Canvis principals:

- `administracio` passa a `administració`
- `moderacio` passa a `moderació`
- `publicacio` passa a `publicació`
- `cataleg` passa a `catàleg`

Resultat:

- el panell queda mes cuidat
- es redueixen barreges o errors de llengua visibles a la interfície

## 8. Limitacions i abast

Aquests canvis s'han fet nomes al frontend.

No s'ha modificat:

- backend
- endpoints
- Prisma
- migracions
- seeds
- base de dades

La part de planificacio avanzada de tracks, com ara calcul real de rutes per camins, superficies, desnivell fiable o perfil d'elevacio real, queda fora d'aquest bloc de polit. Aquesta funcionalitat requeriria una integracio posterior amb motors de routing o serveis externs de mapes i elevacio.

## 9. Validacio

Despres dels canvis s'ha executat:

```bash
npm run build
```

Resultat:

- el frontend compila correctament
- no s'han detectat errors de build

## 10. Resum final

Aquest bloc de treball ha servit per acabar de polir la part visual i funcional del frontend. Els canvis no introdueixen nous models de dades ni modifiquen el backend, pero milloren la percepcio final de l'aplicacio: navegacio mes clara, formularis mes ordenats, perfil mes coherent, planificador mes proper al disseny previst i millor connexio entre mapa i contingut.

