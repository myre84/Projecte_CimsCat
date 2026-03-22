-- =====================================================================
-- MIGRACIO INICIAL DE CIMSCAT
-- ---------------------------------------------------------------------
-- Aquest fitxer SQL crea tota l'estructura inicial de la base de dades.
-- Prisma l'executa quan fem: npm run prisma:migrate
--
-- Que fa, a grans trets:
-- 1) Crear taules principals
-- 2) Crear indexos (per accelerar consultes)
-- 3) Afegir claus foranes (relacions entre taules)
--
-- Nota important:
-- L'ordre es clau: primer objectes base, despres indexos, finalment FK.
-- =====================================================================

-- CreateTable
CREATE TABLE "Usuari" (
    "id" TEXT NOT NULL,
    "nomUsuari" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "cognom" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "contrasenyaHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuari',
    "fotoPerfil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cim" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "alcada" INTEGER NOT NULL,
    "comarca" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "dificultat" TEXT NOT NULL,
    "descripcio" TEXT NOT NULL,
    "imatgeUrl" TEXT,
    "massis" TEXT NOT NULL,
    "zonaProtegida" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RutaPlanificada" (
    "id" TEXT NOT NULL,
    "usuariId" TEXT NOT NULL,
    "cimId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "tipusActivitat" TEXT NOT NULL,
    "ritme" TEXT NOT NULL,
    "distanciaKm" DOUBLE PRECISION NOT NULL,
    "desnivellPosM" INTEGER NOT NULL,
    "desnivellNegM" INTEGER NOT NULL,
    "tempsMin" INTEGER NOT NULL,
    "altitudMaxM" INTEGER NOT NULL,
    "altitudMinM" INTEGER NOT NULL,
    "trackUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RutaPlanificada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publicacio" (
    "id" TEXT NOT NULL,
    "usuariId" TEXT NOT NULL,
    "cimId" TEXT NOT NULL,
    "rutaPlanificadaId" TEXT,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT NOT NULL,
    "dataActivitat" TIMESTAMP(3) NOT NULL,
    "dificultat" TEXT NOT NULL,
    "distanciaKm" DOUBLE PRECISION NOT NULL,
    "desnivellPosM" INTEGER NOT NULL,
    "desnivellNegM" INTEGER NOT NULL,
    "tempsMin" INTEGER NOT NULL,
    "altitudMaxM" INTEGER NOT NULL,
    "altitudMinM" INTEGER NOT NULL,
    "trackUrl" TEXT,
    "portadaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publicacio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImatgePublicacio" (
    "id" TEXT NOT NULL,
    "publicacioId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ordreIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImatgePublicacio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentari" (
    "id" TEXT NOT NULL,
    "publicacioId" TEXT NOT NULL,
    "usuariId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comentari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikePublicacio" (
    "usuariId" TEXT NOT NULL,
    "publicacioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikePublicacio_pkey" PRIMARY KEY ("usuariId", "publicacioId")
);

-- CreateTable
CREATE TABLE "SavedPeak" (
    "usuariId" TEXT NOT NULL,
    "cimId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPeak_pkey" PRIMARY KEY ("usuariId", "cimId")
);

-- CreateTable
CREATE TABLE "PuntRuta" (
    "id" TEXT NOT NULL,
    "rutaId" TEXT NOT NULL,
    "etiqueta" TEXT,
    "nomPunt" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "ordreIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PuntRuta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuari_nomUsuari_key" ON "Usuari"("nomUsuari");

-- CreateIndex
CREATE UNIQUE INDEX "Usuari_mail_key" ON "Usuari"("mail");

-- CreateIndex
CREATE INDEX "Usuari_mail_idx" ON "Usuari"("mail");

-- CreateIndex
CREATE INDEX "Usuari_nomUsuari_idx" ON "Usuari"("nomUsuari");

-- CreateIndex
CREATE INDEX "Cim_nom_idx" ON "Cim"("nom");

-- CreateIndex
CREATE INDEX "Cim_comarca_idx" ON "Cim"("comarca");

-- CreateIndex
CREATE INDEX "Cim_massis_idx" ON "Cim"("massis");

-- CreateIndex
CREATE INDEX "RutaPlanificada_usuariId_idx" ON "RutaPlanificada"("usuariId");

-- CreateIndex
CREATE INDEX "RutaPlanificada_cimId_idx" ON "RutaPlanificada"("cimId");

-- CreateIndex
CREATE INDEX "Publicacio_usuariId_idx" ON "Publicacio"("usuariId");

-- CreateIndex
CREATE INDEX "Publicacio_cimId_idx" ON "Publicacio"("cimId");

-- CreateIndex
CREATE INDEX "Publicacio_rutaPlanificadaId_idx" ON "Publicacio"("rutaPlanificadaId");

-- CreateIndex
CREATE INDEX "Publicacio_dataActivitat_idx" ON "Publicacio"("dataActivitat");

-- CreateIndex
CREATE INDEX "ImatgePublicacio_publicacioId_idx" ON "ImatgePublicacio"("publicacioId");

-- CreateIndex
CREATE INDEX "Comentari_publicacioId_idx" ON "Comentari"("publicacioId");

-- CreateIndex
CREATE INDEX "Comentari_usuariId_idx" ON "Comentari"("usuariId");

-- CreateIndex
CREATE INDEX "LikePublicacio_publicacioId_idx" ON "LikePublicacio"("publicacioId");

-- CreateIndex
CREATE INDEX "SavedPeak_cimId_idx" ON "SavedPeak"("cimId");

-- CreateIndex
CREATE INDEX "PuntRuta_rutaId_idx" ON "PuntRuta"("rutaId");

-- CreateIndex
CREATE INDEX "PuntRuta_ordreIndex_idx" ON "PuntRuta"("ordreIndex");

-- AddForeignKey
ALTER TABLE "RutaPlanificada" ADD CONSTRAINT "RutaPlanificada_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RutaPlanificada" ADD CONSTRAINT "RutaPlanificada_cimId_fkey" FOREIGN KEY ("cimId") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacio" ADD CONSTRAINT "Publicacio_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacio" ADD CONSTRAINT "Publicacio_cimId_fkey" FOREIGN KEY ("cimId") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacio" ADD CONSTRAINT "Publicacio_rutaPlanificadaId_fkey" FOREIGN KEY ("rutaPlanificadaId") REFERENCES "RutaPlanificada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImatgePublicacio" ADD CONSTRAINT "ImatgePublicacio_publicacioId_fkey" FOREIGN KEY ("publicacioId") REFERENCES "Publicacio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentari" ADD CONSTRAINT "Comentari_publicacioId_fkey" FOREIGN KEY ("publicacioId") REFERENCES "Publicacio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentari" ADD CONSTRAINT "Comentari_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikePublicacio" ADD CONSTRAINT "LikePublicacio_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikePublicacio" ADD CONSTRAINT "LikePublicacio_publicacioId_fkey" FOREIGN KEY ("publicacioId") REFERENCES "Publicacio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPeak" ADD CONSTRAINT "SavedPeak_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPeak" ADD CONSTRAINT "SavedPeak_cimId_fkey" FOREIGN KEY ("cimId") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntRuta" ADD CONSTRAINT "PuntRuta_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "RutaPlanificada"("id") ON DELETE CASCADE ON UPDATE CASCADE;
