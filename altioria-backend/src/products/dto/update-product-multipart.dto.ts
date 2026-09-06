import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { UpdateProductDto } from './update-product.dto';

export class UpdateProductMultipartDto
  extends UpdateProductDto
{
  @Allow()
  @Transform(() => undefined)
  @ApiPropertyOptional({
    type: 'array',
    maxItems: 15,
    description:
      'Новые изображения, которые будут добавлены к существующим',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  images?: string[];

  @Allow()
  @Transform(() => undefined)
  @ApiPropertyOptional({
    type: 'array',
    maxItems: 10,
    description:
      'Новые PDF, GLB или GLTF-файлы',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files?: string[];
}