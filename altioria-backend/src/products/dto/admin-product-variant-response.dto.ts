import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  ProductFileType,
  ProductPriceType,
} from '../../generated/prisma/client';

export class AdminProductVariantImageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  imageUrl!: string;

  @ApiPropertyOptional({
    nullable: true,
  })
  altRu!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  altEn!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class AdminProductVariantFileResponseDto {
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

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiPropertyOptional({
    nullable: true,
  })
  labelRu!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  labelEn!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class AdminProductVariantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  nameRu!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiPropertyOptional({
    nullable: true,
  })
  descriptionRu!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  descriptionEn!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  materialsRu!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  materialsEn!: string | null;

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

  @ApiPropertyOptional({
    enum: ProductPriceType,
    nullable: true,
    description:
      'null означает использование цены основного товара',
  })
  priceType!: ProductPriceType | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  priceAmount!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  priceCurrency!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  isPublished!: boolean;

  @ApiProperty({
    description:
      'Если true, исполнение использует изображения основного товара',
  })
  usesProductImages!: boolean;

  @ApiProperty({
    type: [AdminProductVariantImageResponseDto],
  })
  images!: AdminProductVariantImageResponseDto[];

  @ApiProperty({
    type: [AdminProductVariantFileResponseDto],
  })
  files!: AdminProductVariantFileResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}