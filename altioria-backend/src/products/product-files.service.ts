import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import {
  Prisma,
  ProductFileType,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

import { CreateProductFileDto } from './dto/create-product-file.dto';
import { ReorderProductFilesDto } from './dto/reorder-product-files.dto';
import { AdminProductFileResponseDto } from './dto/admin-product-file-response.dto';
import {
  MAX_PRODUCT_DOCUMENT_SIZE,
  MAX_PRODUCT_FILES_PER_VARIANT,
} from './constants/product-file.constants';

const ADMIN_PRODUCT_FILE_SELECT = {
  id: true,
  variantId: true,
  type: true,
  filePath: true,
  originalName: true,
  mimeType: true,
  sizeBytes: true,
  labelRu: true,
  labelEn: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductFileSelect;

type AdminProductFileRecord =
  Prisma.ProductFileGetPayload<{
    select: typeof ADMIN_PRODUCT_FILE_SELECT;
  }>;

interface ValidatedFile {
  extension: 'pdf' | 'glb' | 'zip';
  mimeType: string;
  originalName: string;
}

@Injectable()
export class ProductFilesService {
  private readonly logger = new Logger(
    ProductFilesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAllForAdmin(
    productId: string,
    variantId: string,
  ): Promise<AdminProductFileResponseDto[]> {
    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
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
            select: ADMIN_PRODUCT_FILE_SELECT,
          },
        },
      });

    if (!variant) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }

    return variant.files.map((file) =>
      this.toAdminResponse(file),
    );
  }

  async upload(
    productId: string,
    variantId: string,
    dto: CreateProductFileDto,
    file: Express.Multer.File,
  ): Promise<AdminProductFileResponseDto> {
    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          _count: {
            select: {
              files: true,
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
        },
      });

    if (!variant) {
      throw new NotFoundException(
        'Вариант товара не найден',
      );
    }

    if (
      variant._count.files >=
      MAX_PRODUCT_FILES_PER_VARIANT
    ) {
      throw new BadRequestException(
        `У варианта может быть не больше ${MAX_PRODUCT_FILES_PER_VARIANT} файлов`,
      );
    }

    const validatedFile =
      this.validateFile(dto.type, file);

    const filePath =
      `products/${productId}/${variantId}/files/${randomUUID()}.${validatedFile.extension}`;

    const sortOrder =
      dto.sortOrder ??
      (variant.files[0]?.sortOrder ?? 0) + 10;

    await this.storageService.upload(
      filePath,
      file.buffer,
      validatedFile.mimeType,
    );

    try {
      const createdFile =
        await this.prisma.productFile.create({
          data: {
            variantId,
            type: dto.type,
            filePath,
            originalName:
              validatedFile.originalName,
            mimeType:
              validatedFile.mimeType,
            sizeBytes: file.size,
            labelRu: dto.labelRu,
            labelEn: dto.labelEn,
            sortOrder,
          },
          select: ADMIN_PRODUCT_FILE_SELECT,
        });

      return this.toAdminResponse(createdFile);
    } catch (error: unknown) {
      await this.deleteFileSafely(
        filePath,
        'создание файла завершилось ошибкой',
      );

      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Такой файл уже существует',
        );
      }

      throw error;
    }
  }

  async reorder(
    productId: string,
    variantId: string,
    dto: ReorderProductFilesDto,
  ): Promise<AdminProductFileResponseDto[]> {
    const variant =
      await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },
        select: {
          files: {
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
      variant.files.map((file) => file.id),
    );

    const requestedIds = new Set(dto.fileIds);

    const containsAllFiles =
      existingIds.size === requestedIds.size &&
      dto.fileIds.every((id) =>
        existingIds.has(id),
      );

    if (!containsAllFiles) {
      throw new BadRequestException(
        'Передан неполный или устаревший список файлов. Обновите страницу',
      );
    }

    try {
      await this.prisma.$transaction(
        dto.fileIds.map((id, index) =>
          this.prisma.productFile.update({
            where: {
              id,
            },
            data: {
              sortOrder: (index + 1) * 10,
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
        throw new BadRequestException(
          'Список файлов изменился. Обновите страницу',
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
    fileId: string,
  ): Promise<void> {
    const file =
      await this.prisma.productFile.findFirst({
        where: {
          id: fileId,
          variantId,

          variant: {
            productId,
          },
        },
        select: {
          id: true,
          filePath: true,
        },
      });

    if (!file) {
      throw new NotFoundException(
        'Файл товара не найден',
      );
    }

    try {
      await this.prisma.productFile.delete({
        where: {
          id: file.id,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Файл товара не найден',
        );
      }

      throw error;
    }

    await this.deleteFileSafely(
      file.filePath,
      'файл был удалён из варианта товара',
    );
  }

  private validateFile(
    type: ProductFileType,
    file: Express.Multer.File,
  ): ValidatedFile {
    const originalName =
      file.originalname
        .replaceAll('\\', '/')
        .split('/')
        .pop() ?? 'file';

    if (originalName.length > 255) {
      throw new BadRequestException(
        'Название файла слишком длинное',
      );
    }

    const extension =
      extname(originalName).toLowerCase();

    if (type === ProductFileType.MODEL_3D) {
      return this.validate3DFile(
        file,
        extension,
        originalName,
      );
    }

    return this.validatePdfFile(
      file,
      extension,
      originalName,
    );
  }

  private validatePdfFile(
    file: Express.Multer.File,
    extension: string,
    originalName: string,
  ): ValidatedFile {
    if (file.size > MAX_PRODUCT_DOCUMENT_SIZE) {
      throw new BadRequestException(
        'Размер PDF-файла не должен превышать 25 МБ',
      );
    }

    const hasPdfSignature =
      file.buffer
        .subarray(0, 5)
        .toString('ascii') === '%PDF-';

    if (
      extension !== '.pdf' ||
      !hasPdfSignature
    ) {
      throw new BadRequestException(
        'Для документов разрешены только корректные PDF-файлы',
      );
    }

    return {
      extension: 'pdf',
      mimeType: 'application/pdf',
      originalName,
    };
  }

  private validate3DFile(
    file: Express.Multer.File,
    extension: string,
    originalName: string,
  ): ValidatedFile {
    if (extension === '.glb') {
      const hasGlbSignature =
        file.buffer
          .subarray(0, 4)
          .toString('ascii') === 'glTF';

      if (!hasGlbSignature) {
        throw new BadRequestException(
          'Загружен некорректный GLB-файл',
        );
      }

      return {
        extension: 'glb',
        mimeType: 'model/gltf-binary',
        originalName,
      };
    }

    if (extension === '.zip') {
      const signature =
        file.buffer
          .subarray(0, 4)
          .toString('hex');

      const validZipSignatures = [
        '504b0304',
        '504b0506',
        '504b0708',
      ];

      if (
        !validZipSignatures.includes(signature)
      ) {
        throw new BadRequestException(
          'Загружен некорректный ZIP-архив',
        );
      }

      return {
        extension: 'zip',
        mimeType: 'application/zip',
        originalName,
      };
    }

    throw new BadRequestException(
      'Для 3D-моделей разрешены GLB или ZIP',
    );
  }

  private async deleteFileSafely(
    filePath: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.storageService.delete(filePath);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.stack ?? error.message
          : String(error);

      this.logger.error(
        `Не удалось удалить файл "${filePath}": ${reason}`,
        message,
      );
    }
  }

  private toAdminResponse(
    file: AdminProductFileRecord,
  ): AdminProductFileResponseDto {
    return {
      id: file.id,
      variantId: file.variantId,
      type: file.type,
      fileUrl:
        this.storageService.getPublicUrl(
          file.filePath,
        ),
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      labelRu: file.labelRu,
      labelEn: file.labelEn,
      sortOrder: file.sortOrder,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }
}