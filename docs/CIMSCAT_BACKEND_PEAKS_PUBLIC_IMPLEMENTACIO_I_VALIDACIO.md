# CimsCat Backend Peaks Public: Implementacio i Validacio

Document explicatiu del modul public de cims (peaks) implementat al backend de CimsCat.

Aquest document segueix el mateix estil dels altres docs del projecte i descriu:
- que s'ha implementat exactament
- com funciona internament
- quin contracte JSON exposem
- com provar manualment que tot funciona

## Context del que tenim al backend fins ara

El backend actual de CimsCat te:
- Express + CommonJS
- Prisma + PostgreSQL
- modul d'autenticacio (`/auth`)
- endpoint de salut (`/health`)
- carpeta d'uploads exposada (`/uploads`)
- model de dades complet amb cims, rutes, publicacions i relacions socials

Sobre aquesta base, hem afegit el modul public de peaks sense trencar cap part existent.

## Que s'ha implementat en aquesta tasca

### Endpoints publics nous
- `GET /peaks`
- `GET /peaks/:id`

### Fitxers creats del modul
- `backend/src/modules/peaks/peaks.routes.js`
- `backend/src/modules/peaks/peaks.controller.js`
- `backend/src/modules/peaks/peaks.service.js`
- `backend/src/modules/peaks/peaks.validators.js`

### Fitxer integrat/modificat
- `backend/src/app.js` (mount de `app.use('/peaks', peaksRoutes)`)

## Arquitectura aplicada (mateix patro del projecte)

S'ha seguit el mateix patro que auth:
- `routes`: defineix rutes HTTP
- `controller`: entrada/sortida HTTP i gestio d'errors
- `service`: logica de negoci + Prisma
- `validators`: validacio i normalitzacio de params

Errors:
- s'ha reutilitzat `createAppError` i `sendError` de `src/common/utils/http-error.js`
- format d'error homogenitzat a tot arreu

## Funcionament detallat de GET /peaks

## Query params suportats
- `search`
- `comarca`
- `massis`
- `dificultat`
- `minAlcada`
- `maxAlcada`
- `sortBy`
- `sortOrder`

## Validacio i normalitzacio

A `peaks.validators.js`:
- es fan `trim` als camps de text
- `minAlcada` i `maxAlcada` es parsegen com a Number
- si `minAlcada` o `maxAlcada` no son valids, retorna 400
- si `minAlcada > maxAlcada`, retorna 400
- `sortBy` nomes admet:
  - `nom`
  - `alcada`
  - `comarca`
  - `massis`
  - `createdAt`
- `sortOrder` nomes admet:
  - `asc`
  - `desc`
- defaults quan no venen:
  - `sortBy = nom`
  - `sortOrder = asc`

Error funcional utilitzat:
- status: `400`
- code: `INVALID_QUERY_PARAMS`
- message: `Parametres de consulta invalids`

## Consulta Prisma de llistat

A `peaks.service.js` (`getPeaksList`):
- `findMany` sobre model `Cim`
- `where` dinamic segons filtres
- `orderBy` dinamic segons `sortBy/sortOrder`
- `select` nomes camps necessaris (resposta lleugera)
- `_count` per obtenir estadistiques:
  - `publicacions`
  - `rutesPlanificades`
  - `favoritsCims`

## Contracte de resposta de GET /peaks

```json
{
  "ok": true,
  "message": "Llista de cims recuperada correctament",
  "filters": {
    "search": null,
    "comarca": null,
    "massis": null,
    "dificultat": null,
    "minAlcada": null,
    "maxAlcada": null,
    "sortBy": "nom",
    "sortOrder": "asc"
  },
  "count": 0,
  "peaks": [
    {
      "id": "cim_la_mola",
      "nom": "La Mola",
      "alcada": 1104,
      "comarca": "Valles Occidental",
      "massis": "Sant Llorenc del Munt i l Obac",
      "dificultat": "moderada",
      "lat": 41.6405,
      "lon": 2.0178,
      "imatgeUrl": "/uploads/cims/la-mola.jpg",
      "zonaProtegida": "Parc Natural de Sant Llorenc del Munt i l Obac",
      "stats": {
        "publicacionsCount": 1,
        "rutesCount": 1,
        "favoritsCount": 1
      }
    }
  ]
}
```

Nota:
- no es retornen dades pesades a llistat
- no es construeixen URLs absolutes d'imatges
- es conserva la ruta relativa de BD

## Funcionament detallat de GET /peaks/:id

## Validacio d'entrada

A `peaks.validators.js`:
- es valida `req.params.id`
- s'aplica trim
- si queda buit, retorna 400 (`INVALID_QUERY_PARAMS`)

## Consulta Prisma de detall

A `peaks.service.js` (`getPeakDetailById`):
- `findUnique` per `id`
- camps base del model `Cim`
- `_count` de:
  - `publicacions`
  - `rutesPlanificades`
  - `favoritsCims`
- `rutesPlanificades` incloses amb:
  - camps resumits de ruta
  - `puntsRuta` inclosos i ordenats per `ordreIndex asc`
- `publicacions` incloses amb:
  - camps resumits de publicacio
  - `usuari` resumit (sense camps sensibles)
  - `_count` de `likes`, `comentaris`, `imatges`
  - ordenacio per `dataActivitat desc`

Si el cim no existeix:
- status: `404`
- code: `PEAK_NOT_FOUND`
- message: `No s'ha trobat cap cim amb aquest id`

## Contracte de resposta de GET /peaks/:id

```json
{
  "ok": true,
  "message": "Detall del cim recuperat correctament",
  "peak": {
    "id": "cim_la_mola",
    "nom": "La Mola",
    "alcada": 1104,
    "comarca": "Valles Occidental",
    "lat": 41.6405,
    "lon": 2.0178,
    "dificultat": "moderada",
    "descripcio": "...",
    "imatgeUrl": "/uploads/cims/la-mola.jpg",
    "massis": "Sant Llorenc del Munt i l Obac",
    "zonaProtegida": "Parc Natural de Sant Llorenc del Munt i l Obac",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z",
    "stats": {
      "publicacionsCount": 1,
      "rutesCount": 1,
      "favoritsCount": 1
    },
    "routes": [
      {
        "id": "rta_la_mola_can_robert",
        "nom": "Circular a La Mola des de Can Robert",
        "tipusActivitat": "senderisme",
        "ritme": "moderat",
        "distanciaKm": 11.8,
        "desnivellPosM": 640,
        "desnivellNegM": 640,
        "tempsMin": 255,
        "altitudMaxM": 1104,
        "altitudMinM": 760,
        "trackUrl": "https://tracks.cimscat.local/rutes/la-mola-can-robert.gpx",
        "notes": "...",
        "points": [
          {
            "id": "prt_lamola_01",
            "etiqueta": "sortida",
            "nomPunt": "Can Robert",
            "lat": 41.6429,
            "lon": 2.0255,
            "ordreIndex": 1
          }
        ]
      }
    ],
    "publications": [
      {
        "id": "pub_lamola_sunrise",
        "titol": "Sortida a La Mola amb primera llum",
        "descripcio": "...",
        "dataActivitat": "2026-02-08T07:30:00.000Z",
        "dificultat": "moderada",
        "distanciaKm": 11.6,
        "desnivellPosM": 635,
        "desnivellNegM": 635,
        "tempsMin": 245,
        "altitudMaxM": 1104,
        "altitudMinM": 760,
        "trackUrl": "https://tracks.cimscat.local/publicacions/pub-lamola-sunrise.gpx",
        "portadaUrl": "/uploads/publicacions/lamola-portada.jpg",
        "author": {
          "id": "usr_daliajordan",
          "nomUsuari": "daliajordan",
          "nom": "Dalia",
          "cognom": "Jordan",
          "fotoPerfil": "/uploads/usuaris/dalia.jpg"
        },
        "stats": {
          "likesCount": 2,
          "commentsCount": 2,
          "imagesCount": 2
        }
      }
    ]
  }
}
```

## Estrategia d'errors (homogenia)

Format estandard del projecte:

```json
{
  "ok": false,
  "error": {
    "status": 400,
    "code": "INVALID_QUERY_PARAMS",
    "message": "Parametres de consulta invalids"
  }
}
```

I per id inexistent:

```json
{
  "ok": false,
  "error": {
    "status": 404,
    "code": "PEAK_NOT_FOUND",
    "message": "No s'ha trobat cap cim amb aquest id"
  }
}
```

## Integracio a l'app principal

A `backend/src/app.js`:
- s'ha mantingut:
  - `cors()`
  - `express.json()`
  - estatics a `/uploads`
  - modul `/auth`
  - health route
- s'ha afegit:
  - `app.use('/peaks', peaksRoutes)`

No s'ha tocat frontend.
No s'ha modificat schema Prisma.
No s'han fet migracions noves.
No s'han afegit llibreries noves.

## Com provar JO que funciona correctament

## 0) Prerequisits

```powershell
node -v
npm -v
docker --version
docker compose version
```

## 1) Arrencar base de dades i backend

```powershell
cd backend
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Resultat esperat:
- backend escoltant a `http://localhost:3000`
- health operatiu

Prova health:

```powershell
Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json
```

## 2) Proves de GET /peaks

### 2.1 Sense filtres

```powershell
Invoke-RestMethod "http://localhost:3000/peaks" | ConvertTo-Json -Depth 10
```

Esperat:
- `ok: true`
- `message: Llista de cims recuperada correctament`
- `filters.sortBy = nom`
- `filters.sortOrder = asc`
- `peaks` amb camps resumits + `stats`

### 2.2 Cerca per text

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?search=mola" | ConvertTo-Json -Depth 10
```

### 2.3 Filtre comarca

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?comarca=Ripolles" | ConvertTo-Json -Depth 10
```

### 2.4 Filtre massis

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?massis=Montseny" | ConvertTo-Json -Depth 10
```

### 2.5 Filtre dificultat

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?dificultat=alta" | ConvertTo-Json -Depth 10
```

### 2.6 Rang d'alcada

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?minAlcada=2000&maxAlcada=3000" | ConvertTo-Json -Depth 10
```

### 2.7 Ordenacio alcada desc

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?sortBy=alcada&sortOrder=desc" | ConvertTo-Json -Depth 10
```

### 2.8 Ordenacio nom asc

```powershell
Invoke-RestMethod "http://localhost:3000/peaks?sortBy=nom&sortOrder=asc" | ConvertTo-Json -Depth 10
```

## 3) Proves de GET /peaks/:id

### 3.1 Detall d'un cim existent

```powershell
Invoke-RestMethod "http://localhost:3000/peaks/cim_la_mola" | ConvertTo-Json -Depth 20
```

Comprovar:
- `peak.stats`
- `peak.routes` (i `points` ordenats)
- `peak.publications` (amb `author` i `stats`)

### 3.2 Un altre cim existent

```powershell
Invoke-RestMethod "http://localhost:3000/peaks/cim_pedraforca" | ConvertTo-Json -Depth 20
```

### 3.3 Cim inexistent (404)

```powershell
try {
  Invoke-RestMethod "http://localhost:3000/peaks/id_inexistent" -ErrorAction Stop
} catch {
  $_.ErrorDetails.Message
}
```

Esperat:
- `status = 404`
- `code = PEAK_NOT_FOUND`

## 4) Proves d'errors de validacio (400)

### 4.1 sortBy invalid

```powershell
try {
  Invoke-RestMethod "http://localhost:3000/peaks?sortBy=random" -ErrorAction Stop
} catch {
  $_.ErrorDetails.Message
}
```

Esperat:
- `status = 400`
- `code = INVALID_QUERY_PARAMS`

### 4.2 minAlcada invalida

```powershell
try {
  Invoke-RestMethod "http://localhost:3000/peaks?minAlcada=abc" -ErrorAction Stop
} catch {
  $_.ErrorDetails.Message
}
```

Esperat:
- `status = 400`
- `code = INVALID_QUERY_PARAMS`

## 5) Checklist final de validacio

- `GET /peaks` retorna cataleg resumit amb `peaks` i `stats`
- filtres i ordenacio funcionen
- `GET /peaks/:id` retorna `peak` ric amb `routes` i `publications`
- id inexistent retorna 404 `PEAK_NOT_FOUND`
- query invalida retorna 400 `INVALID_QUERY_PARAMS`
- no es retornen camps sensibles
- no es canvien rutes d'imatge a URL absoluta (es mantenen relatives)

## Resum final

El modul public de peaks queda preparat per alimentar:
- home amb llistat de cims
- cataleg/cerca de cims
- vista de detall rica (`PeakDetailView`) amb rutes i publicacions

Contracte JSON net, estable i coherent amb la resta del backend.
