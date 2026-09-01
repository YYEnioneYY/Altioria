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

async function main(): Promise<void> {
  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
    select: { id: true },
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

main()
  .catch((error: unknown) => {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });