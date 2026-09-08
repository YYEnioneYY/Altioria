import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export enum SearchResultType {
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT',
  PRODUCT_VARIANT = 'PRODUCT_VARIANT',
}

export class SearchResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: SearchResultType,
  })
  type!: SearchResultType;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    description:
      'Slug категории либо основного товара',
  })
  slug!: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Slug категории, к которой относится товар',
  })
  categorySlug!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Заполняется только для дополнительного исполнения',
  })
  variantSlug!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Название основного товара для результата-исполнения',
  })
  parentProductName!: string | null;

  @ApiPropertyOptional({
    nullable: true,
  })
  imageUrl!: string | null;
}