# CimsCat Backend Likes i Comments: Implementacio i Validacio

Document explicatiu de la implementacio backend del bloc social de likes i comentaris sobre publicacions.

Aquest document segueix el mateix estil dels docs backend existents i inclou:
- objectiu de la fase
- endpoints implementats
- regles funcionals i d'autoritzacio
- formats de resposta i errors
- guia de proves manuals amb Thunder Client/Postman

## Objectiu de la fase

Implementar al backend de CimsCat, de forma modular i coherent amb l'arquitectura existent:
- sistema de likes sobre publicacions
- sistema de comentaris sobre publicacions

Scope d'aquesta fase:
- si: endpoints nous de likes/comments i la seva logica de negoci
- si: documentacio tecnica i validacio manual
- no: frontend
- no: canvis de contracte als endpoints existents
- no: canvis de schema Prisma (no han estat necessaris)

## Endpoints implementats

### Likes
- `POST /publicacions/:id/likes`
- `DELETE /publicacions/:id/likes`

### Comentaris
- `GET /publicacions/:id/comments`
- `POST /publicacions/:id/comments`
- `DELETE /comments/:id`

## Arquitectura aplicada

S'ha mantingut el patro modular actual del projecte:
- `routes`
- `controller`
- `service`
- `validators`

Nous moduls creats:
- `backend/src/modules/likes/`
- `backend/src/modules/comments/`

Integracio de rutes:
- rutes nested de likes/comments dins `publicacions.routes.js`
- ruta global de delete comment a `comments.routes.js`, muntada sota `/comments` a `app.js`

## Fitxers creats i modificats

### Creats
- `backend/src/modules/likes/likes.controller.js`
- `backend/src/modules/likes/likes.service.js`
- `backend/src/modules/likes/likes.validators.js`
- `backend/src/modules/comments/comments.routes.js`
- `backend/src/modules/comments/comments.controller.js`
- `backend/src/modules/comments/comments.service.js`
- `backend/src/modules/comments/comments.validators.js`
- `docs/CIMSCAT_BACKEND_LIKES_I_COMMENTS_IMPLEMENTACIO_I_VALIDACIO.md`

### Modificats
- `backend/src/modules/publicacions/publicacions.routes.js`
- `backend/src/app.js`

## Funcionament detallat

## 1) Likes

### POST /publicacions/:id/likes

Auth requerida: si

Flux:
1. Valida `:id` de publicacio.
2. Comprova que la publicacio existeix.
3. Comprova si ja existeix like de l'usuari autenticat sobre aquesta publicacio.
4. Si existeix, retorna `409 LIKE_ALREADY_EXISTS`.
5. Si no existeix, crea like a `LikePublicacio`.
6. Retorna estat actual (`likedByMe: true`) i `likesCount` recalculat.

Resposta d'exit (exemple):
```json
{
  "ok": true,
  "message": "Like afegit correctament",
  "publicationId": "pub_lamola_sunrise",
  "likedByMe": true,
  "likesCount": 4
}
```

### DELETE /publicacions/:id/likes

Auth requerida: si

Flux:
1. Valida `:id` de publicacio.
2. Comprova que la publicacio existeix.
3. Comprova que existeix like de l'usuari autenticat.
4. Si no existeix, retorna `404 LIKE_NOT_FOUND`.
5. Si existeix, elimina like.
6. Retorna estat actual (`likedByMe: false`) i `likesCount` recalculat.

Resposta d'exit (exemple):
```json
{
  "ok": true,
  "message": "Like eliminat correctament",
  "publicationId": "pub_lamola_sunrise",
  "likedByMe": false,
  "likesCount": 3
}
```

Decisio funcional aplicada:
- no hi ha toggle implicit
- `POST` sempre intenta crear
- `DELETE` sempre intenta eliminar

## 2) Comentaris

### GET /publicacions/:id/comments

Auth requerida: no (public)

Flux:
1. Valida `:id` de publicacio.
2. Comprova que la publicacio existeix.
3. Recupera comentaris de la publicacio, ordenats `createdAt desc`.
4. Retorna llista completa sense paginacio.

Resposta d'exit (exemple):
```json
{
  "ok": true,
  "message": "Comentaris recuperats correctament",
  "count": 2,
  "comments": [
    {
      "id": "cmt_002",
      "text": "Ruta molt recomanable entre setmana, menys transit.",
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z",
      "author": {
        "id": "usr_danimoore",
        "nomUsuari": "danimoore",
        "nom": "Dani",
        "cognom": "Moore",
        "fotoPerfil": "/uploads/usuaris/dani.jpg"
      }
    }
  ]
}
```

### POST /publicacions/:id/comments

Auth requerida: si

Body esperat:
```json
{
  "text": "Comentari de prova"
}
```

Validacions de `text`:
- trim obligatori
- minim 1 caracter
- maxim 1000 caracters

Flux:
1. Valida `:id` de publicacio.
2. Comprova que la publicacio existeix.
3. Valida body (`text`).
4. Crea comentari amb:
   - `publicacioId = :id`
   - `usuariId = req.auth.userId`
   - `text` trimat
5. Retorna comentari creat + `commentsCount` actual.

Resposta d'exit (exemple):
```json
{
  "ok": true,
  "message": "Comentari creat correctament",
  "comment": {
    "id": "cm_xxxxx",
    "text": "Comentari de prova",
    "createdAt": "2026-04-13T09:00:00.000Z",
    "updatedAt": "2026-04-13T09:00:00.000Z",
    "author": {
      "id": "usr_mireiagibert",
      "nomUsuari": "mireiagibert",
      "nom": "Mireia",
      "cognom": "Gibert",
      "fotoPerfil": "/uploads/usuaris/mireia.jpg"
    }
  },
  "commentsCount": 4
}
```

### DELETE /comments/:id

Auth requerida: si

Regles d'autoritzacio:
- permès si l'usuari autenticat es propietari de la publicacio on pertany el comentari
- permès si l'usuari autenticat te `rol = admin`
- en qualsevol altre cas: `403 FORBIDDEN_COMMENT_DELETE`

IMPORTANT:
- l'autor del comentari no te permis automatic d'esborrat
- nomes propietari de la publicacio o admin

Flux:
1. Valida `:id` de comentari.
2. Comprova que el comentari existeix.
3. Carrega `publicacioId` i `publicacio.usuariId`.
4. Aplica regla d'autoritzacio.
5. Elimina comentari.
6. Retorna `commentsCount` actual de la publicacio afectada.

Resposta d'exit (exemple):
```json
{
  "ok": true,
  "message": "Comentari eliminat correctament",
  "commentId": "cmt_001",
  "publicationId": "pub_lamola_sunrise",
  "commentsCount": 3
}
```

## Errors principals

### Likes
- `400 PUBLICATION_ID_INVALID`
- `404 PUBLICATION_NOT_FOUND`
- `409 LIKE_ALREADY_EXISTS`
- `404 LIKE_NOT_FOUND`
- `401 AUTH_TOKEN_INVALID` (si context auth no valid)

### Comentaris
- `400 PUBLICATION_ID_INVALID`
- `400 COMMENT_ID_INVALID`
- `404 PUBLICATION_NOT_FOUND`
- `404 COMMENT_NOT_FOUND`
- `400 INVALID_BODY` (body invalid, text buit o llargada fora de rang)
- `403 FORBIDDEN_COMMENT_DELETE`
- `401 AUTH_TOKEN_INVALID` (si context auth no valid)

## Format general de resposta

Exit:
```json
{
  "ok": true,
  "message": "...",
  "...": "dades"
}
```

Error:
```json
{
  "ok": false,
  "error": {
    "status": 400,
    "code": "...",
    "message": "..."
  }
}
```

## Guia de proves manuals (Thunder Client / Postman)

## 0) Preparacio

```powershell
cd backend
Copy-Item .env.example .env -Force
npm.cmd install
# si uses Docker per la BD:
docker compose up -d
npm.cmd run prisma:generate
npm.cmd run prisma:migrate
npm.cmd run seed
npm.cmd run dev
```

## 1) Login per obtenir token

### Request A: login usuari normal
`POST http://localhost:3000/auth/login`

```json
{
  "mail": "mireia@cimscat.cat",
  "contrasenya": "123456"
}
```

Guarda token com `USER_TOKEN`.

### Request B: login admin
`POST http://localhost:3000/auth/login`

```json
{
  "mail": "admin@cimscat.local",
  "contrasenya": "Admin12345"
}
```

Guarda token com `ADMIN_TOKEN`.

## 2) Casos de prova Likes

### Cas 1: crear like correcte
- Method: `POST`
- URL: `http://localhost:3000/publicacions/pub_lamola_sunrise/likes`
- Header: `Authorization: Bearer USER_TOKEN`

Esperat:
- `200`
- `ok: true`
- `likedByMe: true`

### Cas 2: crear like duplicat
Torna a enviar exactament la mateixa peticio anterior.

Esperat:
- `409`
- `error.code = LIKE_ALREADY_EXISTS`

### Cas 3: eliminar like correcte
- Method: `DELETE`
- URL: `http://localhost:3000/publicacions/pub_lamola_sunrise/likes`
- Header: `Authorization: Bearer USER_TOKEN`

Esperat:
- `200`
- `ok: true`
- `likedByMe: false`

### Cas 4: eliminar like inexistent
Torna a enviar la mateixa peticio `DELETE` anterior.

Esperat:
- `404`
- `error.code = LIKE_NOT_FOUND`

## 3) Casos de prova Comentaris

### Cas 5: GET comments correcte
- Method: `GET`
- URL: `http://localhost:3000/publicacions/pub_lamola_sunrise/comments`

Esperat:
- `200`
- `ok: true`
- `comments` ordenats per `createdAt desc`

### Cas 6: POST comment correcte
- Method: `POST`
- URL: `http://localhost:3000/publicacions/pub_lamola_sunrise/comments`
- Header: `Authorization: Bearer USER_TOKEN`
- Body:

```json
{
  "text": "Comentari nou de prova"
}
```

Esperat:
- `201`
- `comment` amb `author`
- `commentsCount` actualitzat

Guarda `comment.id` per als casos de delete.

### Cas 7: POST comment invalid
- Method: `POST`
- URL: `http://localhost:3000/publicacions/pub_lamola_sunrise/comments`
- Header: `Authorization: Bearer USER_TOKEN`
- Body:

```json
{
  "text": "    "
}
```

Esperat:
- `400`
- `error.code = INVALID_BODY`

### Cas 8: DELETE comment com a autor de la publicacio
- Method: `DELETE`
- URL: `http://localhost:3000/comments/{COMMENT_ID}`
- Header: `Authorization: Bearer TOKEN_DEL_PROPIETARI_DE_LA_PUBLICACIO`

Esperat:
- `200`
- `ok: true`

### Cas 9: DELETE comment com a admin
- Method: `DELETE`
- URL: `http://localhost:3000/comments/{COMMENT_ID}`
- Header: `Authorization: Bearer ADMIN_TOKEN`

Esperat:
- `200`
- `ok: true`

### Cas 10: DELETE comment sense permisos
- Method: `DELETE`
- URL: `http://localhost:3000/comments/{COMMENT_ID}`
- Header: `Authorization: Bearer TOKEN_D_USUARI_QUE_NO_ES_NI_OWNER_NI_ADMIN`

Esperat:
- `403`
- `error.code = FORBIDDEN_COMMENT_DELETE`

## Checklist final de validacio

- `POST /publicacions/:id/likes` crea like i retorna `likedByMe: true`.
- Like duplicat retorna `409 LIKE_ALREADY_EXISTS`.
- `DELETE /publicacions/:id/likes` elimina like i retorna `likedByMe: false`.
- Eliminar like inexistent retorna `404 LIKE_NOT_FOUND`.
- `GET /publicacions/:id/comments` retorna llista completa ordenada desc.
- `POST /publicacions/:id/comments` crea comentari amb text validat (trim + rang).
- `POST` comentari invalid retorna `400 INVALID_BODY`.
- `DELETE /comments/:id` funciona per propietari de publicacio.
- `DELETE /comments/:id` funciona per admin.
- `DELETE /comments/:id` falla amb `403 FORBIDDEN_COMMENT_DELETE` quan no hi ha permisos.
- No s'ha modificat `GET /users/:id/likes` ni contractes existents de publicacions.
