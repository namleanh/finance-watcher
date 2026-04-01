-- AlterTable
ALTER TABLE "portfolio_assets" ADD COLUMN     "is_auto_update" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_sync_at" TIMESTAMP(3);
