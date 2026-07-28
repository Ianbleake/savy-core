-- CreateTable (banks)
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "logo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banks_profile_id_idx" ON "banks"("profile_id");

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add bank_id column to accounts (nullable, CASH accounts have no bank)
ALTER TABLE "accounts" ADD COLUMN "bank_id" TEXT;

-- CreateIndex
CREATE INDEX "accounts_bank_id_idx" ON "accounts"("bank_id");
CREATE INDEX "accounts_profile_id_idx" ON "accounts"("profile_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add destination_account_id to income_sources (nullable first to handle existing rows)
ALTER TABLE "income_sources" ADD COLUMN "destination_account_id" TEXT;

-- Delete income sources that can't be backfilled (user confirmed no important data)
DELETE FROM "income_sources" WHERE "destination_account_id" IS NULL;

-- Make destination_account_id required
ALTER TABLE "income_sources" ALTER COLUMN "destination_account_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "income_sources" ADD CONSTRAINT "income_sources_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add account_id to savings_goals (nullable first to handle existing rows)
ALTER TABLE "savings_goals" ADD COLUMN "account_id" TEXT;

-- Delete savings goals that can't be backfilled
DELETE FROM "savings_goals" WHERE "account_id" IS NULL;

-- Make account_id required
ALTER TABLE "savings_goals" ALTER COLUMN "account_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "savings_goals_account_id_idx" ON "savings_goals"("account_id");

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;