import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === '') {
    throw new Error(`${name} is not specified`);
  }

  return value;
}

const databaseUrl = requireEnv('DATABASE_URL');

const username = requireEnv('ADMIN_SEED_USERNAME')
  .trim()
  .toLowerCase();

const password = requireEnv('ADMIN_SEED_PASSWORD');

if (!/^[a-z0-9._-]{3,50}$/.test(username)) {
  throw new Error(
    'ADMIN_SEED_USERNAME must contain 3–50 lowercase Latin characters, numbers, dots, underscores or hyphens',
  );
}

if (password.length < 12) {
  throw new Error(
    'ADMIN_SEED_PASSWORD must contain at least 12 characters',
  );
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  {
    slug: 'tables',
    nameRu: 'Столы',
    nameEn: 'Tables',
    sortOrder: 10,
  },
  {
    slug: 'lighting',
    nameRu: 'Освещение',
    nameEn: 'Lighting',
    sortOrder: 20,
  },
  {
    slug: 'seating',
    nameRu: 'Мягкая мебель',
    nameEn: 'Seating',
    sortOrder: 30,
  },
  {
    slug: 'storages',
    nameRu: 'Системы хранения',
    nameEn: 'Storages',
    sortOrder: 40,
  },
  {
    slug: 'consoles',
    nameRu: 'Консоли',
    nameEn: 'Consoles',
    sortOrder: 50,
  },
  {
    slug: 'mirrors',
    nameRu: 'Зеркала',
    nameEn: 'Mirrors',
    sortOrder: 60,
  },
];

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

async function seedCategories(): Promise<void> {
  await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: {
          slug: category.slug,
        },
        update: {
          nameRu: category.nameRu,
          nameEn: category.nameEn,
          sortOrder: category.sortOrder,
        },
        create: {
          ...category,
          imagePath: null,
          isPublished: false,
        },
      }),
    ),
  );

  console.log(`Categories seeded: ${categories.length}`);
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedCategories();
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });