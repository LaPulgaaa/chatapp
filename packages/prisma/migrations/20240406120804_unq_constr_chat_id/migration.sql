/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `Directory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Directory_chat_id_key" ON "Directory"("chat_id");
