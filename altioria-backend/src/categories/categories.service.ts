import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  CategoryLocale,
  GetCategoriesQueryDto,
} from './dto/get-categories-query.dto';

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
          createdAt: 'asc',
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
}