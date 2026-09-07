import { Allow } from 'class-validator';
import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductVariantMultipartDto extends CreateProductVariantDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description:
      'До 15 собственных изображений. Если не передать, используются изображения основного товара',
  })
  @Allow()
  @Transform(() => undefined)
  images?: unknown[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description:
      'PDF и 3D-файлы, относящиеся только к этому исполнению',
  })
  @Allow()
  @Transform(() => undefined)
  files?: unknown[];
}