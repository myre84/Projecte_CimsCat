# CimsCat Backend: Nomenclatura d'Interaccions

Aquest document fixa la nomenclatura oficial de backend per evitar confusions de domini.

## Regles oficials

## 1) Likes (equivalent a "publicacio favorita")
- Concepte: un usuari dona like a una publicacio.
- Important: "Donar like a una publicacio" i "Publicacio favorita" son el mateix concepte funcional.
- Model Prisma: `LikePublicacio`.
- Camp relacional a `Publicacio`: `likes`.
- Camp comptador habitual en responses: `likesCount`.

Frase funcional recomanada:
- "Donar like a una publicacio"

## 2) Saved (cims)
- Concepte: un usuari es guarda un cim.
- Model Prisma: `SavedPeak`.
- Camp relacional a `Cim`: `savedByUsers`.
- Endpoint de consulta en modul users: `GET /users/:id/saved`.

Frase funcional recomanada:
- "Guardar-se un cim"
- "Cims guardats"

## Convencions de nom al codi
- Quan parlem de likes:
  - `likes`, `likesCount`, `LikePublicacio`
- Quan parlem de cims guardats:
  - `saved`, `savedPeaks`, `savedByUsers`, `SavedPeak`
- Evitar noms ambigus tipus:
  - `favorites` per parlar de cims
  - `saved` per parlar de publicacions
  - models separats per "favorites" de publicacions

## Notes per futures implementacions
- Si es crea modul de likes, ha d'operar sobre `Publicacio`.
- Si es crea modul de saved peaks, ha d'operar sobre `Cim` via `SavedPeak`.
- Mantenir aquesta nomenclatura en:
  - routes
  - controllers
  - services
  - validators
  - docs
