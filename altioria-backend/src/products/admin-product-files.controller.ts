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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  ProductFileType,
} from '../generated/prisma/client';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

import { ProductFilesService } from './product-files.service';
import { CreateProductFileDto } from './dto/create-product-file.dto';
import { ReorderProductFilesDto } from './dto/reorder-product-files.dto';
import { AdminProductFileResponseDto } from './dto/admin-product-file-response.dto';
import {
  MAX_PRODUCT_FILE_SIZE,
} from './constants/product-file.constants';

@ApiTags('Admin product files')
@Controller(
  'admin/products/:productId/variants/:variantId/files',
)
@UseGuards(AdminSessionGuard)
export class AdminProductFilesController {
  constructor(
    private readonly productFilesService:
      ProductFilesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получить файлы варианта',
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
  ): Promise<AdminProductFileResponseDto[]> {
    return this.productFilesService
      .findAllForAdmin(productId, variantId);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: MAX_PRODUCT_FILE_SIZE,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Загрузить файл варианта товара',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'type',
        'labelRu',
        'labelEn',
        'file',
      ],
      properties: {
        type: {
          type: 'string',
          enum: Object.values(ProductFileType),
          example: ProductFileType.DRAWING,
        },
        labelRu: {
          type: 'string',
          example: 'Чертёж',
        },
        labelEn: {
          type: 'string',
          example: 'Drawing',
        },
        sortOrder: {
          type: 'integer',
          example: 10,
        },
        file: {
          type: 'string',
          format: 'binary',
          description:
            'PDF-документ, GLB-модель или ZIP-архив',
        },
      },
    },
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

    @Body()
    dto: CreateProductFileDto,

    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: MAX_PRODUCT_FILE_SIZE,
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode:
            HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<AdminProductFileResponseDto> {
    return this.productFilesService.upload(
      productId,
      variantId,
      dto,
      file,
    );
  }

  @Patch('reorder')
  @ApiOperation({
    summary: 'Изменить порядок файлов',
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
    dto: ReorderProductFilesDto,
  ): Promise<AdminProductFileResponseDto[]> {
    return this.productFilesService.reorder(
      productId,
      variantId,
      dto,
    );
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить файл варианта',
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
      'fileId',
      new ParseUUIDPipe({ version: '4' }),
    )
    fileId: string,
  ): Promise<void> {
    await this.productFilesService.remove(
      productId,
      variantId,
      fileId,
    );
  }
}