-- CreateEnum
CREATE TYPE "ProductFileType" AS ENUM ('DRAWING', 'WIRING_DIAGRAM', 'MODEL_3D', 'OTHER');

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name_ru" VARCHAR(160) NOT NULL,
    "name_en" VARCHAR(160) NOT NULL,
    "description_ru" TEXT,
    "description_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "label_ru" VARCHAR(120),
    "label_en" VARCHAR(120),
    "description_ru" TEXT,
    "description_en" TEXT,
    "height_mm" INTEGER,
    "width_mm" INTEGER,
    "depth_mm" INTEGER,
    "materials_ru" TEXT,
    "materials_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "image_path" VARCHAR(500) NOT NULL,
    "alt_ru" VARCHAR(255),
    "alt_en" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_files" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "type" "ProductFileType" NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(150) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "label_ru" VARCHAR(160) NOT NULL,
    "label_en" VARCHAR(160) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_is_published_sort_order_idx" ON "products"("category_id", "is_published", "sort_order");

-- CreateIndex
CREATE INDEX "product_variants_product_id_is_published_sort_order_idx" ON "product_variants"("product_id", "is_published", "sort_order");

-- CreateIndex
CREATE INDEX "product_variants_product_id_is_default_idx" ON "product_variants"("product_id", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_slug_key" ON "product_variants"("product_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_image_path_key" ON "product_images"("image_path");

-- CreateIndex
CREATE INDEX "product_images_variant_id_sort_order_idx" ON "product_images"("variant_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "product_files_file_path_key" ON "product_files"("file_path");

-- CreateIndex
CREATE INDEX "product_files_variant_id_type_sort_order_idx" ON "product_files"("variant_id", "type", "sort_order");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "product_variants_one_default"
ON "product_variants" ("product_id")
WHERE "is_default" = TRUE;