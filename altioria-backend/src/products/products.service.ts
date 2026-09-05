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

import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';

import { UpdateProductDto } from './dto/update-product.dto';

import { ContentLocale } from '../common/enums/content-locale.enum';

import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { GetProductQueryDto } from './dto/get-product-query.dto';
import { ProductCardResponseDto } from './dto/product-card-response.dto';
import { ProductDetailsResponseDto } from './dto/product-details-response.dto';

import { ReorderProductsDto } from './dto/reorder-products.dto';

const ADMIN_PRODUCT_SELECT = {
  id: true,
  categoryId: true,
  slug: true,
  nameRu: true,
  nameEn: true,
  descriptionRu: true,
  descriptionEn: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,

  category: {
    select: {
      id: true,
      slug: true,
      nameRu: true,
      nameEn: true,
    },
  },

  _count: {
    select: {
      variants: true,
    },
  },
} satisfies Prisma.ProductSelect;

type AdminProductRecord =
  Prisma.ProductGetPayload<{
    select: typeof ADMIN_PRODUCT_SELECT;
  }>;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(
    ProductsService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAllForAdmin():
    Promise<AdminProductResponseDto[]> {
    const products =
      await this.prisma.product.findMany({
        orderBy: [
          {
            category: {
              sortOrder: 'asc',
            },
          },
          {
            sortOrder: 'asc',
          },
          {
            slug: 'asc',
          },
        ],
        select: ADMIN_PRODUCT_SELECT,
      });

    return products.map((product) =>
      this.toAdminResponse(product),
    );
  }

  async findOneForAdmin(
    id: string,
  ): Promise<AdminProductResponseDto> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
        select: ADMIN_PRODUCT_SELECT,
      });

    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }

    return this.toAdminResponse(product);
  }

  async create(
    dto: CreateProductDto,
  ): Promise<AdminProductResponseDto> {
    const category =
      await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
        select: {
          id: true,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Категория не найдена',
      );
    }

    const existingProduct =
      await this.prisma.product.findUnique({
        where: {
          slug: dto.slug,
        },
        select: {
          id: true,
        },
      });

    if (existingProduct) {
      throw new ConflictException(
        `Товар со slug "${dto.slug}" уже существует`,
      );
    }

    try {
      const product =
        await this.prisma.product.create({
          data: {
            categoryId: dto.categoryId,
            slug: dto.slug,
            nameRu: dto.nameRu,
            nameEn: dto.nameEn,
            descriptionRu:
              dto.descriptionRu ?? null,
            descriptionEn:
              dto.descriptionEn ?? null,
            sortOrder: dto.sortOrder ?? 0,
            isPublished: false,
          },
          select: ADMIN_PRODUCT_SELECT,
        });

      return this.toAdminResponse(product);
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Товар со slug "${dto.slug}" уже существует`,
          );
        }

        if (error.code === 'P2003') {
          throw new NotFoundException(
            'Категория не найдена',
          );
        }
      }

      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<AdminProductResponseDto> {
    const existingProduct =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          isPublished: true,
      
          variants: {
            where: {
              isDefault: true,
            },
            take: 1,
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
  
    if (!existingProduct) {
      throw new NotFoundException(
        'Товар не найден',
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
  
    if (dto.categoryId !== undefined) {
      const category =
        await this.prisma.category.findUnique({
          where: {
            id: dto.categoryId,
          },
          select: {
            id: true,
          },
        });
      
      if (!category) {
        throw new NotFoundException(
          'Категория не найдена',
        );
      }
    }
  
    const resultingIsPublished =
      dto.isPublished ??
      existingProduct.isPublished;
  
    if (resultingIsPublished) {
      const defaultVariant =
        existingProduct.variants[0];
  
      if (!defaultVariant) {
        throw new BadRequestException(
          'Нельзя опубликовать товар без основного варианта',
        );
      }
  
      if (!defaultVariant.isPublished) {
        throw new BadRequestException(
          'Сначала опубликуйте основной вариант товара',
        );
      }
  
      if (defaultVariant._count.images === 0) {
        throw new BadRequestException(
          'Основной вариант должен иметь изображение',
        );
      }
    }
  
    try {
      const product =
        await this.prisma.product.update({
          where: {
            id,
          },
          data: {
            ...(dto.categoryId !== undefined
              ? {
                  categoryId: dto.categoryId,
                }
              : {}),
              
            ...(dto.slug !== undefined
              ? {
                  slug: dto.slug,
                }
              : {}),
              
            ...(dto.nameRu !== undefined
              ? {
                  nameRu: dto.nameRu,
                }
              : {}),
              
            ...(dto.nameEn !== undefined
              ? {
                  nameEn: dto.nameEn,
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
          },
          select: ADMIN_PRODUCT_SELECT,
        });
      
      return this.toAdminResponse(product);
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Товар со slug "${dto.slug}" уже существует`,
          );
        }
      
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'Категория не найдена',
          );
        }
      
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Товар не найден',
          );
        }
      }
  
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          isPublished: true,
  
          variants: {
            select: {
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
          },
        },
      });
  
    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }
  
    if (product.isPublished) {
      throw new BadRequestException(
        'Сначала снимите товар с публикации',
      );
    }
  
    const storagePaths = [
      ...new Set(
        product.variants.flatMap((variant) => [
          ...variant.images.map(
            (image) => image.imagePath,
          ),
          ...variant.files.map(
            (file) => file.filePath,
          ),
        ]),
      ),
    ];
  
    try {
      await this.prisma.product.delete({
        where: {
          id,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Товар не найден',
          );
        }
  
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Нельзя удалить товар, пока с ним связаны другие данные',
          );
        }
      }
  
      throw error;
    }
  
    await Promise.all(
      storagePaths.map((path) =>
        this.deleteStoredObjectSafely(
          path,
          'товар был удалён',
        ),
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

  async findAll(
    query: GetProductsQueryDto,
  ): Promise<ProductCardResponseDto[]> {
    const locale =
      query.locale ?? ContentLocale.RU;
  
    const isEnglish =
      locale === ContentLocale.EN;
  
    const products =
      await this.prisma.product.findMany({
        where: {
          isPublished: true,
  
          category: {
            isPublished: true,
  
            ...(query.category
              ? {
                  slug: query.category,
                }
              : {}),
          },
  
          variants: {
            some: {
              isDefault: true,
              isPublished: true,
  
              images: {
                some: {},
              },
            },
          },
        },
  
        orderBy: [
          {
            category: {
              sortOrder: 'asc',
            },
          },
          {
            sortOrder: 'asc',
          },
          {
            slug: 'asc',
          },
        ],
  
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
  
          category: {
            select: {
              slug: true,
              nameRu: true,
              nameEn: true,
            },
          },
  
          variants: {
            where: {
              isDefault: true,
              isPublished: true,
            },
            take: 1,
            select: {
              images: {
                orderBy: [
                  {
                    sortOrder: 'asc',
                  },
                  {
                    createdAt: 'asc',
                  },
                ],
                take: 1,
                select: {
                  imagePath: true,
                },
              },
            },
          },
        },
      });
  
    return products.flatMap((product) => {
      const imagePath =
        product.variants[0]
          ?.images[0]
          ?.imagePath;
  
      if (!imagePath) {
        return [];
      }
  
      return [
        {
          id: product.id,
          slug: product.slug,
          name: isEnglish
            ? product.nameEn
            : product.nameRu,
          imageUrl:
            this.storageService.getPublicUrl(
              imagePath,
            ),
          category: {
            slug: product.category.slug,
            name: isEnglish
              ? product.category.nameEn
              : product.category.nameRu,
          },
        },
      ];
    });
  }

  async findOne(
    slug: string,
    query: GetProductQueryDto,
  ): Promise<ProductDetailsResponseDto> {
    const locale =
      query.locale ?? ContentLocale.RU;
  
    const isEnglish =
      locale === ContentLocale.EN;
  
    const product =
      await this.prisma.product.findFirst({
        where: {
          slug,
          isPublished: true,
  
          category: {
            isPublished: true,
          },
  
          variants: {
            some: {
              isDefault: true,
              isPublished: true,
  
              images: {
                some: {},
              },
            },
          },
        },
  
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
          descriptionRu: true,
          descriptionEn: true,
  
          category: {
            select: {
              slug: true,
              nameRu: true,
              nameEn: true,
            },
          },
  
          variants: {
            where: {
              isPublished: true,
  
              images: {
                some: {},
              },
            },
  
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
  
            select: {
              id: true,
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
              isDefault: true,
  
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
                select: {
                  id: true,
                  imagePath: true,
                  altRu: true,
                  altEn: true,
                },
              },
  
              files: {
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
                select: {
                  id: true,
                  type: true,
                  filePath: true,
                  originalName: true,
                  labelRu: true,
                  labelEn: true,
                  sizeBytes: true,
                },
              },
            },
          },
        },
      });
  
    if (!product) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }
  
    const productName = isEnglish
      ? product.nameEn
      : product.nameRu;
  
    const productDescription = isEnglish
      ? product.descriptionEn
      : product.descriptionRu;
  
    return {
      id: product.id,
      slug: product.slug,
      name: productName,
      description: productDescription,
  
      category: {
        slug: product.category.slug,
        name: isEnglish
          ? product.category.nameEn
          : product.category.nameRu,
      },
  
      variants: product.variants.map((variant) => {
        const label = isEnglish
          ? variant.labelEn
          : variant.labelRu;
  
        const description =
          (
            isEnglish
              ? variant.descriptionEn
              : variant.descriptionRu
          ) ?? productDescription;
  
        const materials = isEnglish
          ? variant.materialsEn
          : variant.materialsRu;
  
        const variantTitle = label
          ? `${productName} ${label}`
          : productName;
  
        return {
          id: variant.id,
          slug: variant.slug,
          label,
          description,
          heightMm: variant.heightMm,
          widthMm: variant.widthMm,
          depthMm: variant.depthMm,
          materials,
          isDefault: variant.isDefault,
  
          images: variant.images.map((image) => ({
            id: image.id,
            imageUrl:
              this.storageService.getPublicUrl(
                image.imagePath,
              ),
            alt:
              (
                isEnglish
                  ? image.altEn
                  : image.altRu
              ) ?? variantTitle,
          })),
  
          files: variant.files.map((file) => ({
            id: file.id,
            type: file.type,
            fileUrl:
              this.storageService.getPublicUrl(
                file.filePath,
              ),
            originalName: file.originalName,
            label: isEnglish
              ? file.labelEn
              : file.labelRu,
            sizeBytes: file.sizeBytes,
          })),
        };
      }),
    };
  }

  async reorder(dto: ReorderProductsDto): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: dto.categoryId,
      },
      select: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });
  
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
  
    const existingIds = new Set(
      category.products.map((product) => product.id),
    );
  
    const requestedIds = new Set(dto.productIds);
  
    const containsAllProducts =
      existingIds.size === requestedIds.size &&
      dto.productIds.every((id) => existingIds.has(id));
  
    if (!containsAllProducts) {
      throw new BadRequestException(
        'Необходимо передать все товары выбранной категории ровно по одному разу',
      );
    }
  
    await this.prisma.$transaction(
      dto.productIds.map((productId, index) =>
        this.prisma.product.update({
          where: {
            id: productId,
          },
          data: {
            sortOrder: (index + 1) * 10,
          },
        }),
      ),
    );
  }
  
  private toAdminResponse(
    product: AdminProductRecord,
  ): AdminProductResponseDto {
    return {
      id: product.id,
      categoryId: product.categoryId,
      slug: product.slug,
      nameRu: product.nameRu,
      nameEn: product.nameEn,
      descriptionRu: product.descriptionRu,
      descriptionEn: product.descriptionEn,
      sortOrder: product.sortOrder,
      isPublished: product.isPublished,

      category: {
        id: product.category.id,
        slug: product.category.slug,
        nameRu: product.category.nameRu,
        nameEn: product.category.nameEn,
      },

      variantsCount: product._count.variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}