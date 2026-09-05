import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { GetProductQueryDto } from './dto/get-product-query.dto';
import { ProductCardResponseDto } from './dto/product-card-response.dto';
import { ProductDetailsResponseDto } from './dto/product-details-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService:
      ProductsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить опубликованные товары',
  })
  getAll(
    @Query()
    query: GetProductsQueryDto,
  ): Promise<ProductCardResponseDto[]> {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({
    summary:
      'Получить опубликованный товар по slug',
  })
  getOne(
    @Param('slug')
    slug: string,

    @Query()
    query: GetProductQueryDto,
  ): Promise<ProductDetailsResponseDto> {
    return this.productsService.findOne(
      slug.trim().toLowerCase(),
      query,
    );
  }
}