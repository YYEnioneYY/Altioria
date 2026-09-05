import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

import { ProductImagesService } from './product-images.service';
import { AdminProductImageResponseDto } from './dto/admin-product-image-response.dto';
import {
  MAX_PRODUCT_IMAGES_PER_UPLOAD,
  MAX_PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_FILE_TYPE,
} from './constants/product-image.constants';

import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';

@ApiTags('Admin product images')
@Controller(
  'admin/products/:productId/variants/:variantId/images',
)
@UseGuards(AdminSessionGuard)
export class AdminProductImagesController {
  constructor(
    private readonly productImagesService:
      ProductImagesService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить изображения варианта товара',
  })
  @ApiOkResponse({
    type: AdminProductImageResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Вариант товара не найден',
  })
  getAll(
    @Param(
      'productId',
      new ParseUUIDPipe({ version: '4' }),
    )
    productId: string,

    @Param(
      'variantId',
      new ParseUUIDPipe({ version: '4' }),
    )
    variantId: string,
  ): Promise<AdminProductImageResponseDto[]> {
    return this.productImagesService
      .findAllForAdmin(
        productId,
        variantId,
      );
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor(
      'images',
      MAX_PRODUCT_IMAGES_PER_UPLOAD,
      {
        limits: {
          files:
            MAX_PRODUCT_IMAGES_PER_UPLOAD,
          fileSize:
            MAX_PRODUCT_IMAGE_SIZE,
        },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Загрузить изображения варианта товара',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
        images: {
          type: 'array',
          description:
            'До 5 изображений JPG, JPEG, PNG, WEBP или AVIF',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: AdminProductImageResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Превышен лимит изображений или файл не удалось обработать',
  })
  @ApiNotFoundResponse({
    description: 'Вариант товара не найден',
  })
  upload(
    @Param(
      'productId',
      new ParseUUIDPipe({ version: '4' }),
    )
    productId: string,

    @Param(
      'variantId',
      new ParseUUIDPipe({ version: '4' }),
    )
    variantId: string,

    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            PRODUCT_IMAGE_FILE_TYPE,
        })
        .addMaxSizeValidator({
          maxSize:
            MAX_PRODUCT_IMAGE_SIZE,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode:
            HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    images: Express.Multer.File[],
  ): Promise<AdminProductImageResponseDto[]> {
    return this.productImagesService.upload(
      productId,
      variantId,
      images,
    );
  }

  @Patch('reorder')
  @ApiOperation({
    summary:
      'Изменить порядок изображений варианта',
  })
  reorder(
    @Param(
      'productId',
      new ParseUUIDPipe({ version: '4' }),
    )
    productId: string,
  
    @Param(
      'variantId',
      new ParseUUIDPipe({ version: '4' }),
    )
    variantId: string,
  
    @Body()
    dto: ReorderProductImagesDto,
  ): Promise<AdminProductImageResponseDto[]> {
    return this.productImagesService.reorder(
      productId,
      variantId,
      dto,
    );
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удалить изображение варианта товара',
  })
  async remove(
    @Param(
      'productId',
      new ParseUUIDPipe({ version: '4' }),
    )
    productId: string,
  
    @Param(
      'variantId',
      new ParseUUIDPipe({ version: '4' }),
    )
    variantId: string,
  
    @Param(
      'imageId',
      new ParseUUIDPipe({ version: '4' }),
    )
    imageId: string,
  ): Promise<void> {
    await this.productImagesService.remove(
      productId,
      variantId,
      imageId,
    );
  }
}