import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { StorageService } from '../storage/storage.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  CategoryLocale,
  GetCategoriesQueryDto,
} from './dto/get-categories-query.dto';

import { AdminCategoryResponseDto } from './dto/admin-category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(
    CategoriesService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(
    query: GetCategoriesQueryDto,
  ): Promise<CategoryResponseDto[]> {
    const locale = query.locale ?? CategoryLocale.RU;

    const categories = await this.prisma.category.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
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
        imagePath: true,
      },
    });

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name:
        locale === CategoryLocale.EN
          ? category.nameEn
          : category.nameRu,
      imageUrl: category.imagePath
        ? this.storageService.getPublicUrl(category.imagePath)
        : null,
    }));
  }

  async findAllForAdmin(): Promise<
    AdminCategoryResponseDto[]
  > {
    const categories =
      await this.prisma.category.findMany({
        orderBy: [
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
          imagePath: true,
          sortOrder: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      nameRu: category.nameRu,
      nameEn: category.nameEn,
      imageUrl: category.imagePath
        ? this.storageService.getPublicUrl(
            category.imagePath,
          )
        : null,
      sortOrder: category.sortOrder,
      isPublished: category.isPublished,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  async findOneForAdmin(
    id: string,
  ): Promise<AdminCategoryResponseDto> {
    const category =
      await this.prisma.category.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
          imagePath: true,
          sortOrder: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
    if (!category) {
      throw new NotFoundException(
        'Категория не найдена',
      );
    }
  
    return {
      id: category.id,
      slug: category.slug,
      nameRu: category.nameRu,
      nameEn: category.nameEn,
      imageUrl: category.imagePath
        ? this.storageService.getPublicUrl(
            category.imagePath,
          )
        : null,
      sortOrder: category.sortOrder,
      isPublished: category.isPublished,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async create(
    dto: CreateCategoryDto,
    imageBuffer?: Buffer,
  ): Promise<AdminCategoryResponseDto> {
    const existingCategory =
      await this.prisma.category.findUnique({
        where: {
          slug: dto.slug,
        },
        select: {
          id: true,
        },
      });
  
    if (existingCategory) {
      throw new ConflictException(
        `Категория со slug "${dto.slug}" уже существует`,
      );
    }
  
    let imagePath: string | null = null;

    if (imageBuffer) {
      imagePath = await this.uploadCategoryImage(imageBuffer);
    }
  
    try {
      const category = await this.prisma.category.create({
        data: {
          slug: dto.slug,
          nameRu: dto.nameRu,
          nameEn: dto.nameEn,
          imagePath,
          sortOrder: dto.sortOrder ?? 0,
          isPublished: dto.isPublished ?? false,
        },
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
          imagePath: true,
          sortOrder: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      return {
        id: category.id,
        slug: category.slug,
        nameRu: category.nameRu,
        nameEn: category.nameEn,
        imageUrl: category.imagePath
          ? this.storageService.getPublicUrl(category.imagePath)
          : null,
        sortOrder: category.sortOrder,
        isPublished: category.isPublished,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error: unknown) {
      if (imagePath) {
        await this.deleteImageSafely(
          imagePath,
          'создание категории завершилось ошибкой',
        );
      }
  
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Категория со slug "${dto.slug}" уже существует`,
        );
      }
  
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    imageBuffer?: Buffer,
  ): Promise<AdminCategoryResponseDto> {
    const existingCategory =
      await this.prisma.category.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          imagePath: true,
        },
      });
  
    if (!existingCategory) {
      throw new NotFoundException(
        'Категория не найдена',
      );
    }
  
    const hasChanges =
      dto.slug !== undefined ||
      dto.nameRu !== undefined ||
      dto.nameEn !== undefined ||
      dto.sortOrder !== undefined ||
      dto.isPublished !== undefined ||
      dto.removeImage === true ||
      imageBuffer !== undefined;
  
    if (!hasChanges) {
      throw new BadRequestException(
        'Не передано ни одного изменения',
      );
    }
  
    if (dto.removeImage === true && imageBuffer) {
      throw new BadRequestException(
        'Нельзя одновременно загрузить и удалить изображение',
      );
    }
  
    let newImagePath: string | null | undefined;
  
    if (imageBuffer) {
      newImagePath =
        await this.uploadCategoryImage(imageBuffer);
    } else if (dto.removeImage === true) {
      newImagePath = null;
    }
  
    try {
      const category =
        await this.prisma.category.update({
          where: {
            id,
          },
          data: {
            ...(dto.slug !== undefined
              ? { slug: dto.slug }
              : {}),
  
            ...(dto.nameRu !== undefined
              ? { nameRu: dto.nameRu }
              : {}),
  
            ...(dto.nameEn !== undefined
              ? { nameEn: dto.nameEn }
              : {}),
  
            ...(dto.sortOrder !== undefined
              ? { sortOrder: dto.sortOrder }
              : {}),
  
            ...(dto.isPublished !== undefined
              ? { isPublished: dto.isPublished }
              : {}),
  
            ...(newImagePath !== undefined
              ? { imagePath: newImagePath }
              : {}),
          },
          select: {
            id: true,
            slug: true,
            nameRu: true,
            nameEn: true,
            imagePath: true,
            sortOrder: true,
            isPublished: true,
            createdAt: true,
            updatedAt: true,
          },
        });
  
      if (
        existingCategory.imagePath &&
        newImagePath !== undefined &&
        existingCategory.imagePath !== newImagePath
      ) {
        await this.deleteImageSafely(
          existingCategory.imagePath,
          'изображение категории было заменено',
        );
      }
  
      return {
        id: category.id,
        slug: category.slug,
        nameRu: category.nameRu,
        nameEn: category.nameEn,
        imageUrl: category.imagePath
          ? this.storageService.getPublicUrl(
              category.imagePath,
            )
          : null,
        sortOrder: category.sortOrder,
        isPublished: category.isPublished,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error: unknown) {
      if (typeof newImagePath === 'string') {
        await this.deleteImageSafely(
          newImagePath,
          'обновление категории завершилось ошибкой',
        );
      }
  
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Категория со slug "${dto.slug}" уже существует`,
          );
        }
  
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Категория не найдена',
          );
        }
      }
  
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const deletedCategory =
        await this.prisma.category.delete({
          where: {
            id,
          },
          select: {
            imagePath: true,
          },
        });
      
      if (deletedCategory.imagePath) {
        await this.deleteImageSafely(
          deletedCategory.imagePath,
          'категория была удалена',
        );
      }
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Категория не найдена',
          );
        }
      
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Нельзя удалить категорию, пока с ней связаны товары',
          );
        }
      }
  
      throw error;
    }
  }











  private async uploadCategoryImage(
    imageBuffer: Buffer,
  ): Promise<string> {
    let optimizedImage: Buffer;
  
    try {
      optimizedImage = await sharp(imageBuffer, {
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
        'Не удалось обработать изображение',
      );
    }
  
    const imagePath = `categories/${randomUUID()}.webp`;
  
    await this.storageService.upload(
      imagePath,
      optimizedImage,
      'image/webp',
    );
  
    return imagePath;
  }

  private async deleteImageSafely(
    imagePath: string,
    reason: string,
  ): Promise<void> {
    if (imagePath.startsWith('categories/default/')) {
      return;
    }
  
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
}