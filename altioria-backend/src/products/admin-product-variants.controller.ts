import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Get,
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
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CreateProductVariantMultipartDto } from './dto/create-product-variant-multipart.dto';
import { AdminProductVariantResponseDto } from './dto/admin-product-variant-response.dto';
import { ProductVariantsService } from './product-variants.service';

interface ProductVariantUploadedFiles {
  images?: Express.Multer.File[];
  files?: Express.Multer.File[];
}

@ApiTags('Admin product variants')
@ApiUnauthorizedResponse({
  description: 'Администратор не авторизован',
})
@UseGuards(AdminSessionGuard)
@Controller('admin/products/:productId/variants')
export class AdminProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить все исполнения товара для админки',
  })
  @ApiOkResponse({
    type: AdminProductVariantResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Товар не найден',
  })
  async findAll(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    productId: string,
  ): Promise<AdminProductVariantResponseDto[]> {
    return this.productVariantsService.findAllForAdmin(
      productId,
    );
  }

  @Get(':variantId')
  @ApiOperation({
    summary:
      'Получить одно исполнение товара для админки',
  })
  @ApiOkResponse({
    type: AdminProductVariantResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'Товар или исполнение не найдено',
  })
  async findOne(
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
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService.findOneForAdmin(
      productId,
      variantId,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Создать дополнительное исполнение товара',
    description:
      'Изображения и файлы необязательны. Если изображения не загружены, исполнение использует изображения основного товара.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateProductVariantMultipartDto,
  })
  @ApiCreatedResponse({
    type: AdminProductVariantResponseDto,
    description: 'Исполнение создано',
  })
  @ApiBadRequestResponse({
    description:
      'Некорректные поля, цена, изображения или файлы',
  })
  @ApiNotFoundResponse({
    description: 'Основной товар не найден',
  })
  @ApiConflictResponse({
    description:
      'Исполнение с таким slug уже существует у этого товара',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'images',
          maxCount: 15,
        },
        {
          name: 'files',
          maxCount: 10,
        },
      ],
      {
        limits: {
          files: 25,
          fileSize: 50 * 1024 * 1024,
        },
      },
    ),
  )
  async create(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    productId: string,

    @Body()
    dto: CreateProductVariantMultipartDto,

    @UploadedFiles()
    uploadedFiles?: ProductVariantUploadedFiles,
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService.create(
      productId,
      dto,
      uploadedFiles?.images ?? [],
      uploadedFiles?.files ?? [],
    );
  }
}