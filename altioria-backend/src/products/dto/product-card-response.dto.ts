import { ApiProperty } from '@nestjs/swagger';

import {
  ProductPriceType,
} from '../../generated/prisma/client';

export class ProductCardCategoryDto {
  slug!: string;
  name!: string;
}

export class ProductCardResponseDto {
  id!: string;
  slug!: string;
  name!: string;

  coverImageUrl!: string;

  @ApiProperty({
    enum: ProductPriceType,
  })
  priceType!: ProductPriceType;

  priceAmount!: string | null;
  priceCurrency!: string | null;

  @ApiProperty({
    type: ProductCardCategoryDto,
  })
  category!: ProductCardCategoryDto;
}