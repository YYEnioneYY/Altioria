import { Injectable } from '@nestjs/common';

import { ContentLocale } from '../common/enums/content-locale.enum';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResponseDto> {
    const searchText = query.q.trim();
    const locale = query.locale ?? ContentLocale.RU;

    const [categoryRows, productRows] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          isPublished: true,
          imagePath: {
            not: null,
          },
          OR: [
            {
              slug: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              nameRu: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              nameEn: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
          imagePath: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        take: 20,
      }),

      this.prisma.product.findMany({
        where: {
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
          OR: [
            {
              slug: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              nameRu: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              nameEn: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              descriptionRu: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
            {
              descriptionEn: {
                contains: searchText,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
          sortOrder: true,
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
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        take: 30,
      }),
    ]);

    const categories = categoryRows
      .sort(
        (first, second) =>
          this.getSearchRank(searchText, [
            first.slug,
            first.nameRu,
            first.nameEn,
          ]) -
          this.getSearchRank(searchText, [
            second.slug,
            second.nameRu,
            second.nameEn,
          ]),
      )
      .flatMap((category) => {
        if (!category.imagePath) {
          return [];
        }

        return [
          {
            id: category.id,
            slug: category.slug,
            name:
              locale === ContentLocale.EN
                ? category.nameEn
                : category.nameRu,
            imageUrl: this.storageService.getPublicUrl(category.imagePath),
          },
        ];
      })
      .slice(0, 5);

    const products = productRows
      .sort(
        (first, second) =>
          this.getSearchRank(searchText, [
            first.slug,
            first.nameRu,
            first.nameEn,
          ]) -
          this.getSearchRank(searchText, [
            second.slug,
            second.nameRu,
            second.nameEn,
          ]),
      )
      .flatMap((product) => {
        const cover = product.variants[0]?.images[0];

        if (!cover) {
          return [];
        }

        return [
          {
            id: product.id,
            slug: product.slug,
            name:
              locale === ContentLocale.EN
                ? product.nameEn
                : product.nameRu,
            imageUrl: this.storageService.getPublicUrl(cover.imagePath),
            category: {
              slug: product.category.slug,
              name:
                locale === ContentLocale.EN
                  ? product.category.nameEn
                  : product.category.nameRu,
            },
          },
        ];
      })
      .slice(0, 10);

    return {
      categories,
      products,
    };
  }

  private getSearchRank(searchText: string, values: string[]): number {
    const normalizedSearch = searchText.toLocaleLowerCase();

    const normalizedValues = values.map((value) =>
      value.toLocaleLowerCase(),
    );

    if (normalizedValues.some((value) => value === normalizedSearch)) {
      return 0;
    }

    if (
      normalizedValues.some((value) =>
        value.startsWith(normalizedSearch),
      )
    ) {
      return 1;
    }

    return 2;
  }
}