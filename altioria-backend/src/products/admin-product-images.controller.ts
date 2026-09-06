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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

import { AdminProductImageResponseDto } from './dto/admin-product-response.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { ProductImagesService } from './product-images.service';

@ApiTags('Admin product images')
@ApiUnauthorizedResponse({
  description:
    'Администратор не авторизован',
})
@Controller(
  'admin/products/:productId/images',
)
@UseGuards(AdminSessionGuard)
export class AdminProductImagesController {
  constructor(
    private readonly productImagesService:
      ProductImagesService,
  ) {}

  @Patch('reorder')
  @ApiOperation({
    summary:
      'Изменить порядок изображений товара',
  })
  @ApiOkResponse({
    type: AdminProductImageResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Переданы не все изображения или присутствуют повторы',
  })
  @ApiNotFoundResponse({
    description:
      'Товар или изображение не найдены',
  })
  reorder(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    productId: string,

    @Body()
    dto: ReorderProductImagesDto,
  ): Promise<
    AdminProductImageResponseDto[]
  > {
    return this.productImagesService
      .reorder(productId, dto);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удалить изображение товара',
  })
  @ApiNoContentResponse({
    description:
      'Изображение удалено',
  })
  @ApiBadRequestResponse({
    description:
      'Нельзя удалить единственное изображение опубликованного товара',
  })
  @ApiNotFoundResponse({
    description:
      'Товар или изображение не найдены',
  })
  async remove(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    productId: string,

    @Param(
      'imageId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    imageId: string,
  ): Promise<void> {
    await this.productImagesService
      .remove(
        productId,
        imageId,
      );
  }
}