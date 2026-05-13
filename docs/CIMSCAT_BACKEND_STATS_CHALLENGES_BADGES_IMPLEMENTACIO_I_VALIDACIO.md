# CIMSCAT BACKEND: STATS, CHALLENGES I BADGES - IMPLEMENTACIO I VALIDACIO

1. Objectiu de la fase

Aquest document descriu la implementacio al backend de les estadistiques d usuari, els reptes (challenges) i el sistema de badges. L objectiu es substituir la logica temporal que ara mateix esta al frontend per uns endpoints oficials i persistents al backend. D aquesta manera el frontend podra delegar el calcul a la API i mostrar resultats coherents per a tots els usuaris.

2. Decisions funcionals

- Una `Publicacio` compta com a cim completat per a reptes quan hi ha una publicacio amb `cimId` associat.
- `RutaPlanificada` no compta per a reptes.
- `SavedPeak` no compta per a reptes.
- Si un usuari publica varies activitats per el mateix cim, aquest cim nomes compta una vegada per a reptes (unicitat per `cimId`).
- Les activitats repetides sumen per a les estadistiques (km totals, desnivell, temps, nombre d activitats).
- Per a agrupacions temporals s usa `dataActivitat` (no `createdAt`).
- Les badges son enregistrades a `UserBadge` amb `unlockedAt` i un cop desbloquejades no s eliminen encara que l usuari esborri publicacions.

3. Models Prisma afegits

S han afegit els models seguents a `schema.prisma`:

- `Challenge`: defineix un repte (slug, nom, descripcio, tipus, targetValue, ruleKey, ruleValue, active)
- `ChallengePeak`: relacio many-to-many entre `Challenge` i `Cim` (clau composta)
- `Badge`: definicio de badge (code, nom, descripcio, categoria, iconUrl, active)
- `UserBadge`: registre d un badge desbloquejat per usuari amb `unlockedAt` i `source`

Relacions:
- `Usuari.badges: UserBadge[]`
- `Cim.challengePeaks: ChallengePeak[]`

4. Endpoints implementats

- GET /users/:id/stats
  - Què fa: retorna les estadistiques totals i històriques de l usuari.
  - Auth: PUBLIC
  - Exemple de resposta:
    {
      "ok": true,
      "message": "User stats retrieved successfully",
      "userId": "usr_daliajordan",
      "stats": { ... }
    }
  - Errors possibles:
    - 400 USER_ID_INVALID : parametre id invalid
    - 404 USER_NOT_FOUND : usuari no existent

- GET /users/:id/challenges
  - Què fa: retorna tots els reptes actius amb el progrés de l usuari.
  - Auth: PUBLIC
  - Exemple de resposta: veure especificacio de l issue (campos: id, slug, name, description, type, current, target, percent, completed, completedPeaks, remainingPeaksPreview)
  - Errors:
    - 400 USER_ID_INVALID
    - 404 USER_NOT_FOUND

- GET /users/:id/challenges/:slug
  - Què fa: retorna el detall i progrés d un sol repte actiu per l usuari.
  - Auth: PUBLIC
  - Errors:
    - 400 USER_ID_INVALID
    - 400 CHALLENGE_SLUG_INVALID
    - 404 USER_NOT_FOUND
    - 404 CHALLENGE_NOT_FOUND

- GET /users/:id/badges
  - Què fa: retorna totes les badges actives amb estat unlocked/unlockedAt segons `UserBadge`.
  - Auth: PUBLIC
  - Exemple de resposta: veure especificacio de l issue
  - Errors:
    - 400 USER_ID_INVALID
    - 404 USER_NOT_FOUND

5. Logica d estadistiques

- Es recuperen totes les files `Publicacio` de l usuari (where: usuariId) amb els camps necessaris.
- Totals:
  - `activitiesCount`: nombre total de publicacions
  - `totalKm`: suma de `distanciaKm`, arrodonida a una xifra decimal
  - `totalElevationGainM`: suma de `desnivellPosM` (int)
  - `totalTimeMin`: suma de `tempsMin` (int)
  - `uniquePeaksCount`: nombre de `cimId` distints entre les publicacions
- Agrupacions:
  - `byYear`: agrupat per any de `dataActivitat` (year), suma de km, desnivell, temps, counts i nombre de cims únics per any. Ordenat per any ascendent.
  - `byMonth`: agrupat per any+mes (year, month), mateixes sums. Ordenat per year asc, month asc.
  - `byActivityType`: agrupat per `tipusActivitat` amb sums i comptadors; ordenat alfabeticament per tipus.

Regles de format:
- `totalKm` i altres km s arrodoneixen a 1 decimal.
- Elevacio i temps son enters.
- Si l usuari no te publicacions, totals a 0 i arrays buits.

6. Logica de reptes

Tipus implementats:
- `STATIC_PEAK_LIST`: llista fixa de cims definida a `ChallengePeak`.
- `RULE` amb `ruleKey = MIN_ALTITUDE`: selecciona tots els cims amb `alcada >= ruleValue`.

Per cada repte:
- `current`: nombre de cims diferents del repte que l usuari ha completat (comprovant publicacions amb `cimId`).
- `target`: si `challenge.targetValue` present, s usa; altrament nombre de cims del repte (per STATIC) o nombre de cims que compleixen la regla (per RULE).
- `percent`: si target <= 0 -> 0, altrament Math.min(100, Math.round((current/target)*100)).
- `completed`: true si target > 0 i current >= target.
- `completedPeaks`: llista de cims completats per l usuari que formen part del repte. Cada entrada inclou `completedAt` = primera `dataActivitat` registrada per aquest usuari i cim.
- `remainingPeaksPreview`: els primers 10 cims del repte que l usuari encara no ha completat (campos basics: id, nom, alcada, comarca, massis).

Reptes inicials al seed:
- `100-cims-feec` (STATIC_PEAK_LIST) amb target 100 i unes quantes `ChallengePeak` manuals al seed.
- `3000s-pirineus` (RULE, MIN_ALTITUDE: 3000) que considera tots els cims del cataleg amb `alcada >= 3000`.

7. Logica de badges

- Les badges actives es defineixen a `Badge` i l estat d desbloqueig per usuari s emmagatzema a `UserBadge(usuariId, badgeId, unlockedAt)`.
- `getUserBadges(userId)`:
  - comprova existencia d usuari
  - llegeix totes les badges actives
  - llegeix `UserBadge` de l usuari i combina la info per retornar l estat `unlocked` i `unlockedAt` (o null)
- `evaluateAndAssignBadges(userId)`:
  - consulta `getUserStats` i `getUserChallenges` per obtenir les dades actuals de l usuari
  - aplica les condicions definides (veure llistat a continuacio)
  - crea `UserBadge` per a les badges que compleix i encara no te; es idempotent (no duplica)
  - en cas d error intern, la funcio lanca l error; quan es crida des d operacions critiques es fa en try/catch per no bloquejar l operacio principal

Condicions implementades (codis):
- `first_publication`: stats.totals.activitiesCount >= 1
- `first_peak`: stats.totals.uniquePeaksCount >= 1
- `ten_peaks`: stats.totals.uniquePeaksCount >= 10
- `hundred_feec`: challenge "100-cims-feec" current >= 100
- `first_3000`: challenge "3000s-pirineus" current >= 1
- `three_3000`: challenge "3000s-pirineus" current >= 3
- `hundred_km`: stats.totals.totalKm >= 100
- `thousand_elevation`: stats.totals.totalElevationGainM >= 1000
- `five_comarques`: usuari ha completat cims en >= 5 comarques diferents

8. Seed

S han introduit els canvis seguents al `backend/prisma/seed.js`:
- s han afegit cims de prova de +3000 metres: `cim_aneto`, `cim_posets`, `cim_monte_perdido`, `cim_vignemale`, `cim_pica_d_estats`.
- s han upsertat els reptes inicials `100-cims-feec` i `3000s-pirineus`.
- s han upsertat les badges definides a l especificacio.
- s han creat manualment `ChallengePeak` per la mostra de `100-cims-feec` sobre cims existents (si algun cim no existeix, el seed ignora la fila per ser idempotent).

9. Guia de proves manuals amb Thunder Client o Postman

Pas 0: arrencar la BD i aplicar migracions i seed (veure apartat Testing a continuacio).

- Login (si cal obtenir token):
  POST http://localhost:3000/auth/login
  Body: { "mail": "dalia@cimscat.cat", "contrasenya": "123456" }

- Create publication (exemple):
  POST http://localhost:3000/publicacions
  Headers: Authorization: Bearer <USER_TOKEN>
  Body: seguir el contracte existent de creacio de publicacio (titol, descripcio, cimId, dataActivitat, distanciaKm, desnivellPosM, tempsMin, imageUrls [...])

- Get stats:
  GET http://localhost:3000/users/usr_daliajordan/stats

- Get challenges:
  GET http://localhost:3000/users/usr_daliajordan/challenges

- Get challenge detail:
  GET http://localhost:3000/users/usr_daliajordan/challenges/100-cims-feec

- Get badges:
  GET http://localhost:3000/users/usr_daliajordan/badges

Manual verificacio de badge automatic després de publicar:
1) POST crea publicacio (veure exemple)
2) GET /users/USER_ID/badges -> veure que la badge que compleixi condicio apareix amb `unlocked: true` i `unlockedAt`.

10. Connexio futura amb el frontend

Actualment el frontend fa un calcul local temporal a:
- `frontend/src/composables/useProfileAwards.js`
- `frontend/src/views/ProfileView.vue`
- `frontend/src/views/ForeignProfileView.vue`

Quan backend estigui activat, el frontend ha de substituir la logica local per cridar aquests endpoints:

const statsResponse = await api.get(`/users/${userId}/stats`)
const challengesResponse = await api.get(`/users/${userId}/challenges`)
const badgesResponse = await api.get(`/users/${userId}/badges`)

Com mappejar dades al UI:
- `stats.totals` i `stats.byMonth` poden alimentar els components `ProfileStatsBanner` i grafs històrics.
- `challenges[]` pot alimentar components tipo `AwardDonutCard` amb `current`, `target`, `percent`, `completedPeaks`.
- `badges[]` pot alimentar `BadgeGrid` amb `unlocked` i `unlockedAt`.
- L atribut `hasTemporaryDefinitions` del frontend pot eliminar-se un cop s usi el backend.
- Les capçaleres o textos que indiquen "awards are temporary" s han de treure.
- El frontend no ha de decidir mai si una badge esta desbloquejada; el backend es la font de veritat.

Proposta de composable futur (esquema):

export function useProfileAwardsFromBackend(userIdRef) {
  // fetch /users/:id/stats
  // fetch /users/:id/challenges
  // fetch /users/:id/badges
  // expose stats, challenges, badges, isLoading, errorMessage
}

11. Fitxers creats i modificats

S han creat/afectat els seguents fitxers:

- backend/schema.prisma (models Challenge, ChallengePeak, Badge, UserBadge afegits)
- backend/prisma/seed.js (cims 3000m, upsert challenges, badges, challengePeak rows)
- backend/src/modules/stats/stats.routes.js
- backend/src/modules/stats/stats.controller.js
- backend/src/modules/stats/stats.service.js
- backend/src/modules/stats/stats.validators.js
- backend/src/modules/challenges/challenges.routes.js
- backend/src/modules/challenges/challenges.controller.js
- backend/src/modules/challenges/challenges.service.js
- backend/src/modules/challenges/challenges.validators.js
- backend/src/modules/badges/badges.routes.js
- backend/src/modules/badges/badges.controller.js
- backend/src/modules/badges/badges.service.js
- backend/src/modules/badges/badges.validators.js
- backend/src/modules/publicacions/publicacions.service.js (s ha afegit crida a evaluateAndAssignBadges en crear publicacio)
- backend/src/app.js (s han muntat les rutes /users/* per stats, challenges i badges)
- docs/CIMSCAT_BACKEND_STATS_CHALLENGES_BADGES_IMPLEMENTACIO_I_VALIDACIO.md (aquest document)

12. Notes de manteniment

- Afegir una nova badge:
  1) Afegir fila a `Badge` (fer upsert al seed o crear via admin UI si existeix)
  2) Implementar condicio a `evaluateAndAssignBadges` (badges.service.js) o fer una condicio dinamica
  3) Executar `evaluateAndAssignBadges` per usuaris nous si cal (no hi ha endpoint admin per recalcular globalment per disseny)

- Afegir un nou repte static:
  1) Crear `Challenge` amb type `STATIC_PEAK_LIST` i crear `ChallengePeak` amb els cims que formen el repte (veure seed.js)
  2) El frontend llegira el repte i calculara progrés segun `GET /users/:id/challenges`

- Afegir un nou repte rule-based:
  1) Crear `Challenge` amb type `RULE`, escriure `ruleKey` i `ruleValue` (ex: MIN_ALTITUDE = 3000)
  2) El servei de reptes processara la regla i retornara el target calculat

- Afegir cims a 100 Cims FEEC en seed:
  1) Afegir o assegurar existencia del cim a `cims` del seed
  2) Afegir l id del cim a la llista `feecCimIds` dins del seed per generar `ChallengePeak`.


Testing i comandos per executar localment

cd backend
npm install
npx prisma generate
npx prisma migrate dev --name add_challenges_and_badges
node prisma/seed.js
npm run dev

Si es detecten errors de migracio o discrepancies (ex: column missing), revisar `backend/migrations` i assegurar que la versio del schema coincideix i que la base de dades es troba disponible a `DATABASE_URL`.


Fi del document.
