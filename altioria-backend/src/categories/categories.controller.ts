import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { GetCategoriesQueryDto } from './dto/get-categories-query.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получить опубликованные категории',
  })
  getAll(
    @Query() query: GetCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll(query);
  }
}