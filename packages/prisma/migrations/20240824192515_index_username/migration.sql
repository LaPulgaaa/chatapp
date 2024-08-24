/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Member_username_password_key";

-- CreateIndex
CREATE INDEX "Member_username_idx" ON "Member"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Member_username_key" ON "Member"("username");
