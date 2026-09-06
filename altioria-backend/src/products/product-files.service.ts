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

import { AdminProductFileResponseDto } from './dto/admin-product-response.dto';
import { ReorderProductFilesDto } from './dto/reorder-product-files.dto';
import { UpdateProductFileDto } from './dto/update-product-file.dto';

const adminProductFileSelect = {
  id: true,
  productId: true,
  type: true,
  fileKey: true,
  originalName: true,
  mimeType: true,
  sizeBytes: true,
  labelRu: true,
  labelEn: true,
  sortOrder: true,
} satisfies Prisma.ProductFileSelect;

type AdminProductFileRecord =
  Prisma.ProductFileGetPayload<{
    select:
      typeof adminProductFileSelect;
  }>;

@Injectable()
export class ProductFilesService {
  private readonly logger = new Logger(
    ProductFilesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async reorder(
    productId: string,
    dto: ReorderProductFilesDto,
  ): Promise<
    AdminProductFileResponseDto[]
  > {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          files: {
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

    const existingFileIds =
      new Set(
        product.files.map(
          (file) => file.id,
        ),
      );

    const requestedFileIds =
      new Set(dto.fileIds);

    const containsAllFiles =
      existingFileIds.size ===
        requestedFileIds.size &&
      dto.fileIds.every((fileId) =>
        existingFileIds.has(fileId),
      );

    if (!containsAllFiles) {
      throw new BadRequestException(
        'Передайте все файлы товара ровно по одному разу',
      );
    }

    try {
      await this.prisma.$transaction(
        dto.fileIds.map(
          (fileId, index) =>
            this.prisma.productFile.update({
              where: {
                id: fileId,
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
          'Один из файлов не найден',
        );
      }

      throw error;
    }

    return this.findAllForProduct(
      productId,
    );
  }

  async update(
    productId: string,
    fileId: string,
    dto: UpdateProductFileDto,
  ): Promise<AdminProductFileResponseDto> {
    const hasChanges =
      dto.labelRu !== undefined ||
      dto.labelEn !== undefined;

    if (!hasChanges) {
      throw new BadRequestException(
        'Не передано ни одного изменения',
      );
    }

    const existingFile =
      await this.prisma.productFile.findFirst({
        where: {
          id: fileId,
          productId,
        },
        select: {
          id: true,
        },
      });

    if (!existingFile) {
      throw new NotFoundException(
        'Файл товара не найден',
      );
    }

    try {
      const file =
        await this.prisma.productFile.update({
          where: {
            id: fileId,
          },
          data: {
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
          },
          select:
            adminProductFileSelect,
        });

      return this.toAdminResponse(file);
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
  }

  async remove(
    productId: string,
    fileId: string,
  ): Promise<void> {
    const file =
      await this.prisma.productFile.findFirst({
        where: {
          id: fileId,
          productId,
        },
        select: {
          id: true,
          fileKey: true,
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
      file.fileKey,
    );
  }

  private async findAllForProduct(
    productId: string,
  ): Promise<
    AdminProductFileResponseDto[]
  > {
    const files =
      await this.prisma.productFile.findMany({
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
          adminProductFileSelect,
      });

    return files.map((file) =>
      this.toAdminResponse(file),
    );
  }

  private toAdminResponse(
    file: AdminProductFileRecord,
  ): AdminProductFileResponseDto {
    return {
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
    };
  }

  private async deleteFileSafely(
    fileKey: string,
  ): Promise<void> {
    try {
      await this.storageService.delete(
        fileKey,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.stack ??
            error.message
          : String(error);

      this.logger.error(
        `Не удалось удалить файл "${fileKey}" из хранилища: ${message}`,
      );
    }
  }
}