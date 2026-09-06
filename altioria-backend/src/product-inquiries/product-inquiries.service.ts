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
    const product =
      await this.prisma.product.findFirst({
        where: {
          id: dto.productId,
          isPublished: true,

          category: {
            isPublished: true,
          },
        },
        select: {
          id: true,
          nameRu: true,
          nameEn: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }

    const variant = dto.variantId
      ? await this.prisma.productVariant.findFirst({
          where: {
            id: dto.variantId,
            productId: product.id,
            isPublished: true,
          },
          select: {
            id: true,
            nameRu: true,
            nameEn: true,
          },
        })
      : null;

    if (dto.variantId && !variant) {
      throw new NotFoundException(
        'Исполнение товара не найдено',
      );
    }

    try {
      await this.emailService.sendProductInquiry({
        customerName: dto.name,
        customerEmail: dto.email,
        customerPhone: dto.phone,
        questions:
          dto.questions || null,

        productId: product.id,
        productNameRu: product.nameRu,
        productNameEn: product.nameEn,

        variantId:
          variant?.id ?? null,
        variantNameRu:
          variant?.nameRu ?? null,
        variantNameEn:
          variant?.nameEn ?? null,
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