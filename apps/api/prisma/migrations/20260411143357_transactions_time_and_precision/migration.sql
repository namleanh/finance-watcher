/*
  Warnings:

  - You are about to alter the column `cost_basis` on the `portfolio_assets` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `current_price` on the `portfolio_assets` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `amount` on the `recurring_items` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `deposit_amount` on the `savings_deposits` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `target_amount` on the `savings_goals` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `current_amount` on the `savings_goals` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `original_amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.
  - You are about to alter the column `balance` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(20,8)`.

*/
-- AlterTable
ALTER TABLE "portfolio_assets" ALTER COLUMN "cost_basis" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "current_price" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "purchase_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "recurring_items" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "next_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "savings_deposits" ALTER COLUMN "deposit_amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "deposit_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "maturity_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "savings_goals" ALTER COLUMN "target_amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "current_amount" SET DEFAULT 0,
ALTER COLUMN "current_amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "deadline" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "original_amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(20,8);
