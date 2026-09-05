import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductVariantsController } from './admin-product-variants.controller';
import { ProductsService } from './products.service';
import { ProductVariantsService } from './product-variants.service';

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
    ProductsController,
    AdminProductsController,
    AdminProductVariantsController,
    AdminProductImagesController,
    AdminProductFilesController,
  ],
  providers: [
    ProductsService,
    ProductVariantsService,
    ProductImagesService,
    ProductFilesService,
  ],
  exports: [
    ProductsService,
  ],
})
export class ProductsModule {}