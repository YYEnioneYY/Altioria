import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { ProductCardResponseDto } from './dto/product-card-response.dto';
import { ProductDetailsResponseDto } from './dto/product-details-response.dto';
import { ProductsService } from './products.service';

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
  @ApiOkResponse({
    type: ProductCardResponseDto,
    isArray: true,
  })
  getAll(
    @Query()
    query: GetProductsQueryDto,
  ): Promise<ProductCardResponseDto[]> {
    return this.productsService
      .findAll(query);
  }

  @Get(':slug')
  @ApiOperation({
    summary:
      'Получить опубликованный товар по slug',
  })
  @ApiOkResponse({
    type: ProductDetailsResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'Товар не найден или не опубликован',
  })
  getOne(
    @Param('slug')
    slug: string,

    @Query()
    query: GetProductsQueryDto,
  ): Promise<ProductDetailsResponseDto> {
    return this.productsService
      .findOne(slug, query);
  }
}