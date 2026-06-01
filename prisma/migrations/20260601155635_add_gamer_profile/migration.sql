-- CreateTable
CREATE TABLE "GamerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gamesPlaying" TEXT[],
    "gamesWanted" TEXT[],
    "weeklyHours" INTEGER,
    "schedule" TEXT[],
    "gameCategories" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamerProfile_userId_key" ON "GamerProfile"("userId");

-- AddForeignKey
ALTER TABLE "GamerProfile" ADD CONSTRAINT "GamerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
