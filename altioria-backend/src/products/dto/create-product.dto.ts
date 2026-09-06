import { Transform } from 'class-transformer';
import {
  IsBoolean,
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

import { ProductPriceType } from '../../generated/prisma/client';

function trimString(value: unknown): unknown {
  return typeof value === 'string'
    ? value.trim()
    : value;
}

function optionalString(
  value: unknown,
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const result = value.trim();

  return result === '' ? undefined : result;
}

function optionalNumber(
  value: unknown,
): unknown {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  return Number(value);
}

function parseBoolean(
  value: unknown,
): unknown {
  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return value;
}

export class CreateProductDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID категории',
  })
  @Transform(({ value }) =>
    trimString(value),
  )
  @IsUUID('4')
  categoryId!: string;

  @ApiProperty({
    example: 'altair-i',
    description:
      'Уникальная часть адреса товара',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @Length(2, 120)
  @Matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    {
      message:
        'slug может содержать только латинские буквы, цифры и дефисы',
    },
  )
  slug!: string;

  @ApiProperty({
    example: 'Альтаир I',
  })
  @Transform(({ value }) =>
    trimString(value),
  )
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  nameRu!: string;

  @ApiProperty({
    example: 'Altair I',
  })
  @Transform(({ value }) =>
    trimString(value),
  )
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  nameEn!: string;

  @ApiProperty({
    description:
      'Описание на русском языке',
  })
  @Transform(({ value }) =>
    trimString(value),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  descriptionRu!: string;

  @ApiProperty({
    description:
      'Описание на английском языке',
  })
  @Transform(({ value }) =>
    trimString(value),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20_000)
  descriptionEn!: string;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    optionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsRu?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) =>
    optionalString(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  materialsEn?: string;

  @ApiPropertyOptional({
    minimum: 1,
    description: 'Высота в миллиметрах',
  })
  @Transform(({ value }) =>
    optionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  heightMm?: number;

  @ApiPropertyOptional({
    minimum: 1,
    description: 'Ширина в миллиметрах',
  })
  @Transform(({ value }) =>
    optionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  widthMm?: number;

  @ApiPropertyOptional({
    minimum: 1,
    description: 'Глубина в миллиметрах',
  })
  @Transform(({ value }) =>
    optionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  depthMm?: number;

  @ApiPropertyOptional({
    enum: ProductPriceType,
    default: ProductPriceType.ON_REQUEST,
  })
  @IsOptional()
  @IsEnum(ProductPriceType)
  priceType?: ProductPriceType;

  @ApiPropertyOptional({
    example: '125000.00',
    description:
      'Стоимость при priceType = FIXED',
  })
  @Transform(({ value }) =>
    optionalString(value),
  )
  @IsOptional()
  @IsString()
  @Matches(
    /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/,
    {
      message:
        'priceAmount должна быть числом с точностью до двух знаков',
    },
  )
  priceAmount?: string;

  @ApiPropertyOptional({
    example: 'RUB',
  })
  @Transform(({ value }) => {
    const result = optionalString(value);

    return typeof result === 'string'
      ? result.toUpperCase()
      : result;
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message:
      'priceCurrency должна состоять из трёх латинских букв',
  })
  priceCurrency?: string;

  @ApiPropertyOptional({
    default: 0,
  })
  @Transform(({ value }) =>
    optionalNumber(value),
  )
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  sortOrder?: number;

  @ApiPropertyOptional({
    default: false,
  })
  @Transform(({ value }) =>
    parseBoolean(value),
  )
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}