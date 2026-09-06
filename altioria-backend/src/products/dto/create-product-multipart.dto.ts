import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Allow } from 'class-validator';

import { CreateProductDto } from './create-product.dto';

export class CreateProductMultipartDto
  extends CreateProductDto
{
  @Allow()
  @ApiProperty({
    type: 'array',
    minItems: 1,
    maxItems: 15,
    description:
      'От 1 до 15 изображений. Первая фотография станет обложкой',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  images!: string[];

  @Allow()
  @ApiPropertyOptional({
    type: 'array',
    maxItems: 10,
    description:
      'PDF, GLB или GLTF. До 10 файлов',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  files?: string[];
}