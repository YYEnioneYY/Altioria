import { ApiProperty } from '@nestjs/swagger';

import {
  ProductFileType,
  ProductPriceType,
} from '../../generated/prisma/client';

export class AdminProductCategoryResponseDto {
  id!: string;
  slug!: string;
  nameRu!: string;
  nameEn!: string;
}

export class AdminProductImageResponseDto {
  id!: string;
  imageUrl!: string;
  altRu!: string | null;
  altEn!: string | null;
  sortOrder!: number;
}

export class AdminProductFileResponseDto {
  id!: string;

  @ApiProperty({
    enum: ProductFileType,
  })
  type!: ProductFileType;

  fileUrl!: string;
  originalName!: string;
  mimeType!: string;
  sizeBytes!: number;
  labelRu!: string | null;
  labelEn!: string | null;
  sortOrder!: number;
}

export class AdminProductResponseDto {
  id!: string;
  categoryId!: string;
  @ApiProperty({
    type: AdminProductCategoryResponseDto,
  })
  category!: AdminProductCategoryResponseDto;
  slug!: string;

  nameRu!: string;
  nameEn!: string;

  descriptionRu!: string;
  descriptionEn!: string;

  materialsRu!: string | null;
  materialsEn!: string | null;

  heightMm!: number | null;
  widthMm!: number | null;
  depthMm!: number | null;

  @ApiProperty({
    enum: ProductPriceType,
  })
  priceType!: ProductPriceType;

  priceAmount!: string | null;
  priceCurrency!: string | null;

  sortOrder!: number;
  isPublished!: boolean;

  @ApiProperty({
    type: AdminProductImageResponseDto,
    isArray: true,
  })
  images!: AdminProductImageResponseDto[];

  @ApiProperty({
    type: AdminProductFileResponseDto,
    isArray: true,
  })
  files!: AdminProductFileResponseDto[];

  variantsCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}