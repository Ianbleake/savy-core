-- Add destination_account_id to transactions (nullable, for TRANSFER and PAYMENT)
ALTER TABLE "transactions" ADD COLUMN "destination_account_id" TEXT;

-- CreateIndex
CREATE INDEX "transactions_destination_account_id_idx" ON "transactions"("destination_account_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;