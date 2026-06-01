-- AlterEnum
ALTER TYPE "Game" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "gameLabel" TEXT;
