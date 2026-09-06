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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';

import { UpdateProductDto } from './dto/update-product.dto';

import { ReorderProductsDto } from './dto/reorder-products.dto';
import { CreateProductMultipartDto } from './dto/create-product-multipart.dto';
import {
  MAX_PRODUCT_IMAGES_PER_UPLOAD,
  MAX_PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_FILE_TYPE,
} from './constants/product-image.constants';

@ApiTags('Admin products')
@Controller('admin/products')
@UseGuards(AdminSessionGuard)
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить все товары для админ-панели',
  })
  getAll():
    Promise<AdminProductResponseDto[]> {
    return this.productsService.findAllForAdmin();
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Получить товар по ID для админ-панели',
  })
  getOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<AdminProductResponseDto> {
    return this.productsService.findOneForAdmin(id);
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
    type: CreateProductMultipartDto,
  })
  @ApiOperation({
    summary:
      'Создать карточку товара с основными данными и фотографиями',
  })
  create(
    @Body() dto: CreateProductDto,

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
  ): Promise<AdminProductResponseDto> {
    return this.productsService.create(
      dto,
      images ?? [],
    );
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Изменить порядок товаров внутри категории',
  })
  async reorder(
    @Body() dto: ReorderProductsDto,
  ): Promise<void> {
    await this.productsService.reorder(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Изменить или опубликовать товар',
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({ version: '4' }),
    )
    id: string,
  
    @Body()
    dto: UpdateProductDto,
  ): Promise<AdminProductResponseDto> {
    return this.productsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить товар',
  })
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({ version: '4' }),
    )
    id: string,
  ): Promise<void> {
    await this.productsService.remove(id);
  }

}
