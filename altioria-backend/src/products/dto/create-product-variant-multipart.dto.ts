import { ApiPropertyOptional } from '@nestjs/swagger';

import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductVariantMultipartDto extends CreateProductVariantDto {
  @ApiPropertyOptional({
    type: 'array',
    description:
      'До 20 фотографий дополнительного исполнения. Первая фотография станет его обложкой',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  images?: string[];
}
