import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Get,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Delete,
  HttpCode,
  HttpStatus,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
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

import { UpdateProductMultipartDto } from './dto/update-product-multipart.dto';

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

  @Get()
  @ApiOperation({
    summary:
      'Получить все товары для админ-панели',
  })
  @ApiOkResponse({
    type: AdminProductResponseDto,
    isArray: true,
  })
  getAll():
    Promise<AdminProductResponseDto[]> {
    return this.productsService
      .findAllForAdmin();
  }
  
  @Get(':id')
  @ApiOperation({
    summary:
      'Получить товар по ID для админ-панели',
  })
  @ApiOkResponse({
    type: AdminProductResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'Товар не найден',
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
    return this.productsService
      .findOneForAdmin(id);
  }

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

  @Patch(':id')
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
      'Изменить товар и добавить изображения или файлы',
  })
  @ApiBody({
    type: UpdateProductMultipartDto,
  })
  @ApiOkResponse({
    type: AdminProductResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Некорректные изменения или превышен лимит файлов',
  })
  @ApiNotFoundResponse({
    description:
      'Товар или категория не найдены',
  })
  @ApiConflictResponse({
    description:
      'Товар с таким slug уже существует',
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  
    @Body()
    dto: UpdateProductMultipartDto,
  
    @UploadedFiles()
    uploads?: ProductUploadFields,
  ): Promise<AdminProductResponseDto> {
    return this.productsService.update(
      id,
      dto,
      {
        images:
          uploads?.images ?? [],
        files:
          uploads?.files ?? [],
      },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удалить товар со всеми изображениями, файлами и исполнениями',
  })
  @ApiNoContentResponse({
    description:
      'Товар полностью удалён',
  })
  @ApiNotFoundResponse({
    description:
      'Товар не найден',
  })
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<void> {
    await this.productsService.remove(id);
  }
}