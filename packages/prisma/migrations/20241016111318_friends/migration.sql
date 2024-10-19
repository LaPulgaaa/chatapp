/*
  Warnings:

  - Added the required column `connectionId` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectionId` to the `FriendShip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "connectionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FriendShip" ADD COLUMN     "connectionId" TEXT NOT NULL;
