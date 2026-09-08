import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AdminProductVariantImageResponseDto } from './dto/admin-product-variant-response.dto';
import { ReorderProductVariantImagesDto } from './dto/reorder-product-variant-images.dto';

const VARIANT_IMAGE_SELECT = {
  id: true,
  imageKey: true,
  altRu: true,
  altEn: true,
  sortOrder: true,
} satisfies Prisma.ProductVariantImageSelect;

type VariantImageRecord =
  Prisma.ProductVariantImageGetPayload<{
    select: typeof VARIANT_IMAGE_SELECT;
  }>;

@Injectable()
export class ProductVariantImagesService {
  private readonly logger = new Logger(
    ProductVariantImagesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async reorder(
    productId: string,
    variantId: string,
    dto: ReorderProductVariantImagesDto,
  ): Promise<
    AdminProductVariantImageResponseDto[]
  > {
    const images = await this.prisma.$transaction(
      async (transaction) => {
        const variant =
          await transaction.productVariant.findFirst({
            where: {
              id: variantId,
              productId,
            },
            select: {
              images: {
                select: {
                  id: true,
                },
              },
            },
          });

        if (!variant) {
          throw new NotFoundException(
            'Исполнение товара не найдено',
          );
        }

        const currentImageIds = new Set(
          variant.images.map(
            (image) => image.id,
          ),
        );

        const containsEveryImage =
          dto.imageIds.length ===
            currentImageIds.size &&
          dto.imageIds.every((imageId) =>
            currentImageIds.has(imageId),
          );

        if (!containsEveryImage) {
          throw new BadRequestException(
            'Необходимо передать ID всех собственных изображений исполнения без пропусков и посторонних ID',
          );
        }

        await Promise.all(
          dto.imageIds.map((imageId, index) =>
            transaction.productVariantImage.update({
              where: {
                id: imageId,
              },
              data: {
                sortOrder: (index + 1) * 10,
              },
            }),
          ),
        );

        return transaction.productVariantImage.findMany({
          where: {
            variantId,
          },
          orderBy: [
            {
              sortOrder: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
          select: VARIANT_IMAGE_SELECT,
        });
      },
    );

    return images.map((image) =>
      this.toResponse(image),
    );
  }

  async remove(
    productId: string,
    variantId: string,
    imageId: string,
  ): Promise<void> {
    const image =
      await this.prisma.productVariantImage.findFirst({
        where: {
          id: imageId,
          variantId,

          variant: {
            productId,
          },
        },
        select: {
          id: true,
          imageKey: true,

          variant: {
            select: {
              isPublished: true,

              _count: {
                select: {
                  images: true,
                },
              },

              product: {
                select: {
                  _count: {
                    select: {
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!image) {
      throw new NotFoundException(
        'Изображение исполнения не найдено',
      );
    }

    const removingLastOwnImage =
      image.variant._count.images === 1;

    const productHasNoImages =
      image.variant.product._count.images === 0;

    if (
      image.variant.isPublished &&
      removingLastOwnImage &&
      productHasNoImages
    ) {
      throw new BadRequestException(
        'Нельзя оставить опубликованное исполнение без изображений',
      );
    }

    try {
      await this.prisma.productVariantImage.delete({
        where: {
          id: imageId,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Изображение исполнения не найдено',
        );
      }

      throw error;
    }

    /*
     * Сначала удаляем запись из БД.
     * Ошибка MinIO не должна возвращать старое
     * изображение обратно в базу.
     */
    try {
      await this.storageService.delete(
        image.imageKey,
      );
    } catch (error: unknown) {
      this.logger.warn(
        `Не удалось удалить изображение "${image.imageKey}" из хранилища`,
      );
    }
  }

  private toResponse(
    image: VariantImageRecord,
  ): AdminProductVariantImageResponseDto {
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
}