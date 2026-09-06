import { ApiPropertyOptional } from '@nestjs/swagger';

import { CreateProductDto } from './create-product.dto';

export class CreateProductMultipartDto extends CreateProductDto {
  @ApiPropertyOptional({
    type: 'array',
    description:
      'До 20 фотографий JPG, JPEG, PNG, WEBP или AVIF. Первая фотография станет обложкой товара',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  images?: string[];
}
