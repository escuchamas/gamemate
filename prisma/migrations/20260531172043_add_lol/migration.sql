-- CreateEnum
CREATE TYPE "LoLRole" AS ENUM ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT', 'FILL');

-- CreateEnum
CREATE TYPE "LoLRank" AS ENUM ('IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER');

-- AlterEnum
ALTER TYPE "Game" ADD VALUE 'LEAGUE_OF_LEGENDS';

-- AlterTable
ALTER TABLE "GameProfile" ADD COLUMN     "lolRank" "LoLRank",
ADD COLUMN     "lolRole" "LoLRole";

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "lolRankMax" "LoLRank",
ADD COLUMN     "lolRankMin" "LoLRank",
ADD COLUMN     "lolRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];
