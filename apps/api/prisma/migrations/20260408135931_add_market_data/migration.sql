-- CreateEnum
CREATE TYPE "market_data_type" AS ENUM ('CURRENCY', 'GOLD', 'STOCK');

-- CreateTable
CREATE TABLE "market_data" (
    "id" TEXT NOT NULL,
    "type" "market_data_type" NOT NULL,
    "symbol" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "change" DECIMAL(5,2),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_data_type_symbol_key" ON "market_data"("type", "symbol");
