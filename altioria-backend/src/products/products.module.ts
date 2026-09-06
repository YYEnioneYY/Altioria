import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';

import { AdminProductImagesController } from './admin-product-images.controller';
import { ProductImagesService } from './product-images.service';

import { AdminProductFilesController } from './admin-product-files.controller';
import { ProductFilesService } from './product-files.service';

@Module({
  imports: [
    AuthModule,
    StorageModule,
  ],
  controllers: [
    AdminProductsController,
    AdminProductImagesController,
    AdminProductFilesController,
  ],
  providers: [
    ProductsService,
    ProductImagesService,
    ProductFilesService,
  ],
})
export class ProductsModule {}