-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('GENERAL', 'BUG', 'QUESTION', 'OTHER');

-- AlterTable
ALTER TABLE "Suggestion" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" VARCHAR(150),
    "message" VARCHAR(3000) NOT NULL,
    "category" "ContactCategory" NOT NULL DEFAULT 'GENERAL',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);
