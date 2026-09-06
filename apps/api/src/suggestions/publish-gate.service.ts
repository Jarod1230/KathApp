import { Injectable } from '@nestjs/common';
import type { PublishGateCode, PublicEntityKind } from '@kathapp/shared';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { evaluatePublishGates, loadEntityStatus } from './publish-gates';

@Injectable()
export class PublishGateService {
  constructor(private readonly prisma: PrismaService) {}

  evaluate(
    entityType: PublicEntityKind,
    entityId: string,
  ): Promise<PublishGateCode[]> {
    return evaluatePublishGates(this.prisma, entityType, entityId);
  }

  status(
    entityType: PublicEntityKind,
    entityId: string,
  ): Promise<PublishStatus | null> {
    return loadEntityStatus(this.prisma, entityType, entityId);
  }
}
