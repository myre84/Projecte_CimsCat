# CimsCat Backend Publicacions + Uploads + Peaks Admin: Implementacio i Validacio

Document explicatiu de la implementacio backend feta en aquesta fase.

Aquest document segueix l'estil dels docs anteriors del projecte i cobreix:
- que s'ha afegit exactament
- com funciona internament cada part
- quins endpoints nous hi ha
- com provar tu mateix que tot funciona correctament

## Objectiu d'aquesta fase

En aquesta fase s'ha implementat el bloc gran de backend per completar:
- CRUD de publicacions
- upload real d'imatges per publicacions i cims
- endpoints admin per crear i editar cims
- nou camp obligatori `tipusActivitat` a `Publicacio`
- seed amb admin garantit per proves d'endpoints protegits

No s'ha tocat frontend.
No s'ha canviat el patro arquitectonic del backend (routes -> controller -> service -> validators).

## Que s'ha implementat

### 1) Modul d'uploads

Endpoints nous:
- `POST /uploads/publicacions` (auth obligatoria)
- `POST /uploads/peaks` (auth + admin obligatori)

Com funciona:
- S'utilitza `multer` en disk storage.
- Es creen carpetes locals si no existeixen:
  - `backend/uploads/publicacions`
  - `backend/uploads/peaks`
- Nomes s'accepten MIME d'imatge:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`
- Limit de mida: 10MB per fitxer.
- Noms de fitxer unics per evitar col.lisions.
- La resposta retorna URL publica relativa (`/uploads/...`).

Flux:
1. El client puja fitxer(s) via multipart/form-data.
2. El middleware valida auth/rol + tipus fitxer + mida.
3. El fitxer es desa a disc.
4. El controller retorna ruta publica reutilitzable al CRUD de publicacions o peaks.

### 2) CRUD de publicacions

Endpoints:
- `GET /publicacions` (public)
- `GET /publicacions/:id` (public)
- `POST /publicacions` (auth)
- `PUT /publicacions/:id` (auth + owner)
- `DELETE /publicacions/:id` (auth + owner)

Com funciona:
- Validacio estricta de body i query params al validator.
- Logica de negoci al service amb Prisma.
- Errors homogenis amb `createAppError` + `sendError`.
- En creacio, la publicacio ha de tenir minim 1 imatge.
- `portadaUrl` es calcula amb la primera imatge.
- En update:
  - es poden afegir imatges (`newImageUrls`)
  - es poden eliminar imatges (`deleteImageIds`)
  - es recalcula `ordreIndex`
  - es recalcula `portadaUrl`
  - s'esborren del disc les imatges eliminades
- En delete:
  - s'elimina la publicacio
  - s'eliminen fitxers d'imatges associats de forma segura

Regles funcionals importants:
- Nomes el propietari de la publicacio pot editar-la o esborrar-la.
- Si es referencia una ruta planificada, ha de ser del mateix usuari autenticat.
- Si es canvia `cimId`, el cim ha d'existir.

### 3) Peaks admin

Endpoints peaks ja existents i nous:
- `GET /peaks` (public)
- `GET /peaks/:id` (public)
- `POST /peaks` (auth + admin)
- `PUT /peaks/:id` (auth + admin)

Com funciona:
- S'ha creat middleware de rol `requireAdmin`.
- `POST` i `PUT` tenen validacio de body dedicada.
- `PUT` retorna 404 controlat si el cim no existeix.

### 4) Prisma schema i seed

Canvi de model:
- `Publicacio` te ara camp obligatori `tipusActivitat String`.

Canvis al seed:
- Les publicacions seed inclouen `tipusActivitat`.
- S'afegeix/garanteix un usuari admin estable via `upsert`:
  - mail: `admin@cimscat.local`
  - username: `admin`
  - password: `Admin12345`
  - rol: `admin`

## Fitxers principals afectats

### Nous fitxers
- `backend/src/common/middlewares/role.middleware.js`
- `backend/src/common/utils/upload-files.js`
- `backend/src/modules/uploads/uploads.routes.js`
- `backend/src/modules/uploads/uploads.controller.js`
- `backend/src/modules/uploads/uploads.service.js`
- `backend/src/modules/uploads/uploads.validators.js`
- `backend/src/modules/publicacions/publicacions.routes.js`
- `backend/src/modules/publicacions/publicacions.controller.js`
- `backend/src/modules/publicacions/publicacions.service.js`
- `backend/src/modules/publicacions/publicacions.validators.js`

### Fitxers modificats
- `backend/src/app.js`
- `backend/src/modules/peaks/peaks.routes.js`
- `backend/src/modules/peaks/peaks.controller.js`
- `backend/src/modules/peaks/peaks.service.js`
- `backend/src/modules/peaks/peaks.validators.js`
- `backend/schema.prisma`
- `backend/prisma/seed.js`
- `backend/package.json`

## Contracte dels endpoints nous

### POST /uploads/publicacions

Auth requerida: si
Rol admin: no
Content-Type: `multipart/form-data`
Camp de fitxers: `images` (fins a 10)

Resposta esperada (200):
```json
{
  "ok": true,
  "message": "Imatges de publicacio pujades correctament",
  "count": 2,
  "files": [
    {
      "filename": "1711111111111-123456789.jpg",
      "url": "/uploads/publicacions/1711111111111-123456789.jpg"
    }
  ]
}
```

### POST /uploads/peaks

Auth requerida: si
Rol admin: si
Content-Type: `multipart/form-data`
Camp de fitxer: `image` (1 fitxer)

Resposta esperada (200):
```json
{
  "ok": true,
  "message": "Imatge de peak pujada correctament",
  "file": {
    "filename": "1711111111111-987654321.jpg",
    "url": "/uploads/peaks/1711111111111-987654321.jpg"
  }
}
```

### POST /publicacions

Auth requerida: si

Body minim (exemple valid):
```json
{
  "cimId": "cim_la_mola",
  "titol": "Sortida de prova",
  "descripcio": "Prova publicacio backend",
  "tipusActivitat": "senderisme",
  "dataActivitat": "2026-03-20T08:00:00.000Z",
  "dificultat": "moderada",
  "distanciaKm": 10.5,
  "desnivellPosM": 620,
  "desnivellNegM": 620,
  "tempsMin": 240,
  "altitudMaxM": 1104,
  "altitudMinM": 760,
  "trackUrl": "https://tracks.exemple.local/ruta.gpx",
  "imageUrls": [
    "/uploads/publicacions/xxxx.jpg",
    "/uploads/publicacions/yyyy.jpg"
  ]
}
```

Resposta esperada (201):
- `ok: true`
- `message: Publicacio creada correctament`
- objecte `publication` amb detall complet

### PUT /publicacions/:id

Auth requerida: si
Owner requerida: si

Body d'exemple (actualitzacio parcial + gestio d'imatges):
```json
{
  "titol": "Sortida actualitzada",
  "tipusActivitat": "trail",
  "newImageUrls": [
    "/uploads/publicacions/nova-imatge.jpg"
  ],
  "deleteImageIds": [
    "img_publicacio_id_1"
  ]
}
```

Resposta esperada (200):
- `ok: true`
- `message: Publicacio actualitzada correctament`
- `publication` amb nova portada i ordre d'imatges actualitzat

### DELETE /publicacions/:id

Auth requerida: si
Owner requerida: si

Resposta esperada (200):
```json
{
  "ok": true,
  "message": "Publicacio eliminada correctament"
}
```

### POST /peaks (admin)

Auth requerida: si
Rol admin: si

Body minim valid:
```json
{
  "nom": "Cim de Prova",
  "alcada": 1999,
  "comarca": "Ripolles",
  "lat": 42.3,
  "lon": 2.1,
  "dificultat": "alta",
  "descripcio": "Descripcio prova",
  "imatgeUrl": "/uploads/peaks/imatge-prova.jpg",
  "massis": "Pirineu Oriental",
  "zonaProtegida": "Zona de prova"
}
```

Resposta esperada (201):
- `ok: true`
- `message: Cim creat correctament`
- `peak` amb camps creats

### PUT /peaks/:id (admin)

Auth requerida: si
Rol admin: si

Body d'exemple:
```json
{
  "descripcio": "Descripcio actualitzada",
  "imatgeUrl": "/uploads/peaks/imatge-actualitzada.jpg"
}
```

Resposta esperada (200):
- `ok: true`
- `message: Cim actualitzat correctament`
- `peak` actualitzat

## Com provar JO que tot funciona

## 0) Prerequisits

```powershell
node -v
npm -v
npm.cmd -v
```

Si tens la politica de PowerShell bloquejant scripts (`npm.ps1`), usa sempre `npm.cmd` i `npx.cmd`.

## 1) Preparar backend

```powershell
cd backend
Copy-Item .env.example .env -Force
npm.cmd install
```

## 2) Arrencar base de dades

Si uses Docker:
```powershell
docker compose up -d
```

## 3) Aplicar canvis Prisma i seed

Com que hi ha un camp nou obligatori (`tipusActivitat`), aplica migracio i seed:

```powershell
npx.cmd prisma migrate dev --schema ./schema.prisma --name add_tipus_activitat_publicacio
npm.cmd run prisma:generate
npm.cmd run seed
```

Resultat esperat:
- migracio aplicada sense errors
- prisma client generat
- seed completat amb resum final i admin de proves

## 4) Arrencar backend

```powershell
npm.cmd run dev
```

Prova salut:
```powershell
Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json
```

Esperat:
```json
{
  "ok": true,
  "message": "CimsCat backend running"
}
```

## 5) Proves d'autenticacio minima per obtenir tokens

### 5.1 Login admin de proves

`POST http://localhost:3000/auth/login`

```json
{
  "mail": "admin@cimscat.local",
  "contrasenya": "Admin12345"
}
```

Guarda el token com `ADMIN_TOKEN`.

### 5.2 Login usuari normal (seed)

`POST http://localhost:3000/auth/login`

```json
{
  "mail": "mireia@cimscat.cat",
  "contrasenya": "123456"
}
```

Guarda el token com `USER_TOKEN`.

## 6) Proves d'uploads

### 6.1 Upload publicacions (USER_TOKEN)

En Thunder Client/Postman:
- Method: `POST`
- URL: `http://localhost:3000/uploads/publicacions`
- Header: `Authorization: Bearer USER_TOKEN`
- Body: form-data
  - key `images` (File) -> afegeix 1..N imatges

Comprova:
- status `200`
- `files[].url` comenca per `/uploads/publicacions/`

### 6.2 Upload peaks (ADMIN_TOKEN)

- Method: `POST`
- URL: `http://localhost:3000/uploads/peaks`
- Header: `Authorization: Bearer ADMIN_TOKEN`
- Body: form-data
  - key `image` (File) -> 1 imatge

Comprova:
- status `200`
- `file.url` comenca per `/uploads/peaks/`

## 7) Proves de publicacions

### 7.1 Crear publicacio (USER_TOKEN)

1. Primer fes upload a `/uploads/publicacions` i copia 1 o 2 URLs.
2. Crida `POST /publicacions` amb JSON de l'exemple anterior.

Comprova:
- status `201`
- `publication.tipusActivitat` informat
- `publication.images` amb ordre
- `publication.portadaUrl` igual a la primera imatge

### 7.2 Llistar publicacions

`GET http://localhost:3000/publicacions`

Comprova:
- status `200`
- `count`
- `publications[]` amb `stats` i `images`

### 7.3 Filtre per tipusActivitat

`GET http://localhost:3000/publicacions?tipusActivitat=senderisme`

Comprova:
- status `200`
- resultats filtrats

### 7.4 Detall d'una publicacio

`GET http://localhost:3000/publicacions/{id}`

Comprova:
- `publication.author`
- `publication.peak`
- `publication.comments`
- `publication.likes`
- `publication.images`

### 7.5 Actualitzar publicacio (owner)

`PUT /publicacions/{id}` amb `USER_TOKEN`:
- canvia `titol` o `tipusActivitat`
- prova `newImageUrls`
- prova `deleteImageIds`

Comprova:
- status `200`
- reordenacio correcta (`ordreIndex`)
- `portadaUrl` actualitzada

### 7.6 Prova de seguretat owner

Intenta fer `PUT` o `DELETE` de la mateixa publicacio amb un token d'un altre usuari.

Comprova:
- status `403`
- codi funcional de no propietari

### 7.7 Esborrar publicacio (owner)

`DELETE /publicacions/{id}` amb `USER_TOKEN`.

Comprova:
- status `200`
- publicacio ja no apareix a `GET /publicacions`

## 8) Proves peaks admin

### 8.1 Crear cim amb admin

- Fes upload a `/uploads/peaks` per obtenir `imatgeUrl`.
- Crida `POST /peaks` amb `ADMIN_TOKEN` i body valid.

Comprova:
- status `201`
- cim creat

### 8.2 Crear cim amb usuari no admin

Mateixa crida pero amb `USER_TOKEN`.

Comprova:
- status `403`
- error `ADMIN_REQUIRED`

### 8.3 Actualitzar cim amb admin

`PUT /peaks/{id}` amb `ADMIN_TOKEN`.

Comprova:
- status `200`
- camps actualitzats

### 8.4 Actualitzar cim inexistent

`PUT /peaks/id_inexistent` amb `ADMIN_TOKEN`.

Comprova:
- status `404`
- error `PEAK_NOT_FOUND`

## 9) Checklist final de validacio

- `GET /health` respon correctament.
- Uploads de publicacions funcionen amb usuari autenticat.
- Upload de peaks nomes funciona amb admin.
- CRUD de publicacions funciona i respecta owner.
- Creacio/edicio admin de peaks funciona.
- `tipusActivitat` es guarda i es retorna a publicacions.
- El seed crea/actualitza l'admin `admin@cimscat.local`.
- Els errors retornen format coherent (`ok: false`, bloc `error`).

## Resum final

Amb aquesta fase, el backend queda preparat per donar suport complet a:
- publicacio d'activitats de muntanya amb imatges reals
- administracio del cataleg de cims des d'endpoints protegits
- proves manuals end-to-end des de client API (Thunder Client/Postman)

La implementacio manté el patró modular del projecte, CommonJS i consistencia d'errors/respostes.