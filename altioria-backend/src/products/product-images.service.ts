import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

import {
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

import { AdminProductImageResponseDto } from './dto/admin-product-image-response.dto';
import {
  MAX_PRODUCT_IMAGES_PER_VARIANT,
} from './constants/product-image.constants';

import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';

const ADMIN_PRODUCT_IMAGE_SELECT = {
  id: true,
  variantId: true,
  imagePath: true,
  altRu: true,
  altEn: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductImageSelect;

type AdminProductImageRecord =
  Prisma.ProductImageGetPayload<{
    select: typeof ADMIN_PRODUCT_IMAGE_SELECT;
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

  async findAllForAdmin(
    productId: string,
    variantId: string,
  ): Promise<AdminProductImageResponseDto[]> {
    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          images: {
            orderBy: [
              {
                sortOrder: 'asc',
              },
              {
                createdAt: 'asc',
              },
              {
                id: 'asc',
              },
            ],
            select: ADMIN_PRODUCT_IMAGE_SELECT,
          },
        },
      });

    if (!variant) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }

    return variant.images.map((image) =>
      this.toAdminResponse(image),
    );
  }

  async upload(
    productId: string,
    variantId: string,
    files: Express.Multer.File[],
  ): Promise<AdminProductImageResponseDto[]> {
    if (files.length === 0) {
      throw new BadRequestException(
        'Не передано ни одного изображения',
      );
    }

    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          id: true,

          _count: {
            select: {
              images: true,
            },
          },

          images: {
            orderBy: {
              sortOrder: 'desc',
            },
            take: 1,
            select: {
              sortOrder: true,
            },
          },
        },
      });

    if (!variant) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }

    const resultingImagesCount =
      variant._count.images + files.length;

    if (
      resultingImagesCount >
      MAX_PRODUCT_IMAGES_PER_VARIANT
    ) {
      throw new BadRequestException(
        `У варианта может быть не больше ${MAX_PRODUCT_IMAGES_PER_VARIANT} изображений`,
      );
    }

    const firstSortOrder =
      (variant.images[0]?.sortOrder ?? 0) + 10;

    const uploadedImages: Array<{
      imagePath: string;
      sortOrder: number;
    }> = [];

    try {
      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file = files[index];

        const optimizedImage =
          await this.optimizeImage(file);

        const imagePath =
          `products/${productId}/${variantId}/images/${randomUUID()}.webp`;

        await this.storageService.upload(
          imagePath,
          optimizedImage,
          'image/webp',
        );

        uploadedImages.push({
          imagePath,
          sortOrder:
            firstSortOrder + index * 10,
        });
      }

      const createdImages =
        await this.prisma.$transaction(
          uploadedImages.map((image) =>
            this.prisma.productImage.create({
              data: {
                variantId,
                imagePath: image.imagePath,
                sortOrder: image.sortOrder,
              },
              select:
                ADMIN_PRODUCT_IMAGE_SELECT,
            }),
          ),
        );

      return createdImages.map((image) =>
        this.toAdminResponse(image),
      );
    } catch (error: unknown) {
      await Promise.all(
        uploadedImages.map((image) =>
          this.deleteImageSafely(
            image.imagePath,
            'загрузка изображений завершилась ошибкой',
          ),
        ),
      );

      throw error;
    }
  }

  async reorder(
    productId: string,
    variantId: string,
    dto: ReorderProductImagesDto,
  ): Promise<AdminProductImageResponseDto[]> {
    const variant =
      await this.prisma.productVariant.findFirst({
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
        'Вариант товара не найден',
      );
    }
  
    const existingIds = new Set(
      variant.images.map((image) => image.id),
    );
  
    const requestedIds = new Set(dto.imageIds);
  
    const containsAllImages =
      requestedIds.size === existingIds.size &&
      dto.imageIds.every((id) =>
        existingIds.has(id),
      );
  
    if (!containsAllImages) {
      throw new BadRequestException(
        'Передан неполный или устаревший список изображений. Обновите страницу',
      );
    }
  
    try {
      await this.prisma.$transaction(
        dto.imageIds.map((id, index) =>
          this.prisma.productImage.update({
            where: {
              id,
            },
            data: {
              sortOrder: (index + 1) * 10,
            },
          }),
        ),
      );
    } catch (
      error: unknown
    ) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException(
          'Список изображений изменился. Обновите страницу',
        );
      }
  
      throw error;
    }
  
    return this.findAllForAdmin(
      productId,
      variantId,
    );
  }
  
  async remove(
    productId: string,
    variantId: string,
    imageId: string,
  ): Promise<void> {
    const image =
      await this.prisma.productImage.findFirst({
        where: {
          id: imageId,
          variantId,
  
          variant: {
            productId,
          },
        },
        select: {
          id: true,
          imagePath: true,
  
          variant: {
            select: {
              isPublished: true,
  
              _count: {
                select: {
                  images: true,
                },
              },
            },
          },
        },
      });
  
    if (!image) {
      throw new NotFoundException(
        'Изображение товара не найдено',
      );
    }
  
    if (
      image.variant.isPublished &&
      image.variant._count.images <= 1
    ) {
      throw new BadRequestException(
        'Нельзя удалить последнее изображение опубликованного варианта',
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
      image.imagePath,
      'изображение было удалено из варианта товара',
    );
  }

  private async optimizeImage(
    file: Express.Multer.File,
  ): Promise<Buffer> {
    try {
      return await sharp(file.buffer, {
        limitInputPixels: 40_000_000,
        failOn: 'error',
      })
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 4,
        })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        `Не удалось обработать изображение "${file.originalname}"`,
      );
    }
  }

  private async deleteImageSafely(
    imagePath: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.storageService.delete(imagePath);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.stack ?? error.message
          : String(error);

      this.logger.error(
        `Не удалось удалить изображение "${imagePath}": ${reason}`,
        message,
      );
    }
  }

  private toAdminResponse(
    image: AdminProductImageRecord,
  ): AdminProductImageResponseDto {
    return {
      id: image.id,
      variantId: image.variantId,
      imageUrl:
        this.storageService.getPublicUrl(
          image.imagePath,
        ),
      altRu: image.altRu,
      altEn: image.altEn,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }
}