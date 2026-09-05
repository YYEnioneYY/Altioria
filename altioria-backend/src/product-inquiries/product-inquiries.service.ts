import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInquiryDto } from './dto/create-product-inquiry.dto';
import { ProductInquiryResponseDto } from './dto/product-inquiry-response.dto';

@Injectable()
export class ProductInquiriesService {
  private readonly logger = new Logger(
    ProductInquiriesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(
    dto: CreateProductInquiryDto,
  ): Promise<ProductInquiryResponseDto> {
    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: dto.variantId,
          productId: dto.productId,
          isPublished: true,
          product: {
            isPublished: true,
            category: {
              isPublished: true,
            },
          },
        },
        select: {
          id: true,
          slug: true,
          labelRu: true,
          labelEn: true,
          product: {
            select: {
              id: true,
              nameRu: true,
              nameEn: true,
            },
          },
        },
      });

    if (!variant) {
      throw new NotFoundException(
        'Товар или его вариант не найден',
      );
    }

    try {
      await this.emailService.sendProductInquiry({
        customerName: dto.name,
        customerEmail: dto.email,
        customerPhone: dto.phone,
        questions: dto.questions || null,

        productId: variant.product.id,
        productNameRu: variant.product.nameRu,
        productNameEn: variant.product.nameEn,

        variantId: variant.id,
        variantNameRu:
          variant.labelRu ?? 'Основной вариант',
        variantNameEn:
          variant.labelEn ?? 'Default variant',
      });
    } catch (error: unknown) {
      this.logger.error(
        'Не удалось отправить заявку через Resend',
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new ServiceUnavailableException(
        'Не удалось отправить заявку. Попробуйте позже',
      );
    }

    return {
      success: true,
    };
  }
}