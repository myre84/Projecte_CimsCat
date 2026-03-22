# CimsCat Backend Auth: Implementacio i Validacio

Document explicatiu del que s'ha implementat al backend fins ara, amb focus en el sistema d'autenticacio.

## Que inclou el backend ara mateix
- Servidor Express funcional amb middlewares basics.
- Ruta publica de salut `GET /health`.
- Prisma connectat a PostgreSQL.
- Schema complet del domini CimsCat.
- Migracio inicial SQL.
- Seed de dades realistes.
- Carpeta d'uploads servida en mode estatic (`/uploads`).
- Sistema complet d'autenticacio JWT:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - Middleware `requireAuth`

## Estructura rellevant de fitxers
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/lib/prisma.js`
- `backend/src/routes/health.routes.js`
- `backend/src/common/utils/http-error.js`
- `backend/src/common/utils/jwt.js`
- `backend/src/common/utils/password.js`
- `backend/src/common/middlewares/auth.middleware.js`
- `backend/src/modules/auth/auth.routes.js`
- `backend/src/modules/auth/auth.controller.js`
- `backend/src/modules/auth/auth.service.js`
- `backend/src/modules/auth/auth.validators.js`
- `backend/schema.prisma`
- `backend/migrations/20260315000000_init/migration.sql`
- `backend/prisma/seed.js`

## Com funciona l'autenticacio internament

### 1) Flux de registre (`POST /auth/register`)
1. Arriba el body al controller.
2. `auth.validators.js` valida i normalitza:
   - `mail` a minuscules
   - `nomUsuari` a minuscules
   - regex de username
   - regex de contrasenya
3. `auth.service.js` comprova si ja existeix `mail` o `nomUsuari`.
4. Si no existeixen, hasheja contrasenya amb bcrypt (salt rounds 10).
5. Crea usuari amb Prisma (`rol: 'usuari'`).
6. Genera JWT amb expiracio de 7 dies.
7. Retorna `ok`, `message`, `token` i `user` net (sense `contrasenyaHash`).

### 2) Flux de login (`POST /auth/login`)
1. Es valida body (`mail`, `contrasenya`).
2. Es busca usuari nomes per `mail`.
3. Es compara contrasenya (`bcrypt.compare`).
4. Si falla usuari o contrasenya, retorna `401 INVALID_CREDENTIALS`.
5. Si es correcte, genera token de 7 dies i retorna usuari net.

### 3) Flux de ruta privada (`GET /auth/me`)
1. La ruta passa per `requireAuth`.
2. El middleware comprova `Authorization: Bearer <token>`.
3. Verifica token amb `jsonwebtoken`.
4. Guarda payload a `req.auth`.
5. El controller crida servei per buscar l'usuari actual per `id`.
6. Retorna `ok`, `message`, `user` net.

## Estrategia d'errors implementada
Format consistent:
```json
{
  "ok": false,
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Missatge clar"
  }
}
```

Codis que ja estem utilitzant:
- `MISSING_REQUIRED_FIELDS`
- `INVALID_EMAIL`
- `INVALID_USERNAME`
- `INVALID_PASSWORD_FORMAT`
- `INVALID_CREDENTIALS`
- `AUTH_TOKEN_MISSING`
- `AUTH_TOKEN_INVALID`
- `EMAIL_ALREADY_EXISTS`
- `USERNAME_ALREADY_EXISTS`
- `USER_NOT_FOUND`

## Resum de decisions tecniques
- CommonJS a tots els fitxers (`require/module.exports`).
- Sense llibreries noves.
- `JWT_SECRET` obligatori per seguretat.
- Dades sensibles no s'envien al client.
- Tota la logica de negoci d'auth al service.
- Validacions pures separades a validators.
- Middleware auth reutilitzable per futures rutes privades.

## Com provar que tot funciona

### 0) Prerequisits
Executa:
```powershell
node -v
npm -v  (npm.cmd -v desde el portatil de dxc)
docker --version
docker compose version
```

### 1) Preparar backend i entorn
```powershell
cd backend
Copy-Item .env.example .env -Force
docker compose up -d
npm install (npm.cmd install desde el portatil de dxc)
```

Resultat esperat:
- PostgreSQL aixecat al contenidor.
- Dependencies instal.lades sense errors.

Si torna a sortir error TLS handshake timeout amb Docker Hub:
1. Reinicia Docker Desktop.
2. Fes `docker login`.
3. Prova `docker pull postgres:16-alpine`.
4. Torna a provar `docker compose up -d`.

### 2) Validar Prisma i estructura de BD
```powershell
npm run prisma:generate ($env:NODE_TLS_REJECT_UNAUTHORIZED="0" i desrpés npm.cmd run prisma:generate desde el portatil de dxc)
npm run prisma:migrate (npm.cmd run prisma:migrate desde el portatil de dxc)
npm run seed (npm.cmd run seed desde el portatil de dxc)
```

Resultat esperat:
- Prisma Client generat correctament.
- Migracions aplicades sense errors.
- Seed completat amb missatge final de resum.

### 3) Arrencar servidor backend
```powershell
npm run dev (npm.cmd run dev desde el portatil de dxc)
```

Resultat esperat:
- Log de servidor escoltant al port 3000 (o el que tinguis a PORT).

### 4) Provar endpoint de salut
Obre un segon terminal i executa:
```powershell
Invoke-RestMethod http://localhost:3000/health | ConvertTo-Json
```

Resultat esperat:
```json
{
  "ok": true,
  "message": "CimsCat backend running"
}
```

### 5) Proves d'autenticacio (Postman / Thunder Client)

#### 5.1 Registre correcte
`POST http://localhost:3000/auth/register`
```json
{
  "nom": "Laia",
  "cognom": "Roca",
  "nomUsuari": "laia.roca",
  "mail": "laia.roca@example.com",
  "contrasenya": "Password1",
  "fotoPerfil": null
}
```
Esperat: `201`, `ok: true`, `token`, `user`.

#### 5.2 Registre amb email duplicat
Torna a enviar mateix `mail`.
Esperat: `409`, `EMAIL_ALREADY_EXISTS`.

#### 5.3 Registre amb username invalid
`nomUsuari: "Laia Roca"`
Esperat: `400`, `INVALID_USERNAME`.

#### 5.4 Login correcte
`POST http://localhost:3000/auth/login`
```json
{
  "mail": "laia.roca@example.com",
  "contrasenya": "Password1"
}
```
Esperat: `200`, `token`, `user`.

#### 5.5 Login incorrecte
Mateix mail pero contrasenya incorrecta.
Esperat: `401`, `INVALID_CREDENTIALS`.

#### 5.6 Me amb token correcte
`GET http://localhost:3000/auth/me`
Header:
`Authorization: Bearer <token_del_login>`
Esperat: `200`, `ok: true`, `user`.

#### 5.7 Me sense token
Sense header Authorization.
Esperat: `401`, `AUTH_TOKEN_MISSING`.

### 6) Verificar dades seed a BD (opcional)
```powershell
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const d={usuaris:await p.usuari.count(),cims:await p.cim.count(),publicacions:await p.publicacio.count(),comentaris:await p.comentari.count()};console.log(d);})().finally(async()=>{await p.$disconnect()})"
```

## Checklist final de validacio
- `health` respon be.
- Pots registrar usuari nou.
- Pots fer login i rebre token.
- `/auth/me` funciona amb token i falla sense token.
- Errors 400/401/409 retornen format consistent.
- No es retorna mai `contrasenyaHash` al client.
