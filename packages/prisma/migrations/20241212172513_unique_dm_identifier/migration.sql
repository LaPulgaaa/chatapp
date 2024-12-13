/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `DirectMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_hash_key" ON "DirectMessage"("hash");
