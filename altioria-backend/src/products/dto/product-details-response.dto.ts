import { ApiProperty } from '@nestjs/swagger';

import {
  ProductFileType,
  ProductPriceType,
} from '../../generated/prisma/client';

export class ProductDetailsCategoryDto {
  slug!: string;
  name!: string;
}

export class ProductDetailsImageDto {
  id!: string;
  imageUrl!: string;
  alt!: string;
}

export class ProductDetailsFileDto {
  id!: string;

  @ApiProperty({
    enum: ProductFileType,
  })
  type!: ProductFileType;

  fileUrl!: string;
  originalName!: string;
  label!: string;
  sizeBytes!: number;
}

export class ProductDetailsVariantDto {
  id!: string;
  slug!: string;
  name!: string;

  description!: string;
  materials!: string | null;

  heightMm!: number | null;
  widthMm!: number | null;
  depthMm!: number | null;

  @ApiProperty({
    enum: ProductPriceType,
  })
  priceType!: ProductPriceType;

  priceAmount!: string | null;
  priceCurrency!: string | null;

  usesProductImages!: boolean;

  @ApiProperty({
    type: ProductDetailsImageDto,
    isArray: true,
  })
  images!: ProductDetailsImageDto[];

  @ApiProperty({
    type: ProductDetailsFileDto,
    isArray: true,
  })
  files!: ProductDetailsFileDto[];
}

export class ProductDetailsResponseDto {
  id!: string;
  slug!: string;
  name!: string;

  description!: string;
  materials!: string | null;

  heightMm!: number | null;
  widthMm!: number | null;
  depthMm!: number | null;

  @ApiProperty({
    enum: ProductPriceType,
  })
  priceType!: ProductPriceType;

  priceAmount!: string | null;
  priceCurrency!: string | null;

  @ApiProperty({
    type: ProductDetailsCategoryDto,
  })
  category!: ProductDetailsCategoryDto;

  @ApiProperty({
    type: ProductDetailsImageDto,
    isArray: true,
  })
  images!: ProductDetailsImageDto[];

  @ApiProperty({
    type: ProductDetailsFileDto,
    isArray: true,
  })
  files!: ProductDetailsFileDto[];

  @ApiProperty({
    type: ProductDetailsVariantDto,
    isArray: true,
  })
  variants!: ProductDetailsVariantDto[];
}