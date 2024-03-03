/*
  Warnings:

  - A unique constraint covering the columns `[memberId,chatId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Message_memberId_chatId_key" ON "Message"("memberId", "chatId");
