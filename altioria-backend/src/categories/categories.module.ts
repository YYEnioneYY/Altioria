import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [StorageModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}