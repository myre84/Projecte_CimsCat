-- AlterTable
ALTER TABLE "Publicacio" ALTER COLUMN "tipusActivitat" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" INTEGER,
    "ruleKey" TEXT,
    "ruleValue" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengePeak" (
    "challengeId" TEXT NOT NULL,
    "cimId" TEXT NOT NULL,

    CONSTRAINT "ChallengePeak_pkey" PRIMARY KEY ("challengeId","cimId")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "iconUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "usuariId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("usuariId","badgeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");

-- CreateIndex
CREATE INDEX "Challenge_slug_idx" ON "Challenge"("slug");

-- CreateIndex
CREATE INDEX "Challenge_active_idx" ON "Challenge"("active");

-- CreateIndex
CREATE INDEX "ChallengePeak_cimId_idx" ON "ChallengePeak"("cimId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

-- CreateIndex
CREATE INDEX "Badge_code_idx" ON "Badge"("code");

-- CreateIndex
CREATE INDEX "Badge_active_idx" ON "Badge"("active");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- AddForeignKey
ALTER TABLE "ChallengePeak" ADD CONSTRAINT "ChallengePeak_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengePeak" ADD CONSTRAINT "ChallengePeak_cimId_fkey" FOREIGN KEY ("cimId") REFERENCES "Cim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_usuariId_fkey" FOREIGN KEY ("usuariId") REFERENCES "Usuari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
