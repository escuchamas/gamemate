-- CreateTable
CREATE TABLE "GameServer" (
    "id" TEXT NOT NULL,
    "game" "Game" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "ip" VARCHAR(200),
    "discordUrl" VARCHAR(300) NOT NULL,
    "websiteUrl" VARCHAR(300),
    "modded" BOOLEAN NOT NULL DEFAULT false,
    "modsNote" VARCHAR(300),
    "maxPlayers" INTEGER,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'es',
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "GameServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerVote" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServerVote_serverId_userId_date_key" ON "ServerVote"("serverId", "userId", "date");

-- AddForeignKey
ALTER TABLE "GameServer" ADD CONSTRAINT "GameServer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerVote" ADD CONSTRAINT "ServerVote_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "GameServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerVote" ADD CONSTRAINT "ServerVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
