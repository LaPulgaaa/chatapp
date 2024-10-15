/*
  Warnings:

  - You are about to drop the column `name` on the `FriendShip` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "senderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FriendShip" DROP COLUMN "name";

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
