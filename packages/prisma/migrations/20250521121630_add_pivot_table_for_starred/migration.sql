-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedFor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StarredMessage" (
    "id" SERIAL NOT NULL,
    "msgId" INTEGER NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "StarredMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StarredMessage" ADD CONSTRAINT "StarredMessage_msgId_fkey" FOREIGN KEY ("msgId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarredMessage" ADD CONSTRAINT "StarredMessage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
