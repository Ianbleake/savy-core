/*
  Warnings:

  - You are about to drop the column `monthly_income` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `payday_of_month` on the `profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "IncomeFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "monthly_income",
DROP COLUMN "payday_of_month";

-- CreateTable
CREATE TABLE "income_sources" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "IncomeFrequency" NOT NULL,
    "payday" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "income_sources_profile_id_idx" ON "income_sources"("profile_id");

-- AddForeignKey
ALTER TABLE "income_sources" ADD CONSTRAINT "income_sources_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
