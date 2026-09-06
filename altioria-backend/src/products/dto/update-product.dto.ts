import {
  OmitType,
  PartialType,
} from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'initialVariant',
  ] as const),
) {
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
