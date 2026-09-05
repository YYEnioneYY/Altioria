import {
  BadRequestException,
  ConflictException,
  Injectable,
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

@Injectable()
export class CategoriesService {
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
      let optimizedImage: Buffer;
  
      try {
        optimizedImage = await sharp(imageBuffer)
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
          'Не удалось обработать изображение',
        );
      }
  
      imagePath = `categories/${randomUUID()}.webp`;
  
      await this.storageService.upload(
        imagePath,
        optimizedImage,
        'image/webp',
      );
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
        await this.storageService.delete(imagePath).catch(() => {
        });
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
}