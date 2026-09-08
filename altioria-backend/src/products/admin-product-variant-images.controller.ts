import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AdminProductVariantImageResponseDto } from './dto/admin-product-variant-response.dto';
import { ReorderProductVariantImagesDto } from './dto/reorder-product-variant-images.dto';
import { ProductVariantImagesService } from './product-variant-images.service';

@ApiTags('Admin product variant images')
@ApiUnauthorizedResponse({
  description: 'Администратор не авторизован',
})
@UseGuards(AdminSessionGuard)
@Controller(
  'admin/products/:productId/variants/:variantId/images',
)
export class AdminProductVariantImagesController {
  constructor(
    private readonly productVariantImagesService: ProductVariantImagesService,
  ) {}

  @Patch('reorder')
  @ApiOperation({
    summary:
      'Изменить порядок изображений исполнения',
  })
  @ApiBody({
    type: ReorderProductVariantImagesDto,
  })
  @ApiOkResponse({
    type: AdminProductVariantImageResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Переданы не все изображения или посторонние ID',
  })
  @ApiNotFoundResponse({
    description: 'Исполнение не найдено',
  })
  async reorder(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    productId: string,

    @Param(
      'variantId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    variantId: string,

    @Body()
    dto: ReorderProductVariantImagesDto,
  ): Promise<
    AdminProductVariantImageResponseDto[]
  > {
    return this.productVariantImagesService.reorder(
      productId,
      variantId,
      dto,
    );
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удалить изображение исполнения',
  })
  @ApiNoContentResponse({
    description: 'Изображение удалено',
  })
  @ApiBadRequestResponse({
    description:
      'Опубликованное исполнение останется без изображений',
  })
  @ApiNotFoundResponse({
    description:
      'Исполнение или изображение не найдено',
  })
  async remove(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    productId: string,

    @Param(
      'variantId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    variantId: string,

    @Param(
      'imageId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    imageId: string,
  ): Promise<void> {
    return this.productVariantImagesService.remove(
      productId,
      variantId,
      imageId,
    );
  }
}