/*
  Warnings:

  - A unique constraint covering the columns `[username,password]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Member_username_password_key" ON "Member"("username", "password");
