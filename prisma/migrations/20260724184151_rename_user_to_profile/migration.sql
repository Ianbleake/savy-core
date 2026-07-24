-- Rename users table to profiles
ALTER TABLE "users" RENAME TO "profiles";

-- Rename supabase_id to auth_id
ALTER TABLE "profiles" RENAME COLUMN "supabase_id" TO "auth_id";

-- Rename name to first_name (existing data becomes first_name)
ALTER TABLE "profiles" RENAME COLUMN "name" TO "first_name";

-- Add new columns
ALTER TABLE "profiles" ADD COLUMN "last_name" TEXT;
ALTER TABLE "profiles" ADD COLUMN "second_last_name" TEXT;
ALTER TABLE "profiles" ADD COLUMN "avatar_url" TEXT;
ALTER TABLE "profiles" ADD COLUMN "phone" TEXT;
ALTER TABLE "profiles" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'MXN';
ALTER TABLE "profiles" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'es-MX';
ALTER TABLE "profiles" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City';

-- Rename user_id to profile_id in related tables
ALTER TABLE "accounts" RENAME COLUMN "user_id" TO "profile_id";
ALTER TABLE "categories" RENAME COLUMN "user_id" TO "profile_id";
ALTER TABLE "budgets" RENAME COLUMN "user_id" TO "profile_id";
ALTER TABLE "savings_goals" RENAME COLUMN "user_id" TO "profile_id";

-- Update unique constraint on categories
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_user_id_name_type_key";
ALTER TABLE "categories" ADD CONSTRAINT "categories_profile_id_name_type_key" UNIQUE ("profile_id", "name", "type");

-- Update foreign key constraints
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_user_id_fkey";
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_user_id_fkey";
ALTER TABLE "categories" ADD CONSTRAINT "categories_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "budgets_user_id_fkey";
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "savings_goals" DROP CONSTRAINT IF EXISTS "savings_goals_user_id_fkey";
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename indexes on profiles (from users)
ALTER INDEX IF EXISTS "users_pkey" RENAME TO "profiles_pkey";
ALTER INDEX IF EXISTS "users_supabase_id_key" RENAME TO "profiles_auth_id_key";
ALTER INDEX IF EXISTS "users_email_key" RENAME TO "profiles_email_key";
