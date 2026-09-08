import { Injectable } from '@nestjs/common';

import { ContentLocale } from '../common/enums/content-locale.enum';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SearchQueryDto } from './dto/search-query.dto';
import {
  SearchResultDto,
  SearchResultType,
} from './dto/search-result.dto';

interface ScoredSearchResult
  extends SearchResultDto {
  score: number;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async search(
    query: SearchQueryDto,
  ): Promise<SearchResultDto[]> {
    const locale =
      query.locale ?? ContentLocale.RU;

    const isEnglish =
      locale === ContentLocale.EN;

    const searchTerm = query.q.trim();
    const limit = query.limit ?? 10;

    /*
     * Выполняем три независимых запроса параллельно.
     * Максимум получим limit * 3 результатов,
     * затем отсортируем их и оставим limit.
     */
    const [
      categories,
      products,
      variants,
    ] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          isPublished: true,

          OR: [
            {
              nameRu: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              nameEn: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            slug: 'asc',
          },
        ],
        take: limit,
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
          imagePath: true,
        },
      }),

      this.prisma.product.findMany({
        where: {
          isPublished: true,

          category: {
            isPublished: true,
          },

          images: {
            some: {},
          },

          OR: [
            {
              nameRu: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              nameEn: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            slug: 'asc',
          },
        ],
        take: limit,
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,

          category: {
            select: {
              slug: true,
            },
          },

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
              imageKey: true,
            },
          },
        },
      }),

      this.prisma.productVariant.findMany({
        where: {
          isPublished: true,

          product: {
            isPublished: true,

            category: {
              isPublished: true,
            },

            images: {
              some: {},
            },
          },

          OR: [
            {
              nameRu: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              nameEn: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            slug: 'asc',
          },
        ],
        take: limit,
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,

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
              imageKey: true,
            },
          },

          product: {
            select: {
              slug: true,
              nameRu: true,
              nameEn: true,

              category: {
                select: {
                  slug: true,
                },
              },

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
                  imageKey: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const results: ScoredSearchResult[] = [];

    for (const category of categories) {
      results.push({
        id: category.id,
        type: SearchResultType.CATEGORY,

        name: isEnglish
          ? category.nameEn
          : category.nameRu,

        slug: category.slug,
        categorySlug: null,
        variantSlug: null,
        parentProductName: null,

        imageUrl: category.imagePath
          ? this.storageService.getPublicUrl(
              category.imagePath,
            )
          : null,

        score: this.getScore(
          searchTerm,
          [category.nameRu, category.nameEn],
          SearchResultType.CATEGORY,
        ),
      });
    }

    for (const product of products) {
      const cover = product.images[0];

      results.push({
        id: product.id,
        type: SearchResultType.PRODUCT,

        name: isEnglish
          ? product.nameEn
          : product.nameRu,

        slug: product.slug,
        categorySlug: product.category.slug,
        variantSlug: null,
        parentProductName: null,

        imageUrl: cover
          ? this.storageService.getPublicUrl(
              cover.imageKey,
            )
          : null,

        score: this.getScore(
          searchTerm,
          [product.nameRu, product.nameEn],
          SearchResultType.PRODUCT,
        ),
      });
    }

    for (const variant of variants) {
      const ownCover = variant.images[0];

      const productCover =
        variant.product.images[0];

      const resultingCover =
        ownCover ?? productCover;

      results.push({
        id: variant.id,
        type:
          SearchResultType.PRODUCT_VARIANT,

        name: isEnglish
          ? variant.nameEn
          : variant.nameRu,

        slug: variant.product.slug,

        categorySlug:
          variant.product.category.slug,

        variantSlug: variant.slug,

        parentProductName: isEnglish
          ? variant.product.nameEn
          : variant.product.nameRu,

        imageUrl: resultingCover
          ? this.storageService.getPublicUrl(
              resultingCover.imageKey,
            )
          : null,

        score: this.getScore(
          searchTerm,
          [variant.nameRu, variant.nameEn],
          SearchResultType.PRODUCT_VARIANT,
        ),
      });
    }

    return results
      .sort((first, second) => {
        if (first.score !== second.score) {
          return first.score - second.score;
        }

        return first.name.localeCompare(
          second.name,
          isEnglish ? 'en' : 'ru',
        );
      })
      .slice(0, limit)
      .map(({ score: _score, ...result }) =>
        result,
      );
  }

  private getScore(
    searchTerm: string,
    names: string[],
    type: SearchResultType,
  ): number {
    const normalizedSearchTerm =
      searchTerm.toLocaleLowerCase();

    const normalizedNames = names.map(
      (name) => name.toLocaleLowerCase(),
    );

    let nameScore = 3;

    if (
      normalizedNames.some(
        (name) =>
          name === normalizedSearchTerm,
      )
    ) {
      nameScore = 0;
    } else if (
      normalizedNames.some((name) =>
        name.startsWith(
          normalizedSearchTerm,
        ),
      )
    ) {
      nameScore = 1;
    } else if (
      normalizedNames.some((name) =>
        name.includes(
          normalizedSearchTerm,
        ),
      )
    ) {
      nameScore = 2;
    }

    const typeScore =
      type === SearchResultType.PRODUCT
        ? 0
        : type ===
            SearchResultType.PRODUCT_VARIANT
          ? 1
          : 2;

    return nameScore * 10 + typeScore;
  }
}