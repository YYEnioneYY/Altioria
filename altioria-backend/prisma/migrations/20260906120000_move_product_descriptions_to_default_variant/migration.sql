UPDATE "product_variants" AS variant
SET
  "description_ru" = COALESCE(
    variant."description_ru",
    product."description_ru"
  ),
  "description_en" = COALESCE(
    variant."description_en",
    product."description_en"
  ),
  "updated_at" = CURRENT_TIMESTAMP
FROM "products" AS product
WHERE variant."product_id" = product."id"
  AND variant."is_default" = TRUE;

ALTER TABLE "products"
DROP COLUMN "description_ru",
DROP COLUMN "description_en";
