import {
  PartialType,
  PickType,
} from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  PickType(CreateProductDto, [
    'categoryId',
    'slug',
    'nameRu',
    'nameEn',
    'sortOrder',
  ] as const),
) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
