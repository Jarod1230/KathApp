import { Module } from '@nestjs/common';
import { V1Controller } from './v1.controller';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { EntitiesService } from './entities.service';
import { SaintsController } from './saints.controller';
import { MiraclesController } from './miracles.controller';
import { SourcesController } from './sources.controller';

@Module({
  controllers: [
    V1Controller,
    SearchController,
    SaintsController,
    MiraclesController,
    SourcesController,
  ],
  providers: [SearchService, EntitiesService],
})
export class V1Module {}
