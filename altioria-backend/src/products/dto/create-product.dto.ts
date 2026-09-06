import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

export class CreateProductDto {
  @ApiProperty({
    description: 'ID категории товара',
    format: 'uuid',
  })
  @IsUUID('4')
  categoryId!: string;

  @ApiProperty({
    description:
      'Адрес товара латиницей, например altair-i',
    example: 'altair-i',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @Length(2, 120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'slug может содержать только латинские буквы, цифры и дефисы',
  })
  slug!: string;

  @ApiProperty({
    description: 'Название товара на русском языке',
    example: 'Альтаир I',
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  nameRu!: string;

  @ApiProperty({
    description: 'Название товара на английском языке',
    example: 'Altair I',
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  nameEn!: string;

  @ApiProperty({
    description: 'Описание товара на русском языке',
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  descriptionRu!: string;

  @ApiProperty({
    description: 'Описание товара на английском языке',
  })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  descriptionEn!: string;

  @ApiPropertyOptional({
    description: 'Высота в миллиметрах',
    minimum: 1,
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
    description: 'Ширина в миллиметрах',
    minimum: 1,
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
    description: 'Глубина в миллиметрах',
    minimum: 1,
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
    description: 'Материалы на русском языке',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsRu?: string;

  @ApiPropertyOptional({
    description: 'Материалы на английском языке',
  })
  @Transform(({ value }) =>
    trimOptionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsEn?: string;

  @ApiPropertyOptional({
    description:
      'FIXED — фиксированная цена, ON_REQUEST — цена по запросу',
    enum: ProductPriceType,
    default: ProductPriceType.ON_REQUEST,
  })
  @IsOptional()
  @IsEnum(ProductPriceType)
  priceType?: ProductPriceType;

  @ApiPropertyOptional({
    description:
      'Стоимость для FIXED, например 125000.00',
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
      'Порядок товара в категории. Чем меньше число, тем выше товар',
    default: 0,
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
