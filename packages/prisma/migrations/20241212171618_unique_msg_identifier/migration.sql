/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Message_hash_key" ON "Message"("hash");
