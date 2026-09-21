-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "specifications" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "specifications" JSONB NOT NULL DEFAULT '[]';
