/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `savings_deposits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "savings_deposits" DROP CONSTRAINT "savings_deposits_transaction_id_fkey";

-- DropIndex
DROP INDEX "savings_deposits_transaction_id_key";

-- AlterTable
ALTER TABLE "savings_deposits" DROP COLUMN "transaction_id";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "savings_deposit_id" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_savings_deposit_id_fkey" FOREIGN KEY ("savings_deposit_id") REFERENCES "savings_deposits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
