# CIMSCAT BACKEND: ROUTES PLANIFICADES - IMPLEMENTACIO I VALIDACIO

1. Objectiu de la fase

Aquesta fase implementa el modul complet de rutes planificades amb punts ordenats i visibilitat publica. L objectiu es que qualsevol usuari pugui veure rutes planificades, i que les publicacions puguin enllacar una ruta de forma opcional sense trencar el flux existent.

2. Decisions funcionals

- Les rutes planificades son publiques per decisio de producte.
- GET /routes/:id es public i no requereix autenticacio.
- GET /users/:id/routes es public i mostra les rutes d un usuari.
- POST/PUT/DELETE /routes requereixen autenticacio.
- Nomes el propietari o un admin pot modificar o eliminar una ruta.
- Una publicacio pot existir amb o sense rutaPlanificadaId.
- Si una publicacio te ruta vinculada, el detall retorna la ruta completa amb waypoints.

3. Canvis a Prisma

- S ha afegit el camp `tipusRecorregut String` al model `RutaPlanificada`.
- Valors possibles: `one-way`, `round-trip`, `circular`.
- Migracio creada: add_tipus_recorregut_to_ruta_planificada.

4. Endpoints implementats

Publics:
- GET /routes/:id
- GET /users/:id/routes

Protegits:
- POST /routes
- PUT /routes/:id
- DELETE /routes/:id

5. Contractes JSON

POST /routes (201)
{
  "ok": true,
  "message": "Ruta planificada creada correctament",
  "route": {
    "id": "...",
    "usuariId": "...",
    "cimId": "...",
    "nom": "...",
    "tipusActivitat": "...",
    "ritme": "...",
    "tipusRecorregut": "circular",
    "distanciaKm": 11.8,
    "desnivellPosM": 640,
    "desnivellNegM": 640,
    "tempsMin": 255,
    "altitudMaxM": 1104,
    "altitudMinM": 760,
    "trackUrl": null,
    "notes": "...",
    "createdAt": "...",
    "updatedAt": "...",
    "author": {
      "id": "...",
      "nomUsuari": "...",
      "nom": "...",
      "cognom": "...",
      "fotoPerfil": "..."
    },
    "peak": {
      "id": "...",
      "nom": "...",
      "alcada": 1104,
      "comarca": "...",
      "massis": "...",
      "lat": 41.6405,
      "lon": 2.0178
    },
    "waypoints": [
      {
        "id": "...",
        "etiqueta": "sortida",
        "nomPunt": "Can Robert",
        "lat": 41.6429,
        "lon": 2.0255,
        "ordreIndex": 0,
        "createdAt": "..."
      }
    ]
  }
}

GET /routes/:id (200)
- Retorna el mateix format que POST /routes.

GET /users/:id/routes (200)
{
  "ok": true,
  "message": "Rutes de l'usuari recuperades correctament",
  "userId": "...",
  "count": 2,
  "routes": [
    {
      "id": "...",
      "nom": "...",
      "tipusActivitat": "...",
      "ritme": "...",
      "tipusRecorregut": "circular",
      "distanciaKm": 11.8,
      "desnivellPosM": 640,
      "desnivellNegM": 640,
      "tempsMin": 255,
      "altitudMaxM": 1104,
      "altitudMinM": 760,
      "trackUrl": null,
      "notes": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "peak": {
        "id": "...",
        "nom": "...",
        "alcada": 1104,
        "comarca": "...",
        "massis": "..."
      },
      "waypointsCount": 4
    }
  ]
}

6. Validacions

- El body ha de ser un objecte JSON valid.
- `cimId`, `nom`, `tipusActivitat`, `ritme`, `tipusRecorregut` son obligatoris.
- `tipusRecorregut` valors acceptats: one-way, round-trip, circular.
- `distanciaKm`, `desnivellPosM`, `desnivellNegM` han de ser numerics i >= 0.
- `tempsMin` ha de ser numeric i > 0.
- `altitudMaxM` i `altitudMinM` han de ser numerics i altitudMaxM >= altitudMinM.
- `trackUrl` i `notes` son opcionals i admeten null o string no buit.
- `waypoints` es obligatori i ha de ser array amb almenys 2 elements.
- Cada waypoint ha de tenir `lat` numeric i `lon` o `lng` numeric.
- Els rangs de coordenades: lat [-90, 90], lon [-180, 180].
- El backend ignora `ordreIndex` del client i reordena segons l'ordre del array.
- Si `nomPunt` falta o es buit, es genera `Punt A`, `Punt B`, `Punt C`.

7. Regles de permisos

- POST /routes: requereix token valid, la ruta pertany a req.auth.userId.
- PUT /routes/:id: nomes propietari o admin (req.auth.rol === 'admin').
- DELETE /routes/:id: nomes propietari o admin.

8. Com es vincula RutaPlanificada amb Publicacio

- `Publicacio.rutaPlanificadaId` es opcional.
- POST /publicacions accepta o ignora rutaPlanificadaId.
- Si s envia rutaPlanificadaId:
  - la ruta ha d existir,
  - ha de pertanyer a l usuari autenticat.
- GET /publicacions/:id retorna `route: null` si no hi ha ruta vinculada.
- Si hi ha ruta vinculada, retorna la ruta amb waypoints ordenats.

9. Canvis frontend relacionats

- PlanRouteView: formulari complet amb mapa Leaflet, selector de cim i desament de rutes via POST /routes.
- CreatePublicationView: selector opcional de ruta planificada, amb opcio "Sense ruta vinculada".
- PublicationView: mapa real amb waypoints si la publicacio te ruta vinculada.

10. Guia de proves manuals amb Postman o Thunder Client

Backend:
1) POST /routes amb token valid
2) POST /routes crea PuntRuta ordenats
3) POST /routes accepta lon
4) POST /routes accepta lng
5) POST /routes falla amb 1 waypoint
6) POST /routes falla amb lat/lon invalid
7) POST /routes falla si falta cimId
8) POST /routes falla si cimId no existeix
9) GET /routes/:id funciona sense token
10) GET /routes/:id retorna waypoints ordenats
11) GET /routes/:id retorna author i peak
12) GET /users/:id/routes funciona sense token
13) PUT /routes/:id funciona per owner
14) PUT /routes/:id falla per altre usuari normal
15) PUT /routes/:id funciona per admin
16) PUT /routes/:id reemplassa waypoints
17) DELETE /routes/:id funciona per owner
18) DELETE /routes/:id falla per altre usuari normal
19) DELETE /routes/:id funciona per admin
20) Esborrar una ruta no elimina publicacions vinculades

Publicacions:
21) POST /publicacions sense rutaPlanificadaId funciona
22) POST /publicacions amb rutaPlanificadaId propia funciona
23) POST /publicacions amb rutaPlanificadaId d un altre usuari falla
24) GET /publicacions/:id retorna route: null si no hi ha ruta
25) GET /publicacions/:id retorna route amb waypoints si hi ha ruta

Frontend:
26) PlanRouteView carrega cims
27) PlanRouteView desa ruta amb 2 o mes waypoints
28) PlanRouteView mostra error si el guardat falla
29) CreatePublicationView publica sense ruta
30) CreatePublicationView publica amb ruta seleccionada
31) PublicationView mostra missatge si no hi ha ruta
32) PublicationView mostra mapa Leaflet si hi ha ruta
33) PublicationView es public, no requereix login

11. Checklist final de validacio

- [ ] Migracio aplicada i Prisma client regenerat
- [ ] Seed actualitzat amb tipusRecorregut
- [ ] Rutes publiques accessibles
- [ ] CRUD protegit amb permisos correctes
- [ ] Publicacions amb ruta optatives i consistents
- [ ] Frontend mostra mapa amb waypoints

Fi del document.
