import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PublishGateService } from './publish-gate.service';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
  imports: [AuthModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService, PublishGateService],
  exports: [PublishGateService],
})
export class SuggestionsModule {}
