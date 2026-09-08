import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Поиск опубликованных категорий, товаров и исполнений',
  })
  @ApiOkResponse({
    type: SearchResultDto,
    isArray: true,
  })
  search(
    @Query()
    query: SearchQueryDto,
  ): Promise<SearchResultDto[]> {
    return this.searchService.search(query);
  }
}