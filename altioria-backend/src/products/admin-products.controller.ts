import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

import {
  MAX_PRODUCT_FILES,
  MAX_PRODUCT_FILE_SIZE,
  MAX_PRODUCT_IMAGES,
  MAX_PRODUCT_UPLOAD_FILES,
} from './constants/product-upload.constants';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';
import { CreateProductMultipartDto } from './dto/create-product-multipart.dto';
import { ProductsService } from './products.service';

interface ProductUploadFields {
  images?: Express.Multer.File[];
  files?: Express.Multer.File[];
}

@ApiTags('Admin products')
@ApiUnauthorizedResponse({
  description:
    'Администратор не авторизован',
})
@Controller('admin/products')
@UseGuards(AdminSessionGuard)
export class AdminProductsController {
  constructor(
    private readonly productsService:
      ProductsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'images',
          maxCount:
            MAX_PRODUCT_IMAGES,
        },
        {
          name: 'files',
          maxCount:
            MAX_PRODUCT_FILES,
        },
      ],
      {
        limits: {
          files:
            MAX_PRODUCT_UPLOAD_FILES,
          fileSize:
            MAX_PRODUCT_FILE_SIZE,
        },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Создать товар с изображениями и файлами',
  })
  @ApiBody({
    type: CreateProductMultipartDto,
  })
  @ApiCreatedResponse({
    type: AdminProductResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Некорректные данные, изображения или файлы',
  })
  @ApiConflictResponse({
    description:
      'Товар с таким slug уже существует',
  })
  create(
    @Body() dto: CreateProductMultipartDto,
    @UploadedFiles()
    uploads?: ProductUploadFields,
  ): Promise<AdminProductResponseDto> {
    return this.productsService.create(
      dto,
      {
        images:
          uploads?.images ?? [],
        files:
          uploads?.files ?? [],
      },
    );
  }
}