WITH "first_variants" AS (
  SELECT DISTINCT ON (variant."product_id")
    variant."id"
  FROM "product_variants" AS variant
  WHERE NOT EXISTS (
    SELECT 1
    FROM "product_variants" AS current_default
    WHERE current_default."product_id" = variant."product_id"
      AND current_default."is_default" = TRUE
  )
  ORDER BY
    variant."product_id",
    variant."sort_order",
    variant."created_at",
    variant."id"
)
UPDATE "product_variants" AS variant
SET
  "is_default" = TRUE,
  "updated_at" = CURRENT_TIMESTAMP
FROM "first_variants"
WHERE variant."id" = "first_variants"."id";

INSERT INTO "product_variants" (
  "id",
  "product_id",
  "slug",
  "price_type",
  "sort_order",
  "is_default",
  "is_published",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  product."id",
  'default',
  'ON_REQUEST',
  10,
  TRUE,
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "products" AS product
WHERE NOT EXISTS (
  SELECT 1
  FROM "product_variants" AS variant
  WHERE variant."product_id" = product."id"
);
