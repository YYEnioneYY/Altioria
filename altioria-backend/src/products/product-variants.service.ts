import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import {
  Prisma,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { AdminProductVariantResponseDto } from './dto/admin-product-variant-response.dto';

import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

import { ReorderProductVariantsDto } from './dto/reorder-product-variants.dto';

import { ProductPriceType } from '../generated/prisma/client';

const ADMIN_PRODUCT_VARIANT_SELECT = {
  id: true,
  productId: true,
  slug: true,
  labelRu: true,
  labelEn: true,
  descriptionRu: true,
  descriptionEn: true,
  heightMm: true,
  widthMm: true,
  depthMm: true,
  materialsRu: true,
  materialsEn: true,

  priceType: true,
  priceAmount: true,
  priceCurrency: true,

  sortOrder: true,
  isDefault: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      images: true,
      files: true,
    },
  },
} satisfies Prisma.ProductVariantSelect;

type AdminProductVariantRecord =
  Prisma.ProductVariantGetPayload<{
    select:
      typeof ADMIN_PRODUCT_VARIANT_SELECT;
  }>;

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(
    ProductVariantsService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAllForAdmin(
    productId: string,
  ): Promise<AdminProductVariantResponseDto[]> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          variants: {
            orderBy: [
              {
                isDefault: 'desc',
              },
              {
                sortOrder: 'asc',
              },
              {
                slug: 'asc',
              },
            ],
            select:
              ADMIN_PRODUCT_VARIANT_SELECT,
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }

    return product.variants.map((variant) =>
      this.toAdminResponse(variant),
    );
  }

  async findOneForAdmin(
    productId: string,
    variantId: string,
  ): Promise<AdminProductVariantResponseDto> {
    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select:
          ADMIN_PRODUCT_VARIANT_SELECT,
      });

    if (!variant) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }

    return this.toAdminResponse(variant);
  }

  async create(
    productId: string,
    dto: CreateProductVariantDto,
  ): Promise<AdminProductVariantResponseDto> {
    try {
      const variant =
        await this.prisma.$transaction(
          async (transaction) => {
            const product =
              await transaction.product.findUnique({
                where: {
                  id: productId,
                },
                select: {
                  id: true,
                },
              });

            if (!product) {
              throw new NotFoundException(
                'Товар не найден',
              );
            }

            const existingVariant =
              await transaction.productVariant.findUnique({
                where: {
                  productId_slug: {
                    productId,
                    slug: dto.slug,
                  },
                },
                select: {
                  id: true,
                },
              });

            if (existingVariant) {
              throw new ConflictException(
                `Вариант со slug "${dto.slug}" уже существует`,
              );
            }

            const lastVariant =
              await transaction.productVariant.findFirst({
                where: {
                  productId,
                },
                orderBy: {
                  sortOrder: 'desc',
                },
                select: {
                  sortOrder: true,
                },
              });

            const isFirstVariant =
              lastVariant === null;

            const sortOrder =
              dto.sortOrder ??
              (lastVariant?.sortOrder ?? 0) + 10;
            
            const price = this.resolvePrice(dto);

            return transaction.productVariant.create({
              data: {
                productId,
                slug: dto.slug,
                labelRu: dto.labelRu ?? null,
                labelEn: dto.labelEn ?? null,
                descriptionRu:
                  dto.descriptionRu ?? null,
                descriptionEn:
                  dto.descriptionEn ?? null,
                heightMm: dto.heightMm ?? null,
                widthMm: dto.widthMm ?? null,
                depthMm: dto.depthMm ?? null,
                materialsRu:
                  dto.materialsRu ?? null,
                materialsEn:
                  dto.materialsEn ?? null,
                sortOrder,
                isDefault: isFirstVariant,
                isPublished: false,
                ...price,
              },
              select:
                ADMIN_PRODUCT_VARIANT_SELECT,
            });
          },
        );

      return this.toAdminResponse(variant);
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Вариант со slug "${dto.slug}" уже существует`,
          );
        }

        if (error.code === 'P2003') {
          throw new NotFoundException(
            'Товар не найден',
          );
        }
      }

      throw error;
    }
  }

  async update(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<AdminProductVariantResponseDto> {
    const existingVariant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          id: true,
          isDefault: true,
          isPublished: true,

          priceType: true,
          priceAmount: true,
          priceCurrency: true,
  
          product: {
            select: {
              isPublished: true,
            },
          },
  
          _count: {
            select: {
              images: true,
            },
          },
        },
      });
  
    if (!existingVariant) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }
  
    const hasChanges = Object.values(dto).some(
      (value) => value !== undefined,
    );
  
    if (!hasChanges) {
      throw new BadRequestException(
        'Не передано ни одного изменения',
      );
    }
  
    const resultingIsPublished =
      dto.isPublished ??
      existingVariant.isPublished;
  
    if (
      resultingIsPublished &&
      existingVariant._count.images === 0
    ) {
      throw new BadRequestException(
        'Нельзя опубликовать вариант без изображения',
      );
    }
  
    if (
      existingVariant.product.isPublished &&
      existingVariant.isDefault &&
      !resultingIsPublished
    ) {
      throw new BadRequestException(
        'Нельзя скрыть основной вариант опубликованного товара',
      );
    }

    const hasPriceChanges =
      dto.priceType !== undefined ||
      dto.priceAmount !== undefined ||
      dto.priceCurrency !== undefined;

    const price = hasPriceChanges
      ? this.resolvePrice(dto, existingVariant)
      : {};
  
    try {
      const variant =
        await this.prisma.productVariant.update({
          where: {
            id: variantId,
          },
          data: {
            ...(dto.slug !== undefined
              ? {
                  slug: dto.slug,
                }
              : {}),
  
            ...(dto.labelRu !== undefined
              ? {
                  labelRu: dto.labelRu,
                }
              : {}),
  
            ...(dto.labelEn !== undefined
              ? {
                  labelEn: dto.labelEn,
                }
              : {}),
  
            ...(dto.descriptionRu !== undefined
              ? {
                  descriptionRu:
                    dto.descriptionRu,
                }
              : {}),
  
            ...(dto.descriptionEn !== undefined
              ? {
                  descriptionEn:
                    dto.descriptionEn,
                }
              : {}),
  
            ...(dto.heightMm !== undefined
              ? {
                  heightMm: dto.heightMm,
                }
              : {}),
  
            ...(dto.widthMm !== undefined
              ? {
                  widthMm: dto.widthMm,
                }
              : {}),
  
            ...(dto.depthMm !== undefined
              ? {
                  depthMm: dto.depthMm,
                }
              : {}),
  
            ...(dto.materialsRu !== undefined
              ? {
                  materialsRu:
                    dto.materialsRu,
                }
              : {}),
  
            ...(dto.materialsEn !== undefined
              ? {
                  materialsEn:
                    dto.materialsEn,
                }
              : {}),
  
            ...(dto.sortOrder !== undefined
              ? {
                  sortOrder: dto.sortOrder,
                }
              : {}),
  
            ...(dto.isPublished !== undefined
              ? {
                  isPublished:
                    dto.isPublished,
                }
              : {}),
              ...price,
          },
          select:
            ADMIN_PRODUCT_VARIANT_SELECT,
        });
  
      return this.toAdminResponse(variant);
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Вариант со slug "${dto.slug}" уже существует`,
          );
        }
  
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Вариант товара не найден',
          );
        }
      }
  
      throw error;
    }
  }

  async makeDefault(
    productId: string,
    variantId: string,
  ): Promise<AdminProductVariantResponseDto> {
    const candidate =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          ...ADMIN_PRODUCT_VARIANT_SELECT,
  
          product: {
            select: {
              isPublished: true,
            },
          },
        },
      });
  
    if (!candidate) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }
  
    if (candidate.isDefault) {
      return this.toAdminResponse(candidate);
    }
  
    if (
      candidate.product.isPublished &&
      !candidate.isPublished
    ) {
      throw new BadRequestException(
        'Основным вариантом опубликованного товара может быть только опубликованный вариант',
      );
    }
  
    if (
      candidate.product.isPublished &&
      candidate._count.images === 0
    ) {
      throw new BadRequestException(
        'Основной вариант опубликованного товара должен иметь изображение',
      );
    }
  
    try {
      const variant =
        await this.prisma.$transaction(
          async (transaction) => {
            await transaction.productVariant.updateMany({
              where: {
                productId,
                isDefault: true,
              },
              data: {
                isDefault: false,
              },
            });
  
            return transaction.productVariant.update({
              where: {
                id: variantId,
              },
              data: {
                isDefault: true,
              },
              select:
                ADMIN_PRODUCT_VARIANT_SELECT,
            });
          },
        );
  
      return this.toAdminResponse(variant);
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Вариант товара не найден',
        );
      }
  
      throw error;
    }
  }

  async remove(
    productId: string,
    variantId: string,
  ): Promise<void> {
    let storagePaths: string[];
  
    try {
      storagePaths =
        await this.prisma.$transaction(
          async (transaction) => {
            const variant =
              await transaction.productVariant.findFirst({
                where: {
                  id: variantId,
                  productId,
                },
                select: {
                  id: true,
                  isDefault: true,
  
                  product: {
                    select: {
                      isPublished: true,
                    },
                  },
  
                  images: {
                    select: {
                      imagePath: true,
                    },
                  },
  
                  files: {
                    select: {
                      filePath: true,
                    },
                  },
                },
              });
  
            if (!variant) {
              throw new NotFoundException(
                'Вариант товара не найден',
              );
            }
  
            if (
              variant.product.isPublished &&
              variant.isDefault
            ) {
              throw new BadRequestException(
                'Нельзя удалить основной вариант опубликованного товара. Сначала назначьте другой основной вариант',
              );
            }
  
            let replacementVariantId:
              | string
              | null = null;
  
            if (variant.isDefault) {
              const replacementVariant =
                await transaction.productVariant.findFirst({
                  where: {
                    productId,
                    id: {
                      not: variantId,
                    },
                  },
                  orderBy: [
                    {
                      isPublished: 'desc',
                    },
                    {
                      sortOrder: 'asc',
                    },
                    {
                      createdAt: 'asc',
                    },
                  ],
                  select: {
                    id: true,
                  },
                });
  
              replacementVariantId =
                replacementVariant?.id ?? null;
            }
  
            await transaction.productVariant.delete({
              where: {
                id: variantId,
              },
            });
  
            if (replacementVariantId) {
              await transaction.productVariant.update({
                where: {
                  id: replacementVariantId,
                },
                data: {
                  isDefault: true,
                },
              });
            }
  
            return [
              ...variant.images.map(
                (image) => image.imagePath,
              ),
              ...variant.files.map(
                (file) => file.filePath,
              ),
            ];
          },
        );
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Вариант товара не найден',
        );
      }
  
      throw error;
    }
  
    await Promise.all(
      storagePaths.map((path) =>
        this.deleteStoredObjectSafely(
          path,
          'вариант товара был удалён',
        ),
      ),
    );
  }

  async reorder(
    productId: string,
    dto: ReorderProductVariantsDto,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        variants: {
          select: {
            id: true,
          },
        },
      },
    });
  
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }
  
    const existingIds = new Set(
      product.variants.map((variant) => variant.id),
    );
  
    const requestedIds = new Set(dto.variantIds);
  
    const containsAllVariants =
      existingIds.size === requestedIds.size &&
      dto.variantIds.every((id) => existingIds.has(id));
  
    if (!containsAllVariants) {
      throw new BadRequestException(
        'Необходимо передать все варианты товара ровно по одному разу',
      );
    }
  
    await this.prisma.$transaction(
      dto.variantIds.map((variantId, index) =>
        this.prisma.productVariant.update({
          where: {
            id: variantId,
          },
          data: {
            sortOrder: (index + 1) * 10,
          },
        }),
      ),
    );
  }

  private async deleteStoredObjectSafely(
    path: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.storageService.delete(path);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.stack ?? error.message
          : String(error);
  
      this.logger.error(
        `Не удалось удалить объект "${path}": ${reason}`,
        message,
      );
    }
  }

  private resolvePrice(
    dto: {
      priceType?: ProductPriceType;
      priceAmount?: string;
      priceCurrency?: string;
    },
    current?: {
      priceType: ProductPriceType;
      priceAmount: { toString(): string } | null;
      priceCurrency: string | null;
    },
  ): {
    priceType: ProductPriceType;
    priceAmount: string | null;
    priceCurrency: string | null;
  } {
    const priceType =
      dto.priceType ??
      current?.priceType ??
      ProductPriceType.ON_REQUEST;
  
    if (priceType === ProductPriceType.ON_REQUEST) {
      if (
        dto.priceAmount !== undefined ||
        dto.priceCurrency !== undefined
      ) {
        throw new BadRequestException(
          'Для цены по запросу нельзя указывать стоимость и валюту',
        );
      }
  
      return {
        priceType,
        priceAmount: null,
        priceCurrency: null,
      };
    }
  
    const priceAmount =
      dto.priceAmount ?? current?.priceAmount?.toString();
  
    const priceCurrency =
      dto.priceCurrency ?? current?.priceCurrency;
  
    if (!priceAmount || !priceCurrency) {
      throw new BadRequestException(
        'Для фиксированной цены необходимо указать priceAmount и priceCurrency',
      );
    }
  
    if (Number(priceAmount) <= 0) {
      throw new BadRequestException(
        'Стоимость товара должна быть больше нуля',
      );
    }
  
    return {
      priceType,
      priceAmount,
      priceCurrency,
    };
  }

  private toAdminResponse(
    variant: AdminProductVariantRecord,
  ): AdminProductVariantResponseDto {
    return {
      id: variant.id,
      productId: variant.productId,
      slug: variant.slug,
      labelRu: variant.labelRu,
      labelEn: variant.labelEn,
      descriptionRu: variant.descriptionRu,
      descriptionEn: variant.descriptionEn,
      heightMm: variant.heightMm,
      widthMm: variant.widthMm,
      depthMm: variant.depthMm,
      materialsRu: variant.materialsRu,
      materialsEn: variant.materialsEn,

      priceType: variant.priceType,
      priceAmount:
        variant.priceAmount?.toString() ?? null,
      priceCurrency: variant.priceCurrency,

      sortOrder: variant.sortOrder,
      isDefault: variant.isDefault,
      isPublished: variant.isPublished,
      imagesCount: variant._count.images,
      filesCount: variant._count.files,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}