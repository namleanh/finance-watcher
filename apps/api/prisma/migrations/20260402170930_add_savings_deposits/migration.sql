-- CreateTable
CREATE TABLE "savings_deposits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "deposit_amount" BIGINT NOT NULL,
    "term_months" INTEGER NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "deposit_date" DATE NOT NULL,
    "maturity_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_deposits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "savings_deposits" ADD CONSTRAINT "savings_deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
