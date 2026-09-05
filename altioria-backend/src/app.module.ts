import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    PrismaModule,
    AuthModule,
    StorageModule,
    CategoriesModule,
  ],
})
export class AppModule {}