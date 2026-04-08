/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `portfolio_assets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transaction_id]` on the table `savings_deposits` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "portfolio_assets" ADD COLUMN     "transaction_id" TEXT,
ADD COLUMN     "wallet_id" TEXT;

-- AlterTable
ALTER TABLE "savings_deposits" ADD COLUMN     "transaction_id" TEXT,
ADD COLUMN     "wallet_id" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "goal_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_assets_transaction_id_key" ON "portfolio_assets"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "savings_deposits_transaction_id_key" ON "savings_deposits"("transaction_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "savings_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_assets" ADD CONSTRAINT "portfolio_assets_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_assets" ADD CONSTRAINT "portfolio_assets_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_deposits" ADD CONSTRAINT "savings_deposits_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_deposits" ADD CONSTRAINT "savings_deposits_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
