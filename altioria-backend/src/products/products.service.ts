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

  async create(
    dto: CreateProductDto,
    uploads: ProductUploads,
  ): Promise<AdminProductResponseDto> {
    this.validateImages(uploads.images);

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
      await this.deleteUploadedObjects(
        uploadedKeys,
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

  private validateImages(
    images: Express.Multer.File[],
  ): void {
    if (images.length === 0) {
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
    dto: CreateProductDto,
  ): {
    priceType: ProductPriceType;
    priceAmount: string | null;
    priceCurrency: string | null;
  } {
    const priceType =
      dto.priceType ??
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

    if (
      !dto.priceAmount ||
      !dto.priceCurrency
    ) {
      throw new BadRequestException(
        'Для фиксированной цены укажите стоимость и валюту',
      );
    }

    if (
      Number(dto.priceAmount) <= 0
    ) {
      throw new BadRequestException(
        'Стоимость должна быть больше нуля',
      );
    }

    return {
      priceType,
      priceAmount: dto.priceAmount,
      priceCurrency:
        dto.priceCurrency,
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

  private async deleteUploadedObjects(
    keys: string[],
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
            `Не удалось удалить "${key}" после ошибки: ${message}`,
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