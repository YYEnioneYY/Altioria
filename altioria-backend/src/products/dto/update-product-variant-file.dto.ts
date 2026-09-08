import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

export class UpdateProductVariantFileDto {
  @ApiPropertyOptional({
    nullable: true,
    example: '3D-модель исполнения',
  })
  @Transform(({ value }) => nullableString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  labelRu?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Variant 3D model',
  })
  @Transform(({ value }) => nullableString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  labelEn?: string | null;
}