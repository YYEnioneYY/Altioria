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
import { AdminProductVariantFileResponseDto } from './dto/admin-product-variant-response.dto';
import { ReorderProductVariantFilesDto } from './dto/reorder-product-variant-files.dto';
import { UpdateProductVariantFileDto } from './dto/update-product-variant-file.dto';

const VARIANT_FILE_SELECT = {
  id: true,
  type: true,
  fileKey: true,
  originalName: true,
  mimeType: true,
  sizeBytes: true,
  labelRu: true,
  labelEn: true,
  sortOrder: true,
} satisfies Prisma.ProductVariantFileSelect;

type VariantFileRecord =
  Prisma.ProductVariantFileGetPayload<{
    select: typeof VARIANT_FILE_SELECT;
  }>;

@Injectable()
export class ProductVariantFilesService {
  private readonly logger = new Logger(
    ProductVariantFilesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async reorder(
    productId: string,
    variantId: string,
    dto: ReorderProductVariantFilesDto,
  ): Promise<
    AdminProductVariantFileResponseDto[]
  > {
    const files = await this.prisma.$transaction(
      async (transaction) => {
        const variant =
          await transaction.productVariant.findFirst({
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
            'Исполнение товара не найдено',
          );
        }

        const currentFileIds = new Set(
          variant.files.map((file) => file.id),
        );

        const containsEveryFile =
          dto.fileIds.length ===
            currentFileIds.size &&
          dto.fileIds.every((fileId) =>
            currentFileIds.has(fileId),
          );

        if (!containsEveryFile) {
          throw new BadRequestException(
            'Необходимо передать ID всех файлов исполнения без пропусков и посторонних ID',
          );
        }

        await Promise.all(
          dto.fileIds.map((fileId, index) =>
            transaction.productVariantFile.update({
              where: {
                id: fileId,
              },
              data: {
                sortOrder: (index + 1) * 10,
              },
            }),
          ),
        );

        return transaction.productVariantFile.findMany({
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
          select: VARIANT_FILE_SELECT,
        });
      },
    );

    return files.map((file) =>
      this.toResponse(file),
    );
  }

  async update(
    productId: string,
    variantId: string,
    fileId: string,
    dto: UpdateProductVariantFileDto,
  ): Promise<AdminProductVariantFileResponseDto> {
    const hasChanges =
      dto.labelRu !== undefined ||
      dto.labelEn !== undefined;

    if (!hasChanges) {
      throw new BadRequestException(
        'Не передано ни одного изменения',
      );
    }

    const existingFile =
      await this.prisma.productVariantFile.findFirst({
        where: {
          id: fileId,
          variantId,

          variant: {
            productId,
          },
        },
        select: {
          id: true,
        },
      });

    if (!existingFile) {
      throw new NotFoundException(
        'Файл исполнения не найден',
      );
    }

    try {
      const file =
        await this.prisma.productVariantFile.update({
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
          select: VARIANT_FILE_SELECT,
        });

      return this.toResponse(file);
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Файл исполнения не найден',
        );
      }

      throw error;
    }
  }

  async remove(
    productId: string,
    variantId: string,
    fileId: string,
  ): Promise<void> {
    const file =
      await this.prisma.productVariantFile.findFirst({
        where: {
          id: fileId,
          variantId,

          variant: {
            productId,
          },
        },
        select: {
          id: true,
          fileKey: true,
        },
      });

    if (!file) {
      throw new NotFoundException(
        'Файл исполнения не найден',
      );
    }

    try {
      await this.prisma.productVariantFile.delete({
        where: {
          id: fileId,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Файл исполнения не найден',
        );
      }

      throw error;
    }

    try {
      await this.storageService.delete(
        file.fileKey,
      );
    } catch {
      this.logger.warn(
        `Не удалось удалить файл "${file.fileKey}" из хранилища`,
      );
    }
  }

  private toResponse(
    file: VariantFileRecord,
  ): AdminProductVariantFileResponseDto {
    return {
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
    };
  }
}