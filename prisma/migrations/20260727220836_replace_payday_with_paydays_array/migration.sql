/*
  Warnings:

  - You are about to drop the column `payday` on the `income_sources` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "income_sources" DROP COLUMN "payday",
ADD COLUMN     "paydays" INTEGER[];
