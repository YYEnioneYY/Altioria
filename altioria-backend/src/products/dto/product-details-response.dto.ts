import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ProductFileType,
  ProductPriceType,
} from '../../generated/prisma/client';

export class ProductDetailsCategoryDto {
  slug!: string;
  name!: string;
}

export class ProductDetailsImageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  imageUrl!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Стол Altair',
  })
  alt!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class ProductDetailsFileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: ProductFileType,
  })
  type!: ProductFileType;

  @ApiProperty()
  fileUrl!: string;

  @ApiProperty()
  originalName!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Техническая документация',
  })
  label!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class ProductDetailsVariantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiPropertyOptional({
    nullable: true,
  })
  materials!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  heightMm!: number | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  widthMm!: number | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  depthMm!: number | null;

  @ApiProperty({
    enum: ProductPriceType,
  })
  priceType!: ProductPriceType;

  @ApiPropertyOptional({
    nullable: true,
  })
  priceAmount!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  priceCurrency!: string | null;

  @ApiProperty({
    description:
      'Используются ли изображения основного товара',
  })
  usesProductImages!: boolean;

  @ApiProperty({
    type: [ProductDetailsImageDto],
  })
  images!: ProductDetailsImageDto[];

  @ApiProperty({
    type: [ProductDetailsFileDto],
    description:
      'Общие файлы товара и собственные файлы исполнения',
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