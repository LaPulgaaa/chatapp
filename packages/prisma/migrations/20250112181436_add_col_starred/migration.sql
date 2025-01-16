/*
  Warnings:

  - The `starred` column on the `DirectMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "starred",
ADD COLUMN     "starred" TEXT[];
