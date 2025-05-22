/*
  Warnings:

  - A unique constraint covering the columns `[memberId,msgId]` on the table `StarredMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StarredMessage_memberId_msgId_key" ON "StarredMessage"("memberId", "msgId");
