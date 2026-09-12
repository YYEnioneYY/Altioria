import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  ProductFileType,
  ProductPriceType,
} from '../src/generated/prisma/client';

interface CatalogImage {
  imageKey: string;
  altRu: string | null;
  altEn: string | null;
  sortOrder: number;
}

interface CatalogFile {
  type: 'PDF' | 'MODEL_3D';
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  labelRu: string | null;
  labelEn: string | null;
  sortOrder: number;
}

interface CatalogVariant {
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string | null;
  descriptionEn: string | null;
  materialsRu: string | null;
  materialsEn: string | null;
  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;
  priceType: 'FIXED' | 'ON_REQUEST' | null;
  priceAmount: string | null;
  priceCurrency: string | null;
  sortOrder: number;
  isPublished: boolean;
  images: CatalogImage[];
  files: CatalogFile[];
}

interface CatalogProduct {
  categorySlug: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  materialsRu: string | null;
  materialsEn: string | null;
  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;
  priceType: 'FIXED' | 'ON_REQUEST';
  priceAmount: string | null;
  priceCurrency: string | null;
  sortOrder: number;
  isPublished: boolean;
  images: CatalogImage[];
  files: CatalogFile[];
  variants: CatalogVariant[];
}

interface CatalogCategory {
  slug: string;
  nameRu: string;
  nameEn: string;
  sortOrder: number;
  products: CatalogProduct[];
}

interface CatalogManifest {
  source: string;
  categories: CatalogCategory[];
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === '') {
    throw new Error(`${name} is not specified`);
  }

  return value;
}

const databaseUrl = requireEnv('DATABASE_URL');

const username = requireEnv('ADMIN_SEED_USERNAME').trim().toLowerCase();

const password = requireEnv('ADMIN_SEED_PASSWORD');

if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
  throw new Error(
    'ADMIN_SEED_USERNAME must contain 3–50 lowercase Latin characters, numbers, dots, underscores or hyphens',
  );
}

if (password.length < 12) {
  throw new Error('ADMIN_SEED_PASSWORD must contain at least 12 characters');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const catalogPath = path.resolve(process.cwd(), 'prisma/data/catalog.json');

function toPriceType(
  value: CatalogProduct['priceType'] | CatalogVariant['priceType'],
): ProductPriceType | null {
  if (value === null) {
    return null;
  }

  return value === 'FIXED'
    ? ProductPriceType.FIXED
    : ProductPriceType.ON_REQUEST;
}

function toFileType(value: CatalogFile['type']): ProductFileType {
  return value === 'PDF' ? ProductFileType.PDF : ProductFileType.MODEL_3D;
}

function createImages(images: CatalogImage[]) {
  return images.map((image) => ({
    imageKey: image.imageKey,
    altRu: image.altRu,
    altEn: image.altEn,
    sortOrder: image.sortOrder,
  }));
}

function createFiles(files: CatalogFile[]) {
  return files.map((file) => ({
    type: toFileType(file.type),
    fileKey: file.fileKey,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    labelRu: file.labelRu,
    labelEn: file.labelEn,
    sortOrder: file.sortOrder,
  }));
}

async function readCatalog(): Promise<CatalogManifest> {
  let contents: string;

  try {
    contents = await readFile(catalogPath, 'utf8');
  } catch (error: unknown) {
    throw new Error(
      `Catalog manifest was not found at ${catalogPath}. ` +
        'Run "node infra/catalog/download-old-catalog.mjs" from the repository root first.',
      { cause: error },
    );
  }

  const manifest: unknown = JSON.parse(contents);

  if (
    typeof manifest !== 'object' ||
    manifest === null ||
    !('categories' in manifest) ||
    !Array.isArray(manifest.categories)
  ) {
    throw new Error(`Invalid catalog manifest: ${catalogPath}`);
  }

  return manifest as CatalogManifest;
}

async function seedAdmin(): Promise<void> {
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (existingAdmin) {
    console.log(`Admin "${username}" already exists`);
    return;
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  const admin = await prisma.admin.create({
    data: {
      username,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });

  console.log('Admin created:', admin);
}

async function seedCatalog(): Promise<void> {
  const catalog = await readCatalog();
  let createdProducts = 0;
  let skippedProducts = 0;
  let createdVariants = 0;

  for (const categoryData of catalog.categories) {
    const category = await prisma.category.upsert({
      where: {
        slug: categoryData.slug,
      },
      update: {},
      create: {
        slug: categoryData.slug,
        nameRu: categoryData.nameRu,
        nameEn: categoryData.nameEn,
        imagePath: `categories/default/${categoryData.slug}.webp`,
        sortOrder: categoryData.sortOrder,
        isPublished: true,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    for (const product of categoryData.products) {
      const existingProduct = await prisma.product.findUnique({
        where: {
          slug: product.slug,
        },
        select: {
          id: true,
        },
      });

      if (existingProduct) {
        skippedProducts += 1;
        console.log(`Product "${product.slug}" already exists, skipping`);
        continue;
      }

      await prisma.product.create({
        data: {
          categoryId: category.id,
          slug: product.slug,
          nameRu: product.nameRu,
          nameEn: product.nameEn,
          descriptionRu: product.descriptionRu,
          descriptionEn: product.descriptionEn,
          materialsRu: product.materialsRu,
          materialsEn: product.materialsEn,
          heightMm: product.heightMm,
          widthMm: product.widthMm,
          depthMm: product.depthMm,
          priceType:
            toPriceType(product.priceType) ?? ProductPriceType.ON_REQUEST,
          priceAmount: product.priceAmount,
          priceCurrency: product.priceCurrency,
          sortOrder: product.sortOrder,
          isPublished: product.isPublished,
          images: {
            create: createImages(product.images),
          },
          files: {
            create: createFiles(product.files),
          },
          variants: {
            create: product.variants.map((variant) => ({
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
              priceType: toPriceType(variant.priceType),
              priceAmount: variant.priceAmount,
              priceCurrency: variant.priceCurrency,
              sortOrder: variant.sortOrder,
              isPublished: variant.isPublished,
              images: {
                create: createImages(variant.images),
              },
              files: {
                create: createFiles(variant.files),
              },
            })),
          },
        },
      });

      createdProducts += 1;
      createdVariants += product.variants.length;
      console.log(
        `Created product "${product.slug}" with ${product.variants.length} variants`,
      );
    }
  }

  console.log(
    `Catalog seed completed from ${catalog.source}: ` +
      `${createdProducts} products created, ` +
      `${createdVariants} variants created, ` +
      `${skippedProducts} products skipped`,
  );
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedCatalog();
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
