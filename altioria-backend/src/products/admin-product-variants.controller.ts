import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Post,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { AdminProductVariantResponseDto } from './dto/admin-product-variant-response.dto';

import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

import { ReorderProductVariantsDto } from './dto/reorder-product-variants.dto';
import { CreateProductVariantMultipartDto } from './dto/create-product-variant-multipart.dto';
import {
  MAX_PRODUCT_IMAGES_PER_UPLOAD,
  MAX_PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_FILE_TYPE,
} from './constants/product-image.constants';

@ApiTags('Admin product variants')
@Controller('admin/products/:productId/variants')
@UseGuards(AdminSessionGuard)
export class AdminProductVariantsController {
  constructor(
    private readonly productVariantsService:
      ProductVariantsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить все варианты товара',
  })
  getAll(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    productId: string,
  ): Promise<AdminProductVariantResponseDto[]> {
    return this.productVariantsService
      .findAllForAdmin(productId);
  }

  @Get(':variantId')
  @ApiOperation({
    summary:
      'Получить вариант товара по ID',
  })
  getOne(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    productId: string,

    @Param(
      'variantId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    variantId: string,
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService
      .findOneForAdmin(
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
  @ApiBody({
    type: CreateProductVariantMultipartDto,
  })
  @ApiOperation({
    summary:
      'Добавить исполнение товара с фотографиями',
  })
  create(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    productId: string,

    @Body()
    dto: CreateProductVariantDto,

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
          fileIsRequired: false,
          errorHttpStatusCode:
            HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    images?: Express.Multer.File[],
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService.create(
      productId,
      dto,
      images ?? [],
    );
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Изменить порядок вариантов товара',
  })
  async reorder(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: ReorderProductVariantsDto,
  ): Promise<void> {
    await this.productVariantsService.reorder(productId, dto);
  }

  @Patch(':variantId')
  @ApiOperation({
    summary:
      'Изменить или опубликовать вариант',
  })
  update(
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
    dto: UpdateProductVariantDto,
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService.update(
      productId,
      variantId,
      dto,
    );
  }

  @Patch(':variantId/default')
  @ApiOperation({
    summary:
      'Назначить вариант основным',
  })
  makeDefault(
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
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService.makeDefault(
      productId,
      variantId,
    );
  }

  @Delete(':variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить вариант товара',
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
  ): Promise<void> {
    await this.productVariantsService.remove(
      productId,
      variantId,
    );
  }

}
