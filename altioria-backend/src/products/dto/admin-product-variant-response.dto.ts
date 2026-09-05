import { ProductPriceType } from '../../generated/prisma/client';

export class AdminProductVariantResponseDto {
  id!: string;
  productId!: string;

  slug!: string;

  labelRu!: string | null;
  labelEn!: string | null;

  descriptionRu!: string | null;
  descriptionEn!: string | null;

  heightMm!: number | null;
  widthMm!: number | null;
  depthMm!: number | null;

  materialsRu!: string | null;
  materialsEn!: string | null;

  priceType!: ProductPriceType;
  priceAmount!: string | null;
  priceCurrency!: string | null;

  sortOrder!: number;

  isDefault!: boolean;
  isPublished!: boolean;

  imagesCount!: number;
  filesCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}