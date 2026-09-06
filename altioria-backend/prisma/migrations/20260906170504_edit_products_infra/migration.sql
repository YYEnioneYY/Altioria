-- Старый каталог удаляется целиком.
-- Таблицы категорий, администраторов и сессий не затрагиваются.

DROP TABLE IF EXISTS "product_variant_files" CASCADE;
DROP TABLE IF EXISTS "product_variant_images" CASCADE;
DROP TABLE IF EXISTS "product_files" CASCADE;
DROP TABLE IF EXISTS "product_images" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;

DROP TYPE IF EXISTS "ProductFileType";

CREATE TYPE "ProductFileType" AS ENUM (
  'PDF',
  'MODEL_3D'
);

CREATE TABLE "products" (
  "id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "slug" VARCHAR(120) NOT NULL,

  "name_ru" VARCHAR(160) NOT NULL,
  "name_en" VARCHAR(160) NOT NULL,

  "description_ru" TEXT NOT NULL,
  "description_en" TEXT NOT NULL,

  "materials_ru" TEXT,
  "materials_en" TEXT,

  "height_mm" INTEGER,
  "width_mm" INTEGER,
  "depth_mm" INTEGER,

  "price_type" "ProductPriceType" NOT NULL DEFAULT 'ON_REQUEST',
  "price_amount" DECIMAL(12, 2),
  "price_currency" VARCHAR(3),

  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_published" BOOLEAN NOT NULL DEFAULT false,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "products_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "product_images" (
  "id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "image_key" VARCHAR(500) NOT NULL,

  "alt_ru" VARCHAR(255),
  "alt_en" VARCHAR(255),

  "sort_order" INTEGER NOT NULL DEFAULT 0,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_images_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "product_files" (
  "id" UUID NOT NULL,
  "product_id" UUID NOT NULL,

  "type" "ProductFileType" NOT NULL,

  "file_key" VARCHAR(500) NOT NULL,
  "original_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(150) NOT NULL,
  "size_bytes" INTEGER NOT NULL,

  "label_ru" VARCHAR(160),
  "label_en" VARCHAR(160),

  "sort_order" INTEGER NOT NULL DEFAULT 0,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_files_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "product_variants" (
  "id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "slug" VARCHAR(100) NOT NULL,

  "name_ru" VARCHAR(160) NOT NULL,
  "name_en" VARCHAR(160) NOT NULL,

  "description_ru" TEXT,
  "description_en" TEXT,

  "materials_ru" TEXT,
  "materials_en" TEXT,

  "height_mm" INTEGER,
  "width_mm" INTEGER,
  "depth_mm" INTEGER,

  "price_type" "ProductPriceType",
  "price_amount" DECIMAL(12, 2),
  "price_currency" VARCHAR(3),

  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_published" BOOLEAN NOT NULL DEFAULT false,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_variants_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "product_variant_images" (
  "id" UUID NOT NULL,
  "variant_id" UUID NOT NULL,
  "image_key" VARCHAR(500) NOT NULL,

  "alt_ru" VARCHAR(255),
  "alt_en" VARCHAR(255),

  "sort_order" INTEGER NOT NULL DEFAULT 0,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_variant_images_pkey"
    PRIMARY KEY ("id")
);

CREATE TABLE "product_variant_files" (
  "id" UUID NOT NULL,
  "variant_id" UUID NOT NULL,

  "type" "ProductFileType" NOT NULL,

  "file_key" VARCHAR(500) NOT NULL,
  "original_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(150) NOT NULL,
  "size_bytes" INTEGER NOT NULL,

  "label_ru" VARCHAR(160),
  "label_en" VARCHAR(160),

  "sort_order" INTEGER NOT NULL DEFAULT 0,

  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_variant_files_pkey"
    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "products_slug_key"
ON "products"("slug");

CREATE INDEX "products_category_id_is_published_sort_order_idx"
ON "products"(
  "category_id",
  "is_published",
  "sort_order"
);

CREATE UNIQUE INDEX "product_images_image_key_key"
ON "product_images"("image_key");

CREATE INDEX "product_images_product_id_sort_order_idx"
ON "product_images"(
  "product_id",
  "sort_order"
);

CREATE UNIQUE INDEX "product_files_file_key_key"
ON "product_files"("file_key");

CREATE INDEX "product_files_product_id_type_sort_order_idx"
ON "product_files"(
  "product_id",
  "type",
  "sort_order"
);

CREATE UNIQUE INDEX "product_variants_product_id_slug_key"
ON "product_variants"(
  "product_id",
  "slug"
);

CREATE INDEX "product_variants_product_id_is_published_sort_order_idx"
ON "product_variants"(
  "product_id",
  "is_published",
  "sort_order"
);

CREATE UNIQUE INDEX "product_variant_images_image_key_key"
ON "product_variant_images"("image_key");

CREATE INDEX "product_variant_images_variant_id_sort_order_idx"
ON "product_variant_images"(
  "variant_id",
  "sort_order"
);

CREATE UNIQUE INDEX "product_variant_files_file_key_key"
ON "product_variant_files"("file_key");

CREATE INDEX "product_variant_files_variant_id_type_sort_order_idx"
ON "product_variant_files"(
  "variant_id",
  "type",
  "sort_order"
);

ALTER TABLE "products"
ADD CONSTRAINT "products_category_id_fkey"
FOREIGN KEY ("category_id")
REFERENCES "categories"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "product_images"
ADD CONSTRAINT "product_images_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "product_files"
ADD CONSTRAINT "product_files_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "product_variants"
ADD CONSTRAINT "product_variants_product_id_fkey"
FOREIGN KEY ("product_id")
REFERENCES "products"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "product_variant_images"
ADD CONSTRAINT "product_variant_images_variant_id_fkey"
FOREIGN KEY ("variant_id")
REFERENCES "product_variants"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "product_variant_files"
ADD CONSTRAINT "product_variant_files_variant_id_fkey"
FOREIGN KEY ("variant_id")
REFERENCES "product_variants"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;