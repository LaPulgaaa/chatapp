/*
  Warnings:

  - A unique constraint covering the columns `[chat_id,userId]` on the table `Directory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Directory_chat_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Directory_chat_id_userId_key" ON "Directory"("chat_id", "userId");
