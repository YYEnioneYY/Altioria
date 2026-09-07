import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { ProductPriceType } from '../../generated/prisma/client';

function optionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();

  return normalized === '' ? undefined : normalized;
}

function optionalNumber(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return Number(value);
}

function optionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return value;
}

export class CreateProductVariantDto {
  @ApiProperty({
    example: 'altair-ii',
    description: 'Уникальный slug внутри товара',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug может содержать только латинские буквы, цифры и дефисы',
  })
  @MaxLength(160)
  slug!: string;

  @ApiProperty({
    example: 'Altair II',
  })
  @Transform(({ value }) => optionalString(value))
  @IsString()
  @MaxLength(160)
  nameRu!: string;

  @ApiProperty({
    example: 'Altair II',
  })
  @Transform(({ value }) => optionalString(value))
  @IsString()
  @MaxLength(160)
  nameEn!: string;

  @ApiPropertyOptional({
    description:
      'Если не указано, используется описание основного товара',
  })
  @Transform(({ value }) => optionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionRu?: string;

  @ApiPropertyOptional({
    description:
      'Если не указано, используется описание основного товара',
  })
  @Transform(({ value }) => optionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionEn?: string;

  @ApiPropertyOptional({
    description:
      'Если не указано, используются материалы основного товара',
  })
  @Transform(({ value }) => optionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsRu?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => optionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsEn?: string;

  @ApiPropertyOptional({
    example: 750,
    description:
      'Если не указано, используется высота основного товара',
  })
  @Transform(({ value }) => optionalNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  heightMm?: number;

  @ApiPropertyOptional({
    example: 1600,
  })
  @Transform(({ value }) => optionalNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  widthMm?: number;

  @ApiPropertyOptional({
    example: 800,
  })
  @Transform(({ value }) => optionalNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  depthMm?: number;

  @ApiPropertyOptional({
    enum: ProductPriceType,
    description:
      'Если не указано, используется цена основного товара',
  })
  @IsOptional()
  @IsEnum(ProductPriceType)
  priceType?: ProductPriceType;

  @ApiPropertyOptional({
    example: 125000,
    description:
      'Обязательно, если priceType равен FIXED',
  })
  @Transform(({ value }) => optionalNumber(value))
  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01)
  priceAmount?: number;

  @ApiPropertyOptional({
    example: 'RUB',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message:
      'priceCurrency должна состоять из трёх латинских букв',
  })
  priceCurrency?: string;

  @ApiPropertyOptional({
    example: 10,
    default: 0,
  })
  @Transform(({ value }) => optionalNumber(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: false,
    default: false,
  })
  @Transform(({ value }) => optionalBoolean(value))
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}