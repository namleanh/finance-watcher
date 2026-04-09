-- CreateTable
CREATE TABLE "user_market_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" "market_data_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_market_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_market_preferences_user_id_symbol_type_key" ON "user_market_preferences"("user_id", "symbol", "type");

-- AddForeignKey
ALTER TABLE "user_market_preferences" ADD CONSTRAINT "user_market_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
