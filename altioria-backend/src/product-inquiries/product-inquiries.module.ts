import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { ProductInquiriesController } from './product-inquiries.controller';
import { ProductInquiriesService } from './product-inquiries.service';

@Module({
  imports: [EmailModule],
  controllers: [ProductInquiriesController],
  providers: [ProductInquiriesService],
})
export class ProductInquiriesModule {}