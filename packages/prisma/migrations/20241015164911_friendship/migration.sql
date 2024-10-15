-- CreateTable
CREATE TABLE "FriendShip" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "messageFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastmsgAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,

    CONSTRAINT "FriendShip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "friendshipId" TEXT NOT NULL,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendShip_fromId_toId_key" ON "FriendShip"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Member"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Member"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "FriendShip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
