import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function normalizeLabel(
  value: unknown,
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const label = value.trim();

  return label === ''
    ? null
    : label;
}

export class UpdateProductFileDto {
  @ApiPropertyOptional({
    nullable: true,
    example: 'Каталог товара',
    description:
      'Передай пустую строку или null, чтобы удалить подпись',
  })
  @Transform(({ value }) =>
    normalizeLabel(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(160)
  labelRu?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Product catalogue',
    description:
      'Передай пустую строку или null, чтобы удалить подпись',
  })
  @Transform(({ value }) =>
    normalizeLabel(value),
  )
  @IsOptional()
  @IsString()
  @MaxLength(160)
  labelEn?: string | null;
}