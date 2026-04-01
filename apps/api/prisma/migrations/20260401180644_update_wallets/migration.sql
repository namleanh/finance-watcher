/*
  Warnings:

  - You are about to drop the column `is_auto_update` on the `portfolio_assets` table. All the data in the column will be lost.
  - You are about to drop the column `last_sync_at` on the `portfolio_assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "portfolio_assets" DROP COLUMN "is_auto_update",
DROP COLUMN "last_sync_at";
