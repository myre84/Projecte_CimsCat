# CimsCat backend - fixos d audit (saved peaks, uploads, logout i filtres)

## 1. Objectiu

Aquest document descriu els ajustos fets al backend per fer-lo coherent amb el que el frontend ja mostra o necessita:
- Persistencia de cims guardats (saved peaks).
- Upload real d imatge de perfil (fotoPerfil) amb fitxer, no base64.
- Contracte de logout stateless.
- Filtres de cerca a /peaks.
- Permisos owner/admin en edicio i eliminacio de publicacions.

## 2. Resum del que s ha implementat

- Endpoints per guardar, desar i consultar estat de cims guardats.
- Endpoint d upload per imatge de perfil a /uploads/users.
- Validacio per impedir data URLs (base64) a fotoPerfil.
- Filtres extra a /peaks: zonaProtegida i cerca per descripcio.
- Permisos admin per editar/eliminar publicacions.
- Revisio de logout: ja existia i es mantingut.

## 3. Endpoints de saved peaks

### POST /peaks/:id/saved (auth)
- Comportament: guarda el cim per l usuari autenticat.
- Idempotent: si ja esta guardat, no falla.
- Valida que el cim existeix.
- Resposta:
{
  "ok": true,
  "message": "Cim guardat correctament",
  "saved": true,
  "peakId": "cim_id",
  "userId": "usr_id"
}

### DELETE /peaks/:id/saved (auth)
- Comportament: elimina el guardat de l usuari.
- Idempotent: si no estava guardat, no falla.
- Valida que el cim existeix.
- Resposta:
{
  "ok": true,
  "message": "Cim desat eliminat correctament",
  "saved": false,
  "peakId": "cim_id",
  "userId": "usr_id"
}

### GET /peaks/:id/saved (auth)
- Comportament: retorna si el cim esta guardat per l usuari autenticat.
- Valida que el cim existeix.
- Resposta:
{
  "ok": true,
  "message": "Estat de guardat recuperat correctament",
  "saved": true
}

### GET /users/:id/saved (auth)
- Ja existia. Ara permet owner o admin.
- Retorna llista amb dades del cim per perfil.

## 4. Upload d imatge de perfil

### POST /uploads/users (auth)
- Accepta un fitxer d imatge.
- Camps acceptats: image, file, fotoPerfil, avatar.
- Tipus permesos: jpeg, jpg, png, webp, gif.
- Mida maxima: 10 MB (mateix limit que uploads de publicacions).
- Desa fitxer a: /uploads/users
- Resposta:
{
  "ok": true,
  "message": "Imatge de perfil pujada correctament",
  "file": {
    "filename": "...",
    "url": "/uploads/users/fitxer.webp"
  }
}

### Validacio de fotoPerfil
- A PUT /users/:id es rebutja un valor que comenci per data:.
- El frontend ha d enviar una ruta (ex: /uploads/users/fitxer.webp) o una URL valida.

## 5. Logout

- POST /auth/logout ja existia.
- Es un endpoint stateless: retorna exit i el frontend ha d esborrar el token localment.

## 6. Filtres /peaks

GET /peaks ara suporta:
- search: cerca per nom, comarca, massis i descripcio (case-insensitive).
- comarca
- dificultat
- massis
- zonaProtegida (nou)
- minAlcada / maxAlcada
- sortBy i sortOrder existents (nom, alcada, comarca, massis, createdAt).

Exemple:
GET /peaks?search=pedra&comarca=Bergueda&minAlcada=1000&maxAlcada=2500&zonaProtegida=Parc%20Natural

## 7. Permisos en publicacions

- PUT /publicacions/:id i DELETE /publicacions/:id ara admeten admin.
- Si no es owner ni admin, retorna FORBIDDEN_NOT_OWNER.
- La resta de logica (imatges, transaccions) es manté.

## 8. Fitxers modificats

- backend/src/modules/peaks/peaks.routes.js
- backend/src/modules/peaks/peaks.controller.js
- backend/src/modules/peaks/peaks.service.js
- backend/src/modules/peaks/peaks.validators.js
- backend/src/modules/uploads/uploads.routes.js
- backend/src/modules/uploads/uploads.controller.js
- backend/src/modules/uploads/uploads.service.js
- backend/src/modules/uploads/uploads.validators.js
- backend/src/modules/users/users.controller.js
- backend/src/modules/users/users.validators.js
- backend/src/modules/publicacions/publicacions.controller.js
- backend/src/modules/publicacions/publicacions.service.js

## 9. Proves manuals recomanades

1) Login per obtenir token
POST /auth/login
Body: { "mail": "dalia@cimscat.cat", "contrasenya": "123456" }

2) Guardar un cim
POST /peaks/:id/saved (Bearer token)

3) Consultar estat de guardat
GET /peaks/:id/saved (Bearer token)

4) Llistar cims guardats
GET /users/:id/saved (Bearer token)

5) Desar (unsave) un cim
DELETE /peaks/:id/saved (Bearer token)

6) Pujar foto perfil
POST /uploads/users (Bearer token, multipart)
Campo: image | file | fotoPerfil | avatar

7) Actualitzar perfil amb fotoPerfil
PUT /users/:id
Body: { "fotoPerfil": "/uploads/users/fitxer.webp" }

8) Logout
POST /auth/logout (Bearer token)

9) Filtres de cims
GET /peaks?search=pedra&minAlcada=1000

## 10. Notes

- No s ha afegit cap nova dependencia.
- Prisma validate no s ha pogut executar per restriccio de scripts a PowerShell (ExecutionPolicy).
- Les carpetes placeholder (favorites, gamification, posts, routesPlanner, savedPosts, search) només tenen .gitkeep; no s han eliminat.

Fi del document.
