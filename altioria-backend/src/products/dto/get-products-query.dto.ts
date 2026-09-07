import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export enum ProductLocale {
  RU = 'ru',
  EN = 'en',
}

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    enum: ProductLocale,
    default: ProductLocale.RU,
  })
  @IsOptional()
  @IsEnum(ProductLocale)
  locale?: ProductLocale;

  @ApiPropertyOptional({
    example: 'tables',
    description:
      'Slug категории для фильтрации',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsOptional()
  @IsString()
  @Matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  )
  category?: string;
}