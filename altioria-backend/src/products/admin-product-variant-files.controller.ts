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
import { AdminProductVariantFileResponseDto } from './dto/admin-product-variant-response.dto';
import { ReorderProductVariantFilesDto } from './dto/reorder-product-variant-files.dto';
import { UpdateProductVariantFileDto } from './dto/update-product-variant-file.dto';
import { ProductVariantFilesService } from './product-variant-files.service';

@ApiTags('Admin product variant files')
@ApiUnauthorizedResponse({
  description: 'Администратор не авторизован',
})
@UseGuards(AdminSessionGuard)
@Controller(
  'admin/products/:productId/variants/:variantId/files',
)
export class AdminProductVariantFilesController {
  constructor(
    private readonly productVariantFilesService: ProductVariantFilesService,
  ) {}

  @Patch('reorder')
  @ApiOperation({
    summary:
      'Изменить порядок файлов исполнения',
  })
  @ApiOkResponse({
    type: AdminProductVariantFileResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Переданы не все файлы или посторонние ID',
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
    dto: ReorderProductVariantFilesDto,
  ): Promise<
    AdminProductVariantFileResponseDto[]
  > {
    return this.productVariantFilesService.reorder(
      productId,
      variantId,
      dto,
    );
  }

  @Patch(':fileId')
  @ApiOperation({
    summary:
      'Изменить названия файла исполнения',
  })
  @ApiOkResponse({
    type: AdminProductVariantFileResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Не передано ни одного изменения',
  })
  @ApiNotFoundResponse({
    description: 'Файл исполнения не найден',
  })
  async update(
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
      'fileId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    fileId: string,

    @Body()
    dto: UpdateProductVariantFileDto,
  ): Promise<AdminProductVariantFileResponseDto> {
    return this.productVariantFilesService.update(
      productId,
      variantId,
      fileId,
      dto,
    );
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить файл исполнения',
  })
  @ApiNoContentResponse({
    description: 'Файл удалён',
  })
  @ApiNotFoundResponse({
    description: 'Файл исполнения не найден',
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
      'fileId',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode:
          HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    fileId: string,
  ): Promise<void> {
    return this.productVariantFilesService.remove(
      productId,
      variantId,
      fileId,
    );
  }
}