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
import { ApiPropertyOptional } from '@nestjs/swagger';

import { ProductPriceType } from '../../generated/prisma/client';

function optionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();

  return normalized === '' ? undefined : normalized;
}

function nullableString(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === 'null') {
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();

    return normalized === '' ? null : normalized;
  }

  return value;
}

function nullableNumber(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (
    value === null ||
    value === '' ||
    value === 'null'
  ) {
    return null;
  }

  return Number(value);
}

function optionalNumber(value: unknown): unknown {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  return Number(value);
}

function optionalBoolean(value: unknown): unknown {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
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

export class UpdateProductVariantDto {
  @ApiPropertyOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(160)
  slug?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => optionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  nameRu?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => optionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  nameEn?: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Пустое значение возвращает описание основного товара',
  })
  @Transform(({ value }) => nullableString(value))
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionRu?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableString(value))
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableString(value))
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsRu?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableString(value))
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  heightMm?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  widthMm?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  depthMm?: number | null;

  @ApiPropertyOptional({
    enum: ProductPriceType,
    nullable: true,
    description:
      'Пустое значение возвращает цену основного товара',
  })
  @Transform(({ value }) => {
    if (
      value === '' ||
      value === null ||
      value === 'null'
    ) {
      return null;
    }

    return value;
  })
  @IsOptional()
  @IsEnum(ProductPriceType)
  priceType?: ProductPriceType | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => nullableNumber(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  priceAmount?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(({ value }) => {
    const normalized = nullableString(value);

    return typeof normalized === 'string'
      ? normalized.toUpperCase()
      : normalized;
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  priceCurrency?: string | null;

  @ApiPropertyOptional()
  @Transform(({ value }) => optionalNumber(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => optionalBoolean(value))
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}