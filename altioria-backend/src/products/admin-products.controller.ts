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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';

import { UpdateProductDto } from './dto/update-product.dto';

import { ReorderProductsDto } from './dto/reorder-products.dto';

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
  @ApiOperation({
    summary: 'Создать товар-черновик',
  })
  create(
    @Body() dto: CreateProductDto,
  ): Promise<AdminProductResponseDto> {
    return this.productsService.create(dto);
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
}