import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  Length,
  Max,
  Min,
  IsOptional,
} from 'class-validator';

import {
  ProductFileType,
} from '../../generated/prisma/client';

export class CreateProductFileDto {
  @IsEnum(ProductFileType)
  type!: ProductFileType;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @Length(1, 160)
  labelRu!: string;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @Length(1, 160)
  labelEn!: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000)
  sortOrder?: number;
}