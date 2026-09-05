import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';

import { ProductPriceType } from '../../generated/prisma/enums';

function trimOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === ''
    ? undefined
    : trimmedValue;
}

export class CreateProductVariantDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug может содержать только латинские буквы, цифры и дефисы',
  })
  slug!: string;

  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(120)
  labelRu?: string;

  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(120)
  labelEn?: string;

  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionRu?: string;

  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionEn?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  heightMm?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  widthMm?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  depthMm?: number;

  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsRu?: string;

  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsEn?: string;

  @IsOptional()
  @IsEnum(ProductPriceType)
  priceType?: ProductPriceType;
  
  @IsOptional()
  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
    message: 'priceAmount должна быть положительным числом с точностью до 2 знаков',
  })
  priceAmount?: string;
  
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'priceCurrency должна состоять из трёх латинских букв',
  })
  priceCurrency?: string;
  
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  sortOrder?: number;
}