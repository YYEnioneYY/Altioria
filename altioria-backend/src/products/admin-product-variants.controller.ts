import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AdminSessionGuard } from '../auth/guards/admin-session.guard';

import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { AdminProductVariantResponseDto } from './dto/admin-product-variant-response.dto';

import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

import { ReorderProductVariantsDto } from './dto/reorder-product-variants.dto';

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
  @ApiOperation({
    summary:
      'Создать вариант товара',
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
  ): Promise<AdminProductVariantResponseDto> {
    return this.productVariantsService.create(
      productId,
      dto,
    );
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
}