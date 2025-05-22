-- DropForeignKey
ALTER TABLE "StarredMessage" DROP CONSTRAINT "StarredMessage_memberId_fkey";

-- AddForeignKey
ALTER TABLE "StarredMessage" ADD CONSTRAINT "StarredMessage_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
