import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SEARCH_DEFAULT_LIMIT, SEARCH_MAX_LIMIT, SearchResponse } from '@kathapp/shared';
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
  @ApiQuery({
    name: 'limit',
    required: false,
    description: `Page size, ${1}-${SEARCH_MAX_LIMIT}, default ${SEARCH_DEFAULT_LIMIT}. Out-of-range values are clamped (ADR 0004).`,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of results to skip, default 0. Negative values are clamped.',
  })
  @ApiOkResponse({
    description:
      'Published entity search. `total` counts every match, independent of the page.',
  })
  search(
    @Query('q') q?: string,
    @Query('locale') locale?: string,
    @Query('type') type?: string,
    // Taken as raw strings: SearchService clamps them, and ADR 0004 says a
    // malformed page cursor must not turn into a 400.
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<SearchResponse> {
    return this.searchService.search({ q, locale, type, limit, offset });
  }
}
