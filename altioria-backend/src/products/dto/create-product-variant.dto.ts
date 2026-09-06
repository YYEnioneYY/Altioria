import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { ProductPriceType } from '../../generated/prisma/enums';

function trimString(value: unknown): unknown {
  return typeof value === 'string'
    ? value.trim()
    : value;
}

function trimOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === ''
    ? undefined
    : trimmedValue;
}

function toOptionalNumber(value: unknown): unknown {
  if (
    value === undefined ||
    value === null ||
    (typeof value === 'string' &&
      value.trim() === '')
  ) {
    return undefined;
  }

  return Number(value);
}

export class CreateProductVariantDto {
  @ApiProperty({
    description:
      'Короткий адрес исполнения латиницей',
    example: 'with-backrest',
  })
  @Transform(({ value }: { value: unknown }) =>
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

  @ApiProperty({
    description:
      'Название исполнения на русском языке',
    example: 'Со спинкой',
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  labelRu!: string;

  @ApiProperty({
    description:
      'Название исполнения на английском языке',
    example: 'With backrest',
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  labelEn!: string;

  @ApiPropertyOptional({
    description:
      'Описание на русском. Если не указать, используется описание основного товара',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionRu?: string;

  @ApiPropertyOptional({
    description:
      'Описание на английском. Если не указать, используется описание основного товара',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  descriptionEn?: string;

  @ApiPropertyOptional({
    description:
      'Высота в миллиметрах. Если не указать, используется высота основного товара',
  })
  @Transform(({ value }) =>
    toOptionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  heightMm?: number;

  @ApiPropertyOptional({
    description:
      'Ширина в миллиметрах. Если не указать, используется ширина основного товара',
  })
  @Transform(({ value }) =>
    toOptionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  widthMm?: number;

  @ApiPropertyOptional({
    description:
      'Глубина в миллиметрах. Если не указать, используется глубина основного товара',
  })
  @Transform(({ value }) =>
    toOptionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  depthMm?: number;

  @ApiPropertyOptional({
    description:
      'Материалы на русском. Если не указать, используются материалы основного товара',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsRu?: string;

  @ApiPropertyOptional({
    description:
      'Материалы на английском. Если не указать, используются материалы основного товара',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsEn?: string;

  @ApiPropertyOptional({
    enum: ProductPriceType,
    default: ProductPriceType.ON_REQUEST,
    description:
      'FIXED — фиксированная цена, ON_REQUEST — цена по запросу',
  })
  @IsOptional()
  @IsEnum(ProductPriceType)
  priceType?: ProductPriceType;

  @ApiPropertyOptional({
    description: 'Стоимость для типа FIXED',
    example: '125000.00',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @Matches(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
    message:
      'priceAmount должна быть положительным числом с точностью до 2 знаков',
  })
  priceAmount?: string;

  @ApiPropertyOptional({
    description: 'Трёхбуквенный код валюты',
    example: 'RUB',
  })
  @Transform(({ value }: { value: unknown }) => {
    const normalizedValue =
      trimOptionalString(value);

    return typeof normalizedValue === 'string'
      ? normalizedValue.toUpperCase()
      : normalizedValue;
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message:
      'priceCurrency должна состоять из трёх латинских букв',
  })
  priceCurrency?: string;

  @ApiPropertyOptional({
    description:
      'Порядок исполнения. Если не указать, оно добавится в конец',
  })
  @Transform(({ value }) =>
    toOptionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  sortOrder?: number;
}
