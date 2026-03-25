-- ============================================================
-- AFEGEIX CAMP OBLIGATORI tipusActivitat A Publicacio
-- ------------------------------------------------------------
-- Aquesta migracio alinea l'esquema SQL amb schema.prisma,
-- on Publicacio.tipusActivitat es obligatori.
--
-- Fem servir DEFAULT temporal per garantir compatibilitat amb
-- bases que puguin tenir files preexistents.
-- ============================================================

ALTER TABLE "Publicacio"
ADD COLUMN "tipusActivitat" TEXT NOT NULL DEFAULT 'senderisme';
