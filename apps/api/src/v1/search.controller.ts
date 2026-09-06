import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { SearchResponse } from '@kathapp/shared';
import { SearchService } from './search.service';

@ApiTags('v1-search')
@Controller('v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'locale', required: false, description: 'Content locale' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Optional filter: saint | miracle | source',
  })
  @ApiOkResponse({ description: 'Published entity search (empty when no matches)' })
  search(
    @Query('q') q?: string,
    @Query('locale') locale?: string,
    @Query('type') type?: string,
  ): Promise<SearchResponse> {
    return this.searchService.search(q, locale, type);
  }
}
