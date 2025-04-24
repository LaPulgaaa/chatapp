/*
  Warnings:

  - You are about to drop the column `discription` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "discription",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';
