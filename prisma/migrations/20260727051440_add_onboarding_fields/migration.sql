-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "monthly_income" DECIMAL(12,2),
ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payday_of_month" INTEGER;
