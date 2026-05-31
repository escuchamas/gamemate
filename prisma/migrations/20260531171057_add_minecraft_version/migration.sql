-- CreateEnum
CREATE TYPE "MinecraftVersion" AS ENUM ('JAVA', 'BEDROCK', 'CONSOLE');

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "minecraftVersion" "MinecraftVersion";
