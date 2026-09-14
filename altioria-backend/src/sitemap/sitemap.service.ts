import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const sitemapLocales = ['ru', 'en'] as const;

type SitemapLocale =
  (typeof sitemapLocales)[number];

type ChangeFrequency =
  | 'weekly'
  | 'monthly'
  | 'yearly';

interface SitemapEntry {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: string;
  lastModified?: Date;
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not specified`,
    );
  }

  return value;
}

function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) => {
      const replacements: Record<
        string,
        string
      > = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      };

      return (
        replacements[character] ??
        character
      );
    },
  );
}

@Injectable()
export class SitemapService {
  private readonly siteUrl =
    requireEnv('FRONTEND_URL').replace(
      /\/+$/,
      '',
    );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async generate(): Promise<string> {
    const [categories, products] =
      await Promise.all([
        this.prisma.category.findMany({
          where: {
            isPublished: true,
          },

          select: {
            slug: true,
            updatedAt: true,
          },

          orderBy: {
            sortOrder: 'asc',
          },
        }),

        this.prisma.product.findMany({
          where: {
            isPublished: true,

            category: {
              isPublished: true,
            },
          },

          select: {
            slug: true,
            updatedAt: true,

            category: {
              select: {
                slug: true,
              },
            },
          },

          orderBy: [
            {
              category: {
                sortOrder: 'asc',
              },
            },
            {
              sortOrder: 'asc',
            },
          ],
        }),
      ]);

    const entries: SitemapEntry[] = [
      {
        path: '',
        changeFrequency: 'weekly',
        priority: '1.0',
      },

      {
        path: '/about',
        changeFrequency: 'monthly',
        priority: '0.7',
      },

      {
        path: '/products',
        changeFrequency: 'weekly',
        priority: '0.9',
      },

      {
        path: '/contacts',
        changeFrequency: 'monthly',
        priority: '0.5',
      },

      {
        path: '/privacy-policy',
        changeFrequency: 'yearly',
        priority: '0.3',
      },

      ...categories.map(
        (category): SitemapEntry => ({
          path: `/products/${encodeURIComponent(
            category.slug,
          )}`,

          changeFrequency: 'weekly',
          priority: '0.8',
          lastModified:
            category.updatedAt,
        }),
      ),

      ...products.map(
        (product): SitemapEntry => ({
          path: `/products/${encodeURIComponent(
            product.category.slug,
          )}/${encodeURIComponent(
            product.slug,
          )}`,

          changeFrequency: 'weekly',
          priority: '0.7',
          lastModified:
            product.updatedAt,
        }),
      ),
    ];

    const urls = entries.flatMap(
      (entry) =>
        sitemapLocales.map((locale) =>
          this.createUrl(
            entry,
            locale,
          ),
        ),
    );

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',

      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',

      ...urls,

      '</urlset>',
    ].join('\n');
  }

  private createUrl(
    entry: SitemapEntry,
    locale: SitemapLocale,
  ): string {
    const localizedUrl =
      this.createLocalizedUrl(
        locale,
        entry.path,
      );

    const defaultUrl =
      this.createLocalizedUrl(
        'ru',
        entry.path,
      );

    const alternateLinks =
      sitemapLocales.map(
        (alternateLocale) =>
          [
            '    <xhtml:link rel="alternate"',

            `      hreflang="${alternateLocale}"`,

            `      href="${escapeXml(
              this.createLocalizedUrl(
                alternateLocale,
                entry.path,
              ),
            )}" />`,
          ].join('\n'),
      );

    return [
      '  <url>',

      `    <loc>${escapeXml(
        localizedUrl,
      )}</loc>`,

      ...alternateLinks,

      [
        '    <xhtml:link rel="alternate"',
        '      hreflang="x-default"',
        `      href="${escapeXml(
          defaultUrl,
        )}" />`,
      ].join('\n'),

      ...(entry.lastModified
        ? [
            `    <lastmod>${entry.lastModified.toISOString()}</lastmod>`,
          ]
        : []),

      `    <changefreq>${entry.changeFrequency}</changefreq>`,

      `    <priority>${entry.priority}</priority>`,

      '  </url>',
    ].join('\n');
  }

  private createLocalizedUrl(
    locale: SitemapLocale,
    path: string,
  ): string {
    return `${this.siteUrl}/${locale}${path}`;
  }
}