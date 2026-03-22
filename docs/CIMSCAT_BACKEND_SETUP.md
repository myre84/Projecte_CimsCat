# CimsCat Backend Setup

Document de referencia del backend de CimsCat amb Node.js, Express, Prisma i PostgreSQL.

## Nota sobre els comentaris del codi
- He comentat els fitxers clau amb estil didactic, pensat per a nivell inicial.
- Els comentaris segueixen l'ordre del fitxer (de dalt a baix) i expliquen el perque de cada bloc.
- On el format no admet comentaris natius (com JSON), he fet servir claus explicatives.

## Que s'ha deixat preparat fins ara
- Base de servidor Express funcional.
- Connexio a PostgreSQL via Prisma.
- Migracio inicial guardada a la carpeta `backend/migrations`.
- Seed complet amb dades reals de prova.
- Estructura d'uploads local per guardar arxius al backend.
- Politica de persistencia d'imatges: a la BD nomes es guarda la ruta.

## Estructura rellevant
- `backend/schema.prisma`: schema principal de Prisma.
- `backend/migrations`: migracions SQL de Prisma.
- `backend/prisma/seed.js`: seed amb dades de prova.
- `backend/uploads`: arxius pujats (imatges i temporals).

## Com funciona cada part

### 1) Arrencada del servidor
- `backend/src/server.js` carrega variables d'entorn amb dotenv.
- Llegeix `PORT` (si no existeix, usa 3000).
- Inicia l'app Express i deixa preparat un tancament net (SIGINT/SIGTERM).
- En tancar, desconecta Prisma per evitar connexions penjades.

### 2) Configuracio d'Express
- `backend/src/app.js` construeix l'app.
- Middleware base activat:
  - `cors()`
  - `express.json()`
- Exposa arxius locals via:
  - `app.use('/uploads', express.static(...))`
- Carrega la ruta de salut `GET /health`.

### 3) Client Prisma centralitzat
- `backend/src/lib/prisma.js` encapsula la instancia de `PrismaClient`.
- Evita crear multiples clients en entorn de desenvolupament.
- Facilita reutilitzar la mateixa connexio des de serveis/controladors.

## Politica d'uploads
- Les imatges es guarden al sistema de fitxers sota `backend/uploads`.
- A la base de dades nomes es guarda la ruta relativa publica, per exemple:
  - `/uploads/cims/la-mola.jpg`
  - `/uploads/publicacions/pedraforca-1.jpg`
  - `/uploads/usuaris/dalia.jpg`
- El backend exposa aquesta carpeta via estatics a `/uploads`.

### Estructura actual d'uploads
- `backend/uploads/cims`
- `backend/uploads/publicacions`
- `backend/uploads/usuaris`
- `backend/uploads/temp`

### Control de versionat d'uploads
- A `backend/.gitignore` s'ignoren els arxius reals pujats.
- Es mantenen `.gitkeep` per conservar l'estructura de carpetes al repositori.

## Prisma i base de dades

### Schema i migracions
- El fitxer canonical del model de dades es `backend/schema.prisma`.
- Les migracions SQL estan a `backend/migrations`.
- Els scripts de `package.json` ja apunten al schema amb `--schema ./schema.prisma`.

### Model de dades implementat
S'han modelat aquests dominis:
- Usuaris (`Usuari`)
- Cataleg de cims (`Cim`)
- Activitat social/publicacions (`Publicacio`, `ImatgePublicacio`, `Comentari`)
- Interaccions (`LikePublicacio`, `SavedPeak`)
- Planificacio de rutes (`RutaPlanificada`, `PuntRuta`)

Caracteristiques clau:
- IDs String amb `cuid()` als models principals.
- `createdAt` a tots els models.
- `updatedAt` als models editables principals.
- Claus compostes a likes i cims guardats.
- Relacions amb `onDelete` coherents (Cascade o SetNull segons el cas).

## Com funciona el seed
- Fitxer: `backend/prisma/seed.js`.
- El seed esborra dades en ordre segur (taules filles -> taules pare) per evitar errors de FK.
- Crea dades de prova realistes i relacionades entre si.
- Crea contrasenyes hash amb bcrypt (mai en pla).
- Carrega exemples complets per provar:
  - cims
  - usuaris
  - rutes planificades
  - punts de ruta
  - publicacions
  - imatges de publicacio
  - comentaris
  - likes
  - cims guardats

Important:
- Els camps d'imatge del seed usen rutes locals `/uploads/...`.
- Aquesta decisio mantindra backend i frontend desacoblats de URLs externes.

## Scripts disponibles i per a que serveixen
- `npm run dev`: arrenca servidor amb nodemon.
- `npm start`: arrenca servidor en mode normal.
- `npm run prisma:generate`: regenera Prisma Client.
- `npm run prisma:migrate`: crea/aplica migracions en desenvolupament.
- `npm run prisma:studio`: obre explorador visual de dades.
- `npm run seed`: executa la carrega de dades de prova.

## Flux operatiu recomanat quan hi ha canvis de model
1. Editar `backend/schema.prisma`.
2. Executar `npm run prisma:migrate`.
3. Executar `npm run prisma:generate` (si cal, tambe automatic en molts fluxos).
4. Ajustar `backend/prisma/seed.js` si han canviat camps/relacions.
5. Reexecutar `npm run seed` per tenir dades de prova coherents.

## Flux de dades resumit
1. Client crida endpoint.
2. Express rep la peticio i aplica middlewares.
3. El handler usa Prisma per llegir/escriure a PostgreSQL.
4. Si hi ha fitxers, es guarden a `backend/uploads/...`.
5. A la BD nomes queda la ruta `/uploads/...`.
6. Quan cal mostrar la imatge, el navegador la demana a la ruta estatica del backend.

## Posada en marxa

### 1) Instal.lar dependencies
```bash
cd backend
npm install
```

### 2) Configurar variables d'entorn
1. Copia `.env.example` a `.env`.
2. Revisa `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` i `PORT`.

### 3) Arrencar PostgreSQL local
```bash
docker compose up -d
```

### 4) Generar Prisma Client
```bash
npm run prisma:generate
```

### 5) Executar migracions
```bash
npm run prisma:migrate
```

### 6) Executar seed
```bash
npm run seed
```

### 7) Arrencar servidor
```bash
npm run dev
```

## Verificacions rapides recomanades
1. Health:
  - `GET http://localhost:3000/health`
2. Prisma Studio:
  - `npm run prisma:studio`
3. Comprovar que les rutes d'imatge a BD comencen per `/uploads/`.

## Proves detallades de validacio

### 1) Comprovar prerequisits locals
Executa:
```powershell
node -v
npm -v (npm.cmd -v desde el portatil de dxc)
docker --version
docker compose version
```

Resultat esperat:
- Totes les comandes retornen una versio valida.

### 2) Preparar backend i entorn
Executa:
```powershell
cd backend
Copy-Item .env.example .env -Force
docker compose up -d
npm install (npm.cmd install desde el portatil de dxc)
```

Resultat esperat:
- PostgreSQL aixecat al contenidor.
- Dependencies instal.lades sense errors.

### 3) Validar Prisma i estructura de BD
Executa:
```powershell
npm run prisma:generate ($env:NODE_TLS_REJECT_UNAUTHORIZED="0" i desrpés npm.cmd run prisma:generate)
npm run prisma:migrate (npm.cmd run prisma:migrate)
npm run seed (npm.cmd run seed)
```

Resultat esperat:
- Prisma Client generat correctament.
- Migracions aplicades sense errors.
- Seed completat amb missatge final de resum.

### 4) Arrencar servidor backend
Executa:
```powershell
npm run dev (npm.cmd run dev)
```

Resultat esperat:
- Log de servidor escoltant al port 3000 (o el que tinguis a PORT).

### 5) Provar endpoint de salut
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

### 6) Validar que el seed ha carregat totes les taules
Executa:
```powershell
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const d={usuaris:await p.usuari.count(),cims:await p.cim.count(),rutes:await p.rutaPlanificada.count(),punts:await p.puntRuta.count(),publicacions:await p.publicacio.count(),imatges:await p.imatgePublicacio.count(),comentaris:await p.comentari.count(),likes:await p.likePublicacio.count(),savedPeaks:await p.savedPeak.count()};console.log(d);const sample=await p.publicacio.findFirst({select:{portadaUrl:true}});console.log('samplePortadaUrl=',sample?.portadaUrl);})().catch(e=>{console.error(e);process.exit(1)}).finally(async()=>{await p.`$disconnect()})"
```

Resultat esperat aproximat:
- `usuaris: 3`
- `cims: 10`
- `rutes: 3`
- `punts: 10`
- `publicacions: 6`
- `imatges: 12`
- `comentaris: 10`
- `likes: 10`
- `savedPeaks: 9`
- `samplePortadaUrl` comencant per `/uploads/`

### 7) Validar servei d'arxius a /uploads
Executa:
```powershell
Set-Content -Path .\uploads\publicacions\prova.txt -Value "ok-upload"
Invoke-WebRequest http://localhost:3000/uploads/publicacions/prova.txt | Select-Object -ExpandProperty Content
```

Resultat esperat:
- La resposta retorna `ok-upload`.
- Confirma que el backend serveix fitxers locals correctament.

### 8) Validacio visual opcional amb Prisma Studio
Executa:
```powershell
npm run prisma:studio (npm.cmd run prisma:studio)
```

Resultat esperat:
- Pots inspeccionar dades, relacions i comprovar que els camps d'imatge son rutes locals.

## Si alguna prova falla
1. Comprova que PostgreSQL segueix aixecat: `docker ps`.
2. Revisa variables de `.env` (especialment `DATABASE_URL` i `PORT`).
3. Torna a executar en ordre:
   - `npm run prisma:migrate`
   - `npm run seed`
4. Revisa logs del servidor i del contenidor de postgres:
   - `docker compose logs postgres`

## Health check
Endpoint:
```http
GET /health
```

Resposta:
```json
{
  "ok": true,
  "message": "CimsCat backend running"
}
```
