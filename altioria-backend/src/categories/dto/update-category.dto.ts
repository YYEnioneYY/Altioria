import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateCategoryDto } from './create-category.dto';

function parseBoolean(value: unknown): unknown {
  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return value;
}

export class UpdateCategoryDto extends PartialType(
  CreateCategoryDto,
) {
  @Transform(({ value }) => parseBoolean(value))
  @IsOptional()
  @IsBoolean()
  removeImage?: boolean;
}