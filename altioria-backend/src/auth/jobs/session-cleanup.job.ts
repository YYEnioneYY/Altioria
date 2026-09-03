import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionCleanupJob
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(
    SessionCleanupJob.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.deleteExpiredSessions();
  }

  @Cron('0 0 3 * * 0', {
    name: 'expired-admin-sessions-cleanup',
    timeZone: 'UTC',
    waitForCompletion: true,
  })
  async handleCleanup(): Promise<void> {
    await this.deleteExpiredSessions();
  }

  private async deleteExpiredSessions(): Promise<void> {
    const result =
      await this.prisma.adminSession.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });

    if (result.count > 0) {
      this.logger.log(
        `Удалено истёкших сессий: ${result.count}`,
      );
    }
  }
}