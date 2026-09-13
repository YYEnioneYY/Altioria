import {
  Controller,
  Get,
  Header,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

type HealthServiceStatus = 'up' | 'down';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: HealthServiceStatus;
    storage: HealthServiceStatus;
  };
}

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Проверить готовность API, PostgreSQL и MinIO',
  })
  @ApiOkResponse({
    description: 'Все необходимые сервисы доступны',
  })
  @ApiServiceUnavailableResponse({
    description: 'PostgreSQL или MinIO недоступен',
  })
  async check(): Promise<HealthResponse> {
    const [databaseResult, storageResult] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.storageService.checkHealth(),
    ]);

    const response: HealthResponse = {
      status:
        databaseResult.status === 'fulfilled' &&
        storageResult.status === 'fulfilled'
          ? 'ok'
          : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: databaseResult.status === 'fulfilled' ? 'up' : 'down',
        storage: storageResult.status === 'fulfilled' ? 'up' : 'down',
      },
    };

    if (response.status === 'error') {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}