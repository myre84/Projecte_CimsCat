# CimsCat Backend Auth Logout i Users Likes: Implementacio i Validacio

Document explicatiu del que s ha implementat al backend en aquesta fase, amb focus en:
- `POST /auth/logout`
- `GET /users/:id/likes`

S ha mantingut el mateix estil del projecte:
- Express + CommonJS
- Arquitectura per moduls (`routes`, `controller`, `service`, `validators`)
- Prisma sense canvis de schema
- `sendError` i `createAppError` per format d errors consistent

## Context tecnic

El backend ja tenia implementat:
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Users: `GET /users/:id`, `PUT /users/:id`, `GET /users/:id/publications`, `GET /users/:id/saved`
- Middleware `requireAuth` per rutes protegides
- JWT stateless amb expiracio de 7 dies
- Model `LikePublicacio`

Sobre aquesta base, s han afegit nomes els dos punts demanats sense refactoritzacions grans.

## Canvis implementats

### 1) Logout

Endpoint nou:
- `POST /auth/logout`

Comportament:
- Ruta protegida amb `requireAuth`
- Si el token es valid: retorna `200`
- No modifica BD
- No crea blacklist
- No invalida el token al servidor (JWT stateless)
- Serveix com a senyal de logout perque client esborri token local

Resposta:

```json
{
  "ok": true,
  "message": "Logout correcte"
}
```

### 2) Users likes

Endpoint nou:
- `GET /users/:id/likes`

Comportament:
- Ruta protegida i owner only
- Valida `:id` amb `validateUserIdParam`
- Valida propietari amb `validateOwnerAccess(req.auth, userId)`
- Si no hi ha token o token invalid: `401`
- Si usuari autenticat diferent de `:id`: `403 FORBIDDEN_NOT_OWNER`
- Si usuari `:id` no existeix: `404 USER_NOT_FOUND`
- Si usuari existeix i no te likes: `200` amb `count: 0` i `likes: []`

IMPORTANT de negoci:
- La consulta surt de `LikePublicacio`
- Es filtra per `usuariId = :id`
- Retorna les publicacions a les quals aquell usuari ha donat like
- No retorna publicacions creades per autor `:id` (si no hi ha like)

## Arquitectura aplicada

### Auth
- `auth.routes.js`
  - ruta nova `POST /logout` protegida
- `auth.controller.js`
  - controller nou `logout`
  - format de resposta coherent amb la resta
- `auth.service.js`
  - servei nou `logoutUser(auth)`
  - validacio minima de context autenticat
  - sense persistencia

### Users
- `users.routes.js`
  - ruta nova `GET /:id/likes` protegida
  - ordre de rutes mantingut abans de `GET /:id`
- `users.controller.js`
  - controller nou `getUserLikedPublications`
  - flow: validar id -> validar owner -> cridar servei -> respondre
- `users.service.js`
  - servei nou `getOwnLikedPublicationsById(userId)`
  - `ensureUserExists(userId)`
  - consulta Prisma des de `likePublicacio`
  - map al contracte final

## Contracte JSON de `GET /users/:id/likes`

```json
{
  "ok": true,
  "message": "Likes recuperats correctament",
  "count": 2,
  "likes": [
    {
      "likedAt": "2026-03-23T10:00:00.000Z",
      "publication": {
        "id": "...",
        "titol": "...",
        "descripcio": "...",
        "dataActivitat": "...",
        "dificultat": "...",
        "distanciaKm": 12.4,
        "desnivellPosM": 900,
        "desnivellNegM": 900,
        "tempsMin": 320,
        "altitudMaxM": 2450,
        "altitudMinM": 1200,
        "portadaUrl": "...",
        "trackUrl": "...",
        "cim": {
          "id": "...",
          "nom": "...",
          "alcada": 2450,
          "comarca": "...",
          "massis": "...",
          "imatgeUrl": "..."
        },
        "author": {
          "id": "...",
          "nomUsuari": "...",
          "fotoPerfil": "..."
        },
        "counts": {
          "likesCount": 7,
          "commentsCount": 3,
          "imagesCount": 4
        }
      }
    }
  ]
}
```

## Com provar ho tu mateix

## 0) Prerequisits

```powershell
node -v
npm -v  (npm.cmd -v des del portatil de dxc)
docker --version
docker compose version
```

## 1) Arrencar backend

```powershell
cd backend
Copy-Item .env.example .env -Force
docker compose up -d
npm install (npm.cmd install des del portatil de dxc)
npm run prisma:generate (npm.cmd run prisma:generate)
npm run prisma:migrate (npm.cmd run prisma:migrate)
npm run seed (npm.cmd run seed)
npm run dev (npm.cmd run dev)
```

Resultat esperat:
- backend escoltant a `http://localhost:3000`
- health operatiu

Prova health:

```powershell
Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json
```

## 2) Proves amb Thunder Client (recomanat)

### 2.1 Environment
Crea environment `local-users-auth` amb:
- `BASE_URL = http://localhost:3000`
- `OWNER_ID = usr_daliajordan`
- `OTHER_ID = usr_mireiagibert`
- `MISSING_ID = usr_no_existeix`
- `TOKEN_OWNER =` (buit)
- `TOKEN_OTHER =` (buit)

### 2.2 Login owner
- Method: `POST`
- URL: `{{BASE_URL}}/auth/login`
- Body:

```json
{
  "mail": "dalia@cimscat.cat",
  "contrasenya": "123456"
}
```

Guarda token a `TOKEN_OWNER`.

### 2.3 Login other
- Method: `POST`
- URL: `{{BASE_URL}}/auth/login`
- Body:

```json
{
  "mail": "mireia@cimscat.cat",
  "contrasenya": "123456"
}
```

Guarda token a `TOKEN_OTHER`.

### 2.4 Prova logout

#### Cas OK
- Method: `POST`
- URL: `{{BASE_URL}}/auth/logout`
- Header: `Authorization: Bearer {{TOKEN_OWNER}}`

Esperat:
- `200`
- `ok: true`
- `message: Logout correcte`

#### Cas sense token
- Mateixa request sense header Authorization

Esperat:
- `401` (`AUTH_TOKEN_MISSING` o equivalent del middleware)

### 2.5 Prova users likes

#### Cas OK owner
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/likes`
- Header: `Authorization: Bearer {{TOKEN_OWNER}}`

Esperat:
- `200`
- `ok: true`
- `count` numeric
- `likes[]` amb `likedAt` i `publication`

#### Cas no owner
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/likes`
- Header: `Authorization: Bearer {{TOKEN_OTHER}}`

Esperat:
- `403`
- `error.code = FORBIDDEN_NOT_OWNER`

#### Cas user inexistent
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{MISSING_ID}}/likes`
- Header: `Authorization: Bearer {{TOKEN_OWNER}}`

Esperat:
- `404`
- `error.code = USER_NOT_FOUND`

#### Cas sense token
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/likes`

Esperat:
- `401`

## 3) Proves equivalents en curl

### Logout

```bash
curl -i -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer TOKEN_VALID"
```

### Likes owner

```bash
curl -i http://localhost:3000/users/usr_daliajordan/likes \
  -H "Authorization: Bearer TOKEN_OWNER"
```

### Likes no owner

```bash
curl -i http://localhost:3000/users/usr_daliajordan/likes \
  -H "Authorization: Bearer TOKEN_OTHER"
```

## Checklist final de validacio
- Logout amb token valid retorna `200` i `Logout correcte`
- Logout sense token retorna `401`
- `GET /users/:id/likes` owner retorna `200`
- `GET /users/:id/likes` no owner retorna `403`
- `GET /users/:id/likes` user inexistent retorna `404`
- `GET /users/:id/likes` retorna likes fets per aquell usuari
- `GET /users/:id/likes` no retorna publicacions per autor, nomes per relacio de like
