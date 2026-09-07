import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import sharp from 'sharp';

import {
  Prisma,
  ProductFileType,
  ProductPriceType,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { AdminProductVariantResponseDto } from './dto/admin-product-variant-response.dto';

const MAX_VARIANT_IMAGES = 15;
const MAX_VARIANT_FILES = 10;

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ADMIN_PRODUCT_VARIANT_SELECT = {
  id: true,
  productId: true,
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
        sortOrder: 'asc',
      },
      {
        createdAt: 'asc',
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
        sortOrder: 'asc',
      },
      {
        createdAt: 'asc',
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
} satisfies Prisma.ProductVariantSelect;

type AdminProductVariantRecord =
  Prisma.ProductVariantGetPayload<{
    select: typeof ADMIN_PRODUCT_VARIANT_SELECT;
  }>;

interface PreparedFile {
  file: Express.Multer.File;
  type: ProductFileType;
  extension: string;
  contentType: string;
}

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
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        variants: {
          orderBy: [
            {
              sortOrder: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
          select: ADMIN_PRODUCT_VARIANT_SELECT,
        },
      },
    });
  
    if (!product) {
      throw new NotFoundException('Товар не найден');
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
        select: ADMIN_PRODUCT_VARIANT_SELECT,
      });
  
    if (!variant) {
      throw new NotFoundException(
        'Исполнение товара не найдено',
      );
    }
  
    return this.toAdminResponse(variant);
  }

  async create(
    productId: string,
    dto: CreateProductVariantDto,
    images: Express.Multer.File[],
    files: Express.Multer.File[],
  ): Promise<AdminProductVariantResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,

        _count: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    this.validateImages(images);
    this.validateFilesCount(files);

    if (
      dto.isPublished === true &&
      images.length === 0 &&
      product._count.images === 0
    ) {
      throw new BadRequestException(
        'Нельзя опубликовать исполнение без изображений',
      );
    }

    const price = this.resolvePrice(dto);

    /*
     * Сначала проверяем все файлы.
     * Так мы не начнём загружать их в MinIO,
     * если среди них находится запрещённый файл.
     */
    const preparedFiles = files.map((file) =>
      this.prepareFile(file),
    );

    const variantId = randomUUID();
    const uploadedKeys: string[] = [];

    const variantImages: Prisma.ProductVariantImageCreateWithoutVariantInput[] =
      [];

    const variantFiles: Prisma.ProductVariantFileCreateWithoutVariantInput[] =
      [];

    try {
      for (const [index, image] of images.entries()) {
        const optimizedImage =
          await this.optimizeImage(image);

        const imageKey =
          `products/${productId}/variants/` +
          `${variantId}/images/${randomUUID()}.webp`;

        await this.storageService.upload(
          imageKey,
          optimizedImage,
          'image/webp',
        );

        uploadedKeys.push(imageKey);

        variantImages.push({
          imageKey,
          altRu: null,
          altEn: null,
          sortOrder: (index + 1) * 10,
        });
      }

      for (const [
        index,
        prepared,
      ] of preparedFiles.entries()) {
        const fileKey =
          `products/${productId}/variants/` +
          `${variantId}/files/${randomUUID()}` +
          `${prepared.extension}`;

        await this.storageService.upload(
          fileKey,
          prepared.file.buffer,
          prepared.contentType,
        );

        uploadedKeys.push(fileKey);

        variantFiles.push({
          type: prepared.type,
          fileKey,
          originalName: prepared.file.originalname,
          mimeType: prepared.contentType,
          sizeBytes: prepared.file.size,
          labelRu: null,
          labelEn: null,
          sortOrder: (index + 1) * 10,
        });
      }

      const variant =
        await this.prisma.productVariant.create({
          data: {
            id: variantId,

            product: {
              connect: {
                id: productId,
              },
            },

            slug: dto.slug,
            nameRu: dto.nameRu,
            nameEn: dto.nameEn,

            descriptionRu:
              dto.descriptionRu ?? null,

            descriptionEn:
              dto.descriptionEn ?? null,

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
            priceAmount: price.priceAmount,
            priceCurrency: price.priceCurrency,

            sortOrder: dto.sortOrder ?? 0,
            isPublished:
              dto.isPublished ?? false,

            ...(variantImages.length > 0
              ? {
                  images: {
                    create: variantImages,
                  },
                }
              : {}),

            ...(variantFiles.length > 0
              ? {
                  files: {
                    create: variantFiles,
                  },
                }
              : {}),
          },

          select: ADMIN_PRODUCT_VARIANT_SELECT,
        });

      return this.toAdminResponse(variant);
    } catch (error: unknown) {
      await this.deleteUploadedObjects(uploadedKeys);

      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Исполнение со slug "${dto.slug}" уже существует у этого товара`,
          );
        }

        if (
          error.code === 'P2003' ||
          error.code === 'P2025'
        ) {
          throw new NotFoundException(
            'Товар не найден',
          );
        }
      }

      throw error;
    }
  }

  private validateImages(
    images: Express.Multer.File[],
  ): void {
    if (images.length > MAX_VARIANT_IMAGES) {
      throw new BadRequestException(
        `Можно загрузить не более ${MAX_VARIANT_IMAGES} изображений`,
      );
    }

    for (const image of images) {
      if (
        !ALLOWED_IMAGE_MIME_TYPES.has(
          image.mimetype,
        )
      ) {
        throw new BadRequestException(
          `Файл "${image.originalname}" не является JPG, PNG или WEBP`,
        );
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        throw new BadRequestException(
          `Изображение "${image.originalname}" превышает 20 МБ`,
        );
      }
    }
  }

  private validateFilesCount(
    files: Express.Multer.File[],
  ): void {
    if (files.length > MAX_VARIANT_FILES) {
      throw new BadRequestException(
        `Можно загрузить не более ${MAX_VARIANT_FILES} файлов`,
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new BadRequestException(
          `Файл "${file.originalname}" превышает 50 МБ`,
        );
      }
    }
  }

  private async optimizeImage(
    image: Express.Multer.File,
  ): Promise<Buffer> {
    try {
      return await sharp(image.buffer)
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
        })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        `Не удалось обработать изображение "${image.originalname}"`,
      );
    }
  }

  private prepareFile(
    file: Express.Multer.File,
  ): PreparedFile {
    const extension = extname(
      file.originalname,
    ).toLowerCase();

    if (
      extension === '.pdf' &&
      this.isPdf(file.buffer)
    ) {
      return {
        file,
        type: ProductFileType.PDF,
        extension: '.pdf',
        contentType: 'application/pdf',
      };
    }

    if (
      extension === '.glb' &&
      this.isGlb(file.buffer)
    ) {
      return {
        file,
        type: ProductFileType.MODEL_3D,
        extension: '.glb',
        contentType: 'model/gltf-binary',
      };
    }

    if (
      extension === '.gltf' &&
      this.isGltf(file.buffer)
    ) {
      return {
        file,
        type: ProductFileType.MODEL_3D,
        extension: '.gltf',
        contentType: 'model/gltf+json',
      };
    }

    throw new BadRequestException(
      `Файл "${file.originalname}" должен быть PDF, GLB или GLTF`,
    );
  }

  private isPdf(buffer: Buffer): boolean {
    return (
      buffer.length >= 5 &&
      buffer
        .subarray(0, 5)
        .toString('ascii') === '%PDF-'
    );
  }

  private isGlb(buffer: Buffer): boolean {
    return (
      buffer.length >= 4 &&
      buffer
        .subarray(0, 4)
        .toString('ascii') === 'glTF'
    );
  }

  private isGltf(buffer: Buffer): boolean {
    try {
      const parsed: unknown = JSON.parse(
        buffer.toString('utf8'),
      );

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('asset' in parsed)
      ) {
        return false;
      }

      const asset = parsed.asset;

      return (
        typeof asset === 'object' &&
        asset !== null &&
        'version' in asset &&
        typeof asset.version === 'string'
      );
    } catch {
      return false;
    }
  }

  private resolvePrice(
    dto: CreateProductVariantDto,
  ): {
    priceType: ProductPriceType | null;
    priceAmount: number | null;
    priceCurrency: string | null;
  } {
    if (dto.priceType === undefined) {
      if (
        dto.priceAmount !== undefined ||
        dto.priceCurrency !== undefined
      ) {
        throw new BadRequestException(
          'Чтобы указать цену исполнения, передайте priceType',
        );
      }

      /*
       * Все три null означают:
       * использовать цену основного товара.
       */
      return {
        priceType: null,
        priceAmount: null,
        priceCurrency: null,
      };
    }

    if (
      dto.priceType ===
      ProductPriceType.ON_REQUEST
    ) {
      if (
        dto.priceAmount !== undefined ||
        dto.priceCurrency !== undefined
      ) {
        throw new BadRequestException(
          'Для цены по запросу нельзя указывать priceAmount и priceCurrency',
        );
      }

      return {
        priceType:
          ProductPriceType.ON_REQUEST,
        priceAmount: null,
        priceCurrency: null,
      };
    }

    if (
      dto.priceAmount === undefined ||
      dto.priceCurrency === undefined
    ) {
      throw new BadRequestException(
        'Для фиксированной цены обязательны priceAmount и priceCurrency',
      );
    }

    return {
      priceType: ProductPriceType.FIXED,
      priceAmount: dto.priceAmount,
      priceCurrency: dto.priceCurrency,
    };
  }

  private async deleteUploadedObjects(
    keys: string[],
  ): Promise<void> {
    const results = await Promise.allSettled(
      keys.map((key) =>
        this.storageService.delete(key),
      ),
    );

    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        this.logger.warn(
          `Не удалось удалить загруженный объект "${keys[index]}" после ошибки`,
        );
      }
    }
  }

  private toAdminResponse(
    variant: AdminProductVariantRecord,
  ): AdminProductVariantResponseDto {
    return {
      id: variant.id,
      productId: variant.productId,
      slug: variant.slug,
      nameRu: variant.nameRu,
      nameEn: variant.nameEn,
      descriptionRu: variant.descriptionRu,
      descriptionEn: variant.descriptionEn,
      materialsRu: variant.materialsRu,
      materialsEn: variant.materialsEn,
      heightMm: variant.heightMm,
      widthMm: variant.widthMm,
      depthMm: variant.depthMm,
      priceType: variant.priceType,

      priceAmount:
        variant.priceAmount?.toString() ?? null,

      priceCurrency: variant.priceCurrency,
      sortOrder: variant.sortOrder,
      isPublished: variant.isPublished,

      usesProductImages:
        variant.images.length === 0,

      images: variant.images.map((image) => ({
        id: image.id,

        imageUrl:
          this.storageService.getPublicUrl(
            image.imageKey,
          ),

        altRu: image.altRu,
        altEn: image.altEn,
        sortOrder: image.sortOrder,
      })),

      files: variant.files.map((file) => ({
        id: file.id,
        type: file.type,

        fileUrl:
          this.storageService.getPublicUrl(
            file.fileKey,
          ),

        originalName: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        labelRu: file.labelRu,
        labelEn: file.labelEn,
        sortOrder: file.sortOrder,
      })),

      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}