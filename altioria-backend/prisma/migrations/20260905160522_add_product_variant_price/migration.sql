-- CreateEnum
CREATE TYPE "ProductPriceType" AS ENUM ('FIXED', 'ON_REQUEST');

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "price_amount" DECIMAL(12,2),
ADD COLUMN     "price_currency" VARCHAR(3),
ADD COLUMN     "price_type" "ProductPriceType" NOT NULL DEFAULT 'ON_REQUEST';

ALTER TABLE "product_variants"
ADD CONSTRAINT "product_variants_price_consistency"
CHECK (
  (
    "price_type" = 'ON_REQUEST'
    AND "price_amount" IS NULL
    AND "price_currency" IS NULL
  )
  OR
  (
    "price_type" = 'FIXED'
    AND "price_amount" IS NOT NULL
    AND "price_amount" > 0
    AND "price_currency" ~ '^[A-Z]{3}$'
  )
);
