-- CreateTable
CREATE TABLE "PuntInteresCim" (
    "id" TEXT NOT NULL,
    "cimId" TEXT NOT NULL,
    "tipus" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "descripcio" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "altitud" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuntInteresCim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PuntInteresCim_cimId_idx" ON "PuntInteresCim"("cimId");

-- CreateIndex
CREATE INDEX "PuntInteresCim_tipus_idx" ON "PuntInteresCim"("tipus");

-- AddForeignKey
ALTER TABLE "PuntInteresCim" ADD CONSTRAINT "PuntInteresCim_cimId_fkey" FOREIGN KEY ("cimId") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
