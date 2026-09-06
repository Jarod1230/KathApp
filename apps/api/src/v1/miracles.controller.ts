import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { EntityDetailResponse } from '@kathapp/shared';
import { EntitiesService } from './entities.service';

@ApiTags('v1-miracles')
@Controller('v1/miracles')
export class MiraclesController {
  constructor(private readonly entities: EntitiesService) {}

  @Get(':id')
  @ApiQuery({ name: 'locale', required: false, description: 'Content locale' })
  @ApiOkResponse({ description: 'Published miracle detail' })
  @ApiNotFoundResponse({ description: 'Not found, draft, or soft-deleted' })
  getOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ): Promise<EntityDetailResponse> {
    return this.entities.getDetail('miracle', id, locale);
  }
}
