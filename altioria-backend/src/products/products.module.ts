import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    AuthModule,
    StorageModule,
  ],
  controllers: [
    AdminProductsController,
  ],
  providers: [
    ProductsService,
  ],
})
export class ProductsModule {}