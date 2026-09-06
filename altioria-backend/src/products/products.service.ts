import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  extname,
} from 'node:path';
import {
  randomUUID,
} from 'node:crypto';
import sharp from 'sharp';

import {
  Prisma,
  ProductFileType,
  ProductPriceType,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

import {
  MAX_PRODUCT_FILES,
  MAX_PRODUCT_FILE_SIZE,
  MAX_PRODUCT_IMAGES,
  MAX_PRODUCT_IMAGE_SIZE,
  PRODUCT_IMAGE_MIME_TYPES,
} from './constants/product-upload.constants';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminProductResponseDto } from './dto/admin-product-response.dto';

import { UpdateProductDto } from './dto/update-product.dto';

const adminProductSelect = {
  id: true,
  categoryId: true,
  slug: true,
  nameRu: true,
  nameEn: true,
  descriptionRu: true,
  descriptionEn: true,
  materialsRu: true,
  materialsEn: true,
  heightMm: true,
  widthMm: true,
  depthMm: true,
  priceType: true,
  priceAmount: true,
  priceCurrency: true,
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

  images: {
    orderBy: [
      {
        sortOrder: 'asc' as const,
      },
      {
        createdAt: 'asc' as const,
      },
    ],
    select: {
      id: true,
      imageKey: true,
      altRu: true,
      altEn: true,
      sortOrder: true,
    },
  },

  files: {
    orderBy: [
      {
        sortOrder: 'asc' as const,
      },
      {
        createdAt: 'asc' as const,
      },
    ],
    select: {
      id: true,
      type: true,
      fileKey: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      labelRu: true,
      labelEn: true,
      sortOrder: true,
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
    select: typeof adminProductSelect;
  }>;

interface ProductUploads {
  images: Express.Multer.File[];
  files: Express.Multer.File[];
}

interface ProductPriceInput {
  priceType?: ProductPriceType;
  priceAmount?: string;
  priceCurrency?: string;
}

interface CurrentProductPrice {
  priceType: ProductPriceType;
  priceAmount: {
    toString(): string;
  } | null;
  priceCurrency: string | null;
}

interface PreparedProductFile {
  file: Express.Multer.File;
  type: ProductFileType;
  extension: string;
  contentType: string;
}

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
        select: adminProductSelect,
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
        select: adminProductSelect,
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
    uploads: ProductUploads,
  ): Promise<AdminProductResponseDto> {
    this.validateImages(
      uploads.images,
      true,
    );

    const preparedFiles =
      uploads.files.map((file) =>
        this.prepareProductFile(file),
      );

    const price =
      this.resolvePrice(dto);

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

    const productId = randomUUID();
    const uploadedKeys: string[] = [];

    try {
      const images: Prisma.ProductImageCreateWithoutProductInput[] = [];

      for (
        let index = 0;
        index < uploads.images.length;
        index += 1
      ) {
        const image =
          uploads.images[index];

        const optimizedImage =
          await this.optimizeImage(
            image.buffer,
          );

        const imageKey =
          `products/${productId}/images/${randomUUID()}.webp`;

        await this.storageService.upload(
          imageKey,
          optimizedImage,
          'image/webp',
        );

        uploadedKeys.push(imageKey);

        images.push({
          imageKey,
          altRu: null,
          altEn: null,
          sortOrder: (index + 1) * 10,
        });
      }

      const files: Prisma.ProductFileCreateWithoutProductInput[] = [];

      for (
        let index = 0;
        index < preparedFiles.length;
        index += 1
      ) {
        const prepared =
          preparedFiles[index];

        const fileKey =
          `products/${productId}/files/${randomUUID()}${prepared.extension}`;

        await this.storageService.upload(
          fileKey,
          prepared.file.buffer,
          prepared.contentType,
        );

        uploadedKeys.push(fileKey);

        files.push({
          type: prepared.type,
          fileKey,
          originalName:
            prepared.file.originalname,
          mimeType:
            prepared.contentType,
          sizeBytes:
            prepared.file.size,
          labelRu: null,
          labelEn: null,
          sortOrder: (index + 1) * 10,
        });
      }

      const product =
        await this.prisma.product.create({
          data: {
            id: productId,
            categoryId: dto.categoryId,
            slug: dto.slug,
            nameRu: dto.nameRu,
            nameEn: dto.nameEn,
            descriptionRu:
              dto.descriptionRu,
            descriptionEn:
              dto.descriptionEn,
            materialsRu:
              dto.materialsRu ?? null,
            materialsEn:
              dto.materialsEn ?? null,
            heightMm:
              dto.heightMm ?? null,
            widthMm:
              dto.widthMm ?? null,
            depthMm:
              dto.depthMm ?? null,
            priceType: price.priceType,
            priceAmount:
              price.priceAmount,
            priceCurrency:
              price.priceCurrency,
            sortOrder:
              dto.sortOrder ?? 0,
            isPublished:
              dto.isPublished ?? false,

            images: {
              create: images,
            },

            ...(files.length > 0
              ? {
                  files: {
                    create: files,
                  },
                }
              : {}),
          },
          select: adminProductSelect,
        });

      return this.toAdminResponse(
        product,
      );
    } catch (error: unknown) {
      await this.deleteObjectsSafely(
        uploadedKeys,
        'создание товара завершилось ошибкой',
      );

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
    uploads: ProductUploads,
  ): Promise<AdminProductResponseDto> {
    this.validateImages(
      uploads.images,
      false,
    );
  
    if (
      uploads.files.length >
      MAX_PRODUCT_FILES
    ) {
      throw new BadRequestException(
        `Можно загрузить не больше ${MAX_PRODUCT_FILES} файлов`,
      );
    }
  
    const preparedFiles =
      uploads.files.map((file) =>
        this.prepareProductFile(file),
      );
  
    const existingProduct =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          priceType: true,
          priceAmount: true,
          priceCurrency: true,
          isPublished: true,
  
          images: {
            orderBy: {
              sortOrder: 'desc',
            },
            take: 1,
            select: {
              sortOrder: true,
            },
          },
  
          files: {
            orderBy: {
              sortOrder: 'desc',
            },
            take: 1,
            select: {
              sortOrder: true,
            },
          },
  
          _count: {
            select: {
              images: true,
              files: true,
            },
          },
        },
      });
  
    if (!existingProduct) {
      throw new NotFoundException(
        'Товар не найден',
      );
    }
  
    const hasDataChanges =
      Object.values(dto).some(
        (value) => value !== undefined,
      );
  
    if (
      !hasDataChanges &&
      uploads.images.length === 0 &&
      uploads.files.length === 0
    ) {
      throw new BadRequestException(
        'Не передано ни одного изменения',
      );
    }
  
    const resultingImagesCount =
      existingProduct._count.images +
      uploads.images.length;
  
    if (
      resultingImagesCount >
      MAX_PRODUCT_IMAGES
    ) {
      throw new BadRequestException(
        `У товара может быть не больше ${MAX_PRODUCT_IMAGES} изображений`,
      );
    }
  
    const resultingFilesCount =
      existingProduct._count.files +
      uploads.files.length;
  
    if (
      resultingFilesCount >
      MAX_PRODUCT_FILES
    ) {
      throw new BadRequestException(
        `У товара может быть не больше ${MAX_PRODUCT_FILES} файлов`,
      );
    }
  
    const resultingPublished =
      dto.isPublished ??
      existingProduct.isPublished;
  
    if (
      resultingPublished &&
      resultingImagesCount === 0
    ) {
      throw new BadRequestException(
        'Нельзя опубликовать товар без изображения',
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
  
    if (dto.slug !== undefined) {
      const productWithSlug =
        await this.prisma.product.findUnique({
          where: {
            slug: dto.slug,
          },
          select: {
            id: true,
          },
        });
  
      if (
        productWithSlug &&
        productWithSlug.id !== id
      ) {
        throw new ConflictException(
          `Товар со slug "${dto.slug}" уже существует`,
        );
      }
    }
  
    const hasPriceChanges =
      dto.priceType !== undefined ||
      dto.priceAmount !== undefined ||
      dto.priceCurrency !== undefined;
  
    const price = hasPriceChanges
      ? this.resolvePrice(
          dto,
          existingProduct,
        )
      : {};
  
    const productId =
      existingProduct.id;
  
    const uploadedKeys: string[] = [];
  
    try {
      const images:
        Prisma.ProductImageCreateWithoutProductInput[] =
        [];
  
      const firstImageSortOrder =
        (
          existingProduct.images[0]
            ?.sortOrder ?? 0
        ) + 10;
  
      for (
        let index = 0;
        index < uploads.images.length;
        index += 1
      ) {
        const image =
          uploads.images[index];
  
        const optimizedImage =
          await this.optimizeImage(
            image.buffer,
          );
  
        const imageKey =
          `products/${productId}/images/${randomUUID()}.webp`;
  
        await this.storageService.upload(
          imageKey,
          optimizedImage,
          'image/webp',
        );
  
        uploadedKeys.push(imageKey);
  
        images.push({
          imageKey,
          altRu: null,
          altEn: null,
          sortOrder:
            firstImageSortOrder +
            index * 10,
        });
      }
  
      const files:
        Prisma.ProductFileCreateWithoutProductInput[] =
        [];
  
      const firstFileSortOrder =
        (
          existingProduct.files[0]
            ?.sortOrder ?? 0
        ) + 10;
  
      for (
        let index = 0;
        index < preparedFiles.length;
        index += 1
      ) {
        const prepared =
          preparedFiles[index];
  
        const fileKey =
          `products/${productId}/files/${randomUUID()}${prepared.extension}`;
  
        await this.storageService.upload(
          fileKey,
          prepared.file.buffer,
          prepared.contentType,
        );
  
        uploadedKeys.push(fileKey);
  
        files.push({
          type: prepared.type,
          fileKey,
          originalName:
            prepared.file.originalname,
          mimeType:
            prepared.contentType,
          sizeBytes:
            prepared.file.size,
          labelRu: null,
          labelEn: null,
          sortOrder:
            firstFileSortOrder +
            index * 10,
        });
      }
  
      const product =
        await this.prisma.product.update({
          where: {
            id,
          },
          data: {
            ...(dto.categoryId !== undefined
              ? {
                  categoryId:
                    dto.categoryId,
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
  
            ...(dto.heightMm !== undefined
              ? {
                  heightMm:
                    dto.heightMm,
                }
              : {}),
  
            ...(dto.widthMm !== undefined
              ? {
                  widthMm:
                    dto.widthMm,
                }
              : {}),
  
            ...(dto.depthMm !== undefined
              ? {
                  depthMm:
                    dto.depthMm,
                }
              : {}),
  
            ...price,
  
            ...(dto.sortOrder !== undefined
              ? {
                  sortOrder:
                    dto.sortOrder,
                }
              : {}),
  
            ...(dto.isPublished !== undefined
              ? {
                  isPublished:
                    dto.isPublished,
                }
              : {}),
  
            ...(images.length > 0
              ? {
                  images: {
                    create: images,
                  },
                }
              : {}),
  
            ...(files.length > 0
              ? {
                  files: {
                    create: files,
                  },
                }
              : {}),
          },
          select: adminProductSelect,
        });
  
      return this.toAdminResponse(
        product,
      );
    } catch (error: unknown) {
      await this.deleteObjectsSafely(
        uploadedKeys,
        'обновление товара завершилось ошибкой',
      );
  
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

  async remove(
    id: string,
  ): Promise<void> {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
        select: {
          images: {
            select: {
              imageKey: true,
            },
          },
  
          files: {
            select: {
              fileKey: true,
            },
          },
  
          variants: {
            select: {
              images: {
                select: {
                  imageKey: true,
                },
              },
  
              files: {
                select: {
                  fileKey: true,
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
  
    const storedKeys = [
      ...product.images.map(
        (image) => image.imageKey,
      ),
  
      ...product.files.map(
        (file) => file.fileKey,
      ),
  
      ...product.variants.flatMap(
        (variant) =>
          variant.images.map(
            (image) => image.imageKey,
          ),
      ),
  
      ...product.variants.flatMap(
        (variant) =>
          variant.files.map(
            (file) => file.fileKey,
          ),
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
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Товар не найден',
        );
      }
  
      throw error;
    }
  
    await this.deleteObjectsSafely(
      storedKeys,
      'товар был удалён',
    );
  }

  private validateImages(
    images: Express.Multer.File[],
    required: boolean,
  ): void {
    if (
      required &&
      images.length === 0
    ) {
      throw new BadRequestException(
        'Загрузите хотя бы одно изображение товара',
      );
    }

    if (
      images.length >
      MAX_PRODUCT_IMAGES
    ) {
      throw new BadRequestException(
        `Можно загрузить не больше ${MAX_PRODUCT_IMAGES} изображений`,
      );
    }

    for (const image of images) {
      if (
        !PRODUCT_IMAGE_MIME_TYPES.has(
          image.mimetype,
        )
      ) {
        throw new BadRequestException(
          `Файл "${image.originalname}" не является JPEG, PNG или WEBP`,
        );
      }

      if (
        image.size >
        MAX_PRODUCT_IMAGE_SIZE
      ) {
        throw new BadRequestException(
          `Изображение "${image.originalname}" превышает 20 МБ`,
        );
      }
    }
  }

  private prepareProductFile(
    file: Express.Multer.File,
  ): PreparedProductFile {
    if (
      file.size >
      MAX_PRODUCT_FILE_SIZE
    ) {
      throw new BadRequestException(
        `Файл "${file.originalname}" превышает 50 МБ`,
      );
    }

    if (
      !file.originalname ||
      file.originalname.length > 255
    ) {
      throw new BadRequestException(
        'Некорректное название файла',
      );
    }

    const extension =
      extname(
        file.originalname,
      ).toLowerCase();

    if (extension === '.pdf') {
      const pdfHeader =
        file.buffer
          .subarray(0, 1024)
          .indexOf(
            Buffer.from('%PDF-'),
          );

      if (pdfHeader === -1) {
        throw new BadRequestException(
          `Файл "${file.originalname}" не является PDF`,
        );
      }

      return {
        file,
        type: ProductFileType.PDF,
        extension,
        contentType:
          'application/pdf',
      };
    }

    if (extension === '.glb') {
      const magic =
        file.buffer
          .subarray(0, 4)
          .toString('ascii');

      if (magic !== 'glTF') {
        throw new BadRequestException(
          `Файл "${file.originalname}" не является GLB`,
        );
      }

      return {
        file,
        type:
          ProductFileType.MODEL_3D,
        extension,
        contentType:
          'model/gltf-binary',
      };
    }

    if (extension === '.gltf') {
      try {
        const parsed = JSON.parse(
          file.buffer
            .toString('utf8')
            .replace(/^\uFEFF/, ''),
        ) as {
          asset?: {
            version?: unknown;
          };
        };

        if (
          typeof parsed.asset?.version !==
          'string'
        ) {
          throw new Error();
        }
      } catch {
        throw new BadRequestException(
          `Файл "${file.originalname}" не является корректным GLTF`,
        );
      }

      return {
        file,
        type:
          ProductFileType.MODEL_3D,
        extension,
        contentType:
          'model/gltf+json',
      };
    }

    throw new BadRequestException(
      `Файл "${file.originalname}" имеет неподдерживаемый формат`,
    );
  }

  private resolvePrice(
    dto: ProductPriceInput,
    current?: CurrentProductPrice,
  ): {
    priceType: ProductPriceType;
    priceAmount: string | null;
    priceCurrency: string | null;
  } {
    const priceType =
      dto.priceType ??
      current?.priceType ??
      ProductPriceType.ON_REQUEST;
  
    if (
      priceType ===
      ProductPriceType.ON_REQUEST
    ) {
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
      dto.priceAmount ??
      current?.priceAmount?.toString();
  
    const priceCurrency =
      dto.priceCurrency ??
      current?.priceCurrency;
  
    if (
      !priceAmount ||
      !priceCurrency
    ) {
      throw new BadRequestException(
        'Для фиксированной цены укажите стоимость и валюту',
      );
    }
  
    if (Number(priceAmount) <= 0) {
      throw new BadRequestException(
        'Стоимость должна быть больше нуля',
      );
    }
  
    return {
      priceType,
      priceAmount,
      priceCurrency,
    };
  }

  private async optimizeImage(
    image: Buffer,
  ): Promise<Buffer> {
    try {
      return await sharp(image, {
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
        'Не удалось обработать одно из изображений',
      );
    }
  }

  private async deleteObjectsSafely(
    keys: string[],
    reason: string,
  ): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this.storageService.delete(
            key,
          );
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.stack ??
                error.message
              : String(error);
  
          this.logger.error(
            `Не удалось удалить "${key}" (${reason}): ${message}`,
          );
        }
      }),
    );
  }

  private toAdminResponse(
    product: AdminProductRecord,
  ): AdminProductResponseDto {
    return {
      id: product.id,
      categoryId:
        product.categoryId,
      category: {
        id: product.category.id,
        slug: product.category.slug,
        nameRu: product.category.nameRu,
        nameEn: product.category.nameEn,
      },
      slug: product.slug,
      nameRu: product.nameRu,
      nameEn: product.nameEn,
      descriptionRu:
        product.descriptionRu,
      descriptionEn:
        product.descriptionEn,
      materialsRu:
        product.materialsRu,
      materialsEn:
        product.materialsEn,
      heightMm: product.heightMm,
      widthMm: product.widthMm,
      depthMm: product.depthMm,
      priceType:
        product.priceType,
      priceAmount:
        product.priceAmount?.toString() ??
        null,
      priceCurrency:
        product.priceCurrency,
      sortOrder:
        product.sortOrder,
      isPublished:
        product.isPublished,

      images: product.images.map(
        (image) => ({
          id: image.id,
          imageUrl:
            this.storageService.getPublicUrl(
              image.imageKey,
            ),
          altRu: image.altRu,
          altEn: image.altEn,
          sortOrder:
            image.sortOrder,
        }),
      ),

      files: product.files.map(
        (file) => ({
          id: file.id,
          type: file.type,
          fileUrl:
            this.storageService.getPublicUrl(
              file.fileKey,
            ),
          originalName:
            file.originalName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          labelRu: file.labelRu,
          labelEn: file.labelEn,
          sortOrder: file.sortOrder,
        }),
      ),

      variantsCount:
        product._count.variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}