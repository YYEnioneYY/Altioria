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

import { AdminProductFileResponseDto } from './dto/admin-product-response.dto';
import { ReorderProductFilesDto } from './dto/reorder-product-files.dto';
import { UpdateProductFileDto } from './dto/update-product-file.dto';
import { ProductFilesService } from './product-files.service';

@ApiTags('Admin product files')
@ApiUnauthorizedResponse({
  description:
    'Администратор не авторизован',
})
@Controller(
  'admin/products/:productId/files',
)
@UseGuards(AdminSessionGuard)
export class AdminProductFilesController {
  constructor(
    private readonly productFilesService:
      ProductFilesService,
  ) {}

  @Patch('reorder')
  @ApiOperation({
    summary:
      'Изменить порядок файлов товара',
  })
  @ApiOkResponse({
    type: AdminProductFileResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Переданы не все файлы или присутствуют повторы',
  })
  @ApiNotFoundResponse({
    description:
      'Товар или файл не найдены',
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
    dto: ReorderProductFilesDto,
  ): Promise<
    AdminProductFileResponseDto[]
  > {
    return this.productFilesService
      .reorder(productId, dto);
  }

  @Patch(':fileId')
  @ApiOperation({
    summary:
      'Изменить подписи файла',
  })
  @ApiOkResponse({
    type: AdminProductFileResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Не передано ни одного изменения',
  })
  @ApiNotFoundResponse({
    description:
      'Файл товара не найден',
  })
  update(
    @Param(
      'productId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    productId: string,

    @Param(
      'fileId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    fileId: string,

    @Body()
    dto: UpdateProductFileDto,
  ): Promise<AdminProductFileResponseDto> {
    return this.productFilesService
      .update(
        productId,
        fileId,
        dto,
      );
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Удалить файл товара',
  })
  @ApiNoContentResponse({
    description:
      'Файл удалён',
  })
  @ApiNotFoundResponse({
    description:
      'Файл товара не найден',
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
      'fileId',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    fileId: string,
  ): Promise<void> {
    await this.productFilesService
      .remove(
        productId,
        fileId,
      );
  }
}