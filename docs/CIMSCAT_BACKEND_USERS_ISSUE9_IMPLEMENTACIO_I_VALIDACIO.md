# CimsCat Backend Users Issue #9: Implementacio i Validacio

Document explicatiu de la implementacio del modul users del backend.

## Nomenclatura actualitzada (important)
- Likes: un usuari dona like a una publicacio.
- Saved: un usuari es guarda un cim.

Aixo implica que:
- `LikePublicacio` representa likes sobre publicacions.
- `SavedPeak` representa cims guardats.
- La ruta `GET /users/:id/saved` retorna cims guardats.

## Endpoints implementats
- `GET /users/:id`
- `PUT /users/:id`
- `GET /users/:id/publications`
- `GET /users/:id/saved`

## 1) GET /users/:id
Endpoint public de perfil basic.

Retorna camps segurs:
- `id`
- `nomUsuari`
- `nom`
- `cognom`
- `fotoPerfil`
- `createdAt`

No retorna:
- `mail`
- `contrasenyaHash`
- `rol`

## 2) PUT /users/:id
Endpoint protegit.

Regla d'autoritzacio:
- nomes el propietari (owner) pot editar el seu perfil.

Camps editables:
- `nom`
- `cognom`
- `nomUsuari`
- `fotoPerfil`

Errors principals:
- 400 per body invalid o camps no permesos
- 403 si no es owner
- 409 si `nomUsuari` ja existeix

## 3) GET /users/:id/publications
Endpoint public.

Retorna les publicacions de l'usuari ordenades per `dataActivitat desc`.
Per cada publicacio retorna resum de:
- publicacio
- cim
- author
- counts (`likesCount`, `commentsCount`, `imagesCount`)

## 4) GET /users/:id/saved
Endpoint protegit.

Regla d'autoritzacio:
- nomes el propietari pot consultar els seus cims guardats.

Nomenclatura i model:
- aquesta ruta usa `SavedPeak`.
- retorna cims guardats de l'usuari.

Ordenacio:
- `createdAt desc` de `SavedPeak`.

Format retornat per cada element:
- `savedAt`
- `peak` amb:
  - `id`
  - `nom`
  - `alcada`
  - `comarca`
  - `massis`
  - `imatgeUrl`
  - `dificultat`
  - `lat`
  - `lon`
  - `zonaProtegida`

## Proves manuals (resum)

## 0) Prerequisits

```powershell
node -v
npm -v  (npm.cmd -v desde el portatil de dxc)
docker --version
docker compose version
```

## 1) Arrencar base de dades i backend

```powershell
cd backend
Copy-Item .env.example .env -Force
docker compose up -d
npm install (npm.cmd install desde el portatil de dxc)
npm run prisma:generate ($env:NODE_TLS_REJECT_UNAUTHORIZED="0" i desrpés npm.cmd run prisma:generate desde el portatil de dxc)
npm run prisma:migrate (npm.cmd run prisma:migrate desde el portatil de dxc)
npm run seed (npm.cmd run seed desde el portatil de dxc)
npm run dev (npm.cmd run dev desde el portatil de dxc)
```

Resultat esperat:
- backend escoltant a `http://localhost:3000`
- health operatiu

Prova health:

```powershell
Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json
```

## Proves manuals amb Thunder Client

## 2) Crear collection i entorn a Thunder Client

1. Obre Thunder Client a VS Code.
2. Crea una collection nova: `Users Issue 9`.
3. Crea una environment nova: `local-users-tests`.
4. Afegeix variables d'entorn:
   - `BASE_URL = http://localhost:3000`
   - `OWNER_ID = usr_daliajordan`
   - `OTHER_ID = usr_mireiagibert`
   - `MISSING_ID = usr_no_existeix`
   - `TOKEN_OWNER =` (buit)
   - `TOKEN_OTHER =` (buit)

## 3) Requests de login (per obtenir tokens)

## Request 01 - Login owner
- Method: `POST`
- URL: `{{BASE_URL}}/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "mail": "dalia@cimscat.cat",
  "contrasenya": "123456"
}
```

Accio:
- Executa request i copia el token de la resposta.
- Guarda'l a la variable `TOKEN_OWNER` de l'environment.

## Request 02 - Login other user
- Method: `POST`
- URL: `{{BASE_URL}}/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "mail": "mireia@cimscat.cat",
  "contrasenya": "123456"
}
```

Accio:
- Executa request i copia el token.
- Guarda'l a `TOKEN_OTHER`.

## 4) Requests de validacio d'endpoints users

## Request 03 - GET profile OK
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}`

Validar:
- status `200`
- `ok: true`
- existeixen `id`, `nomUsuari`, `nom`, `cognom`, `fotoPerfil`, `createdAt`
- no existeixen `mail`, `contrasenyaHash`

## Request 04 - GET profile user missing
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{MISSING_ID}}`

Validar:
- status `404`
- `error.code = USER_NOT_FOUND`

## Request 05 - GET publications OK
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/publications`

Validar:
- status `200`
- `ok: true`
- `count` numeric
- cada item de `publications` conte `counts.likesCount`, `counts.commentsCount`, `counts.imagesCount`
- les publicacions estan ordenades per `dataActivitat desc` (comprovar visualment les primeres dates)

## Request 06 - GET publications user missing
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{MISSING_ID}}/publications`

Validar:
- status `404`
- `error.code = USER_NOT_FOUND`

## Request 07 - GET saved without token
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/saved`
- Headers: cap `Authorization`

Validar:
- status `401`
- codi d'error d'autenticacio (`AUTH_TOKEN_MISSING` o equivalent)

## Request 08 - GET saved owner OK
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/saved`
- Headers:
  - `Authorization: Bearer {{TOKEN_OWNER}}`

Validar:
- status `200`
- `ok: true`
- `saved[]` amb `savedAt` i `peak`

## Request 09 - GET saved not owner
- Method: `GET`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}/saved`
- Headers:
  - `Authorization: Bearer {{TOKEN_OTHER}}`

Validar:
- status `403`
- `error.code = FORBIDDEN_NOT_OWNER`

## Request 10 - PUT profile owner OK
- Method: `PUT`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}`
- Headers:
  - `Authorization: Bearer {{TOKEN_OWNER}}`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "nom": "Dalia QA"
}
```

Validar:
- status `200`
- `ok: true`

## Request 11 - PUT profile validation error
- Method: `PUT`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}`
- Headers:
  - `Authorization: Bearer {{TOKEN_OWNER}}`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "rol": "admin"
}
```

Validar:
- status `400`
- `error.code = VALIDATION_ERROR`

## Request 12 - PUT profile not owner
- Method: `PUT`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}`
- Headers:
  - `Authorization: Bearer {{TOKEN_OTHER}}`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "nom": "No Permes"
}
```

Validar:
- status `403`
- `error.code = FORBIDDEN_NOT_OWNER`

## Request 13 - PUT profile rollback (opcional)
- Method: `PUT`
- URL: `{{BASE_URL}}/users/{{OWNER_ID}}`
- Headers:
  - `Authorization: Bearer {{TOKEN_OWNER}}`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "nom": "Dalia"
}
```

## 5) Mini checklist de validacio final

Si tot esta be, has de tenir:
- GET perfil: `200` i sense camps sensibles
- GET publications: `200` i ordre desc per data
- GET saved sense token: `401`
- GET saved owner: `200`
- GET saved no owner: `403`
- PUT owner: `200`
- PUT no owner: `403`
- PUT body invalid: `400`

## Checklist final
- Likes associats a publicacions.
- Saved associat a cims.
- Favorite de publicacio tractat com a like (mateix concepte).
- `/users/:id/saved` retorna cims guardats via `SavedPeak`.
- Respostes i errors mantenen format homogeni del backend.
