-- Fitxa tecnica ampliada dels cims.
ALTER TABLE "Cim" ADD COLUMN "situacioAdministrativa" TEXT;
ALTER TABLE "Cim" ADD COLUMN "accesPrincipal" TEXT;
ALTER TABLE "Cim" ADD COLUMN "puntPartida" TEXT;
ALTER TABLE "Cim" ADD COLUMN "rutaHabitual" TEXT;
ALTER TABLE "Cim" ADD COLUMN "distanciaHabitualKm" DOUBLE PRECISION;
ALTER TABLE "Cim" ADD COLUMN "desnivellHabitualM" INTEGER;
ALTER TABLE "Cim" ADD COLUMN "tempsHabitual" TEXT;
ALTER TABLE "Cim" ADD COLUMN "orientacio" TEXT;
ALTER TABLE "Cim" ADD COLUMN "tipusTerreny" TEXT;
ALTER TABLE "Cim" ADD COLUMN "puntClau" TEXT;
ALTER TABLE "Cim" ADD COLUMN "grauExposicio" TEXT;
