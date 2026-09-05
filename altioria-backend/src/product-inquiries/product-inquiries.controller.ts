import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CreateProductInquiryDto } from './dto/create-product-inquiry.dto';
import { ProductInquiryResponseDto } from './dto/product-inquiry-response.dto';
import { ProductInquiriesService } from './product-inquiries.service';

@ApiTags('Product inquiries')
@Controller('product-inquiries')
export class ProductInquiriesController {
  constructor(
    private readonly productInquiriesService:
      ProductInquiriesService,
  ) {}

  @Post()
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Отправить заявку на товар',
  })
  @ApiCreatedResponse({
    type: ProductInquiryResponseDto,
  })
  create(
    @Body() dto: CreateProductInquiryDto,
  ): Promise<ProductInquiryResponseDto> {
    return this.productInquiriesService.create(dto);
  }
}