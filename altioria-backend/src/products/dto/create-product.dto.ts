import { Transform, Type } from 'class-transformer';
import {
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

export class CreateProductDto {
  @IsUUID('4')
  categoryId!: string;

  @Transform(({ value }) =>
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

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  nameRu!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  nameEn!: string;

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
  @Min(0)
  @Max(100_000)
  sortOrder?: number;
}