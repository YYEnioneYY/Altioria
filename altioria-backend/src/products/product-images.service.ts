import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

import { AdminProductImageResponseDto } from './dto/admin-product-response.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';

const adminProductImageSelect = {
  id: true,
  productId: true,
  imageKey: true,
  altRu: true,
  altEn: true,
  sortOrder: true,
} satisfies Prisma.ProductImageSelect;

type AdminProductImageRecord =
  Prisma.ProductImageGetPayload<{
    select:
      typeof adminProductImageSelect;
  }>;

@Injectable()
export class ProductImagesService {
  private readonly logger = new Logger(
    ProductImagesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async reorder(
    productId: string,
    dto: ReorderProductImagesDto,
  ): Promise<AdminProductImageResponseDto[]> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          images: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }

    const existingImageIds =
      new Set(
        product.images.map(
          (image) => image.id,
        ),
      );

    const requestedImageIds =
      new Set(dto.imageIds);

    const containsAllImages =
      existingImageIds.size ===
        requestedImageIds.size &&
      dto.imageIds.every((imageId) =>
        existingImageIds.has(imageId),
      );

    if (!containsAllImages) {
      throw new BadRequestException(
        'Передайте все изображения товара ровно по одному разу',
      );
    }

    try {
      await this.prisma.$transaction(
        dto.imageIds.map(
          (imageId, index) =>
            this.prisma.productImage.update({
              where: {
                id: imageId,
              },
              data: {
                sortOrder:
                  (index + 1) * 10,
              },
            }),
        ),
      );
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Одно из изображений не найдено',
        );
      }

      throw error;
    }

    const images =
      await this.prisma.productImage.findMany({
        where: {
          productId,
        },
        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            createdAt: 'asc',
          },
        ],
        select:
          adminProductImageSelect,
      });

    return images.map((image) =>
      this.toAdminResponse(image),
    );
  }

  async remove(
    productId: string,
    imageId: string,
  ): Promise<void> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          isPublished: true,

          images: {
            where: {
              id: imageId,
            },
            take: 1,
            select: {
              id: true,
              imageKey: true,
            },
          },

          _count: {
            select: {
              images: true,
            },
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }

    const image = product.images[0];

    if (!image) {
      throw new NotFoundException(
        'Изображение товара не найдено',
      );
    }

    if (
      product.isPublished &&
      product._count.images === 1
    ) {
      throw new BadRequestException(
        'Нельзя удалить единственное изображение опубликованного товара',
      );
    }

    try {
      await this.prisma.productImage.delete({
        where: {
          id: image.id,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Изображение товара не найдено',
        );
      }

      throw error;
    }

    await this.deleteImageSafely(
      image.imageKey,
    );
  }

  private toAdminResponse(
    image: AdminProductImageRecord,
  ): AdminProductImageResponseDto {
    return {
      id: image.id,
      imageUrl:
        this.storageService.getPublicUrl(
          image.imageKey,
        ),
      altRu: image.altRu,
      altEn: image.altEn,
      sortOrder: image.sortOrder,
    };
  }

  private async deleteImageSafely(
    imageKey: string,
  ): Promise<void> {
    try {
      await this.storageService.delete(
        imageKey,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.stack ??
            error.message
          : String(error);

      this.logger.error(
        `Не удалось удалить изображение "${imageKey}" из хранилища: ${message}`,
      );
    }
  }
}