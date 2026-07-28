-- Drop currentAmount and isCompleted from savings_goals (now computed from account.balance)
ALTER TABLE "savings_goals" DROP COLUMN IF EXISTS "current_amount";
ALTER TABLE "savings_goals" DROP COLUMN IF EXISTS "is_completed";