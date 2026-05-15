-- ============================================================
-- AFEGEIX CAMP tipusRecorregut A RutaPlanificada
-- ------------------------------------------------------------
-- Aquesta migracio afegeix el camp tipusRecorregut a les rutes
-- planificades per alinear el backend amb el formulari.
-- ============================================================

ALTER TABLE "RutaPlanificada"
ADD COLUMN "tipusRecorregut" TEXT NOT NULL DEFAULT 'circular';
