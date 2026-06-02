-- CreateEnum
CREATE TYPE "PresentationStatus" AS ENUM ('WAITING', 'ACTIVE', 'ENDED');

-- CreateTable
CREATE TABLE "PresentationSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "PresentationStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresentationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentationParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresentationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PresentationSession_code_key" ON "PresentationSession"("code");

-- AddForeignKey
ALTER TABLE "PresentationParticipant" ADD CONSTRAINT "PresentationParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PresentationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
