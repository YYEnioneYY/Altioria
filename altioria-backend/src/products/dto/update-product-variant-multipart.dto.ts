import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UpdateProductVariantDto } from './update-product-variant.dto';

export class UpdateProductVariantMultipartDto extends UpdateProductVariantDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description:
      'Новые изображения, которые нужно добавить',
  })
  @Allow()
  @Transform(() => undefined)
  images?: unknown[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description:
      'Новые PDF/GLB/GLTF-файлы',
  })
  @Allow()
  @Transform(() => undefined)
  files?: unknown[];
}