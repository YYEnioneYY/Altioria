import pg from 'pg';

const { Client } = pg;

const destructiveMigration =
  '20260906170504_edit_products_infra';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not specified');
}

const client = new Client({
  connectionString: databaseUrl,
});

async function relationExists(relationName) {
  const result = await client.query(
    'SELECT to_regclass($1) AS relation_name',
    [`public.${relationName}`],
  );

  return result.rows[0]?.relation_name !== null;
}

async function main() {
  await client.connect();

  const migrationsTableExists =
    await relationExists('_prisma_migrations');

  if (!migrationsTableExists) {
    console.log(
      'Migration preflight: fresh database, destructive migration is safe to apply.',
    );
    return;
  }

  const migrationResult = await client.query(
    `
      SELECT 1
      FROM "_prisma_migrations"
      WHERE "migration_name" = $1
        AND "finished_at" IS NOT NULL
        AND "rolled_back_at" IS NULL
      LIMIT 1
    `,
    [destructiveMigration],
  );

  if (migrationResult.rowCount > 0) {
    console.log(
      'Migration preflight: destructive catalog migration is already applied.',
    );
    return;
  }

  const productsTableExists =
    await relationExists('products');

  if (!productsTableExists) {
    console.log(
      'Migration preflight: products table does not exist, migration may continue.',
    );
    return;
  }

  const productsResult = await client.query(
    'SELECT COUNT(*)::integer AS count FROM "products"',
  );

  const productsCount = productsResult.rows[0]?.count ?? 0;

  if (productsCount === 0) {
    console.log(
      'Migration preflight: old products table is empty, migration may continue.',
    );
    return;
  }

  if (
    process.env.ALLOW_DESTRUCTIVE_CATALOG_MIGRATION ===
    'true'
  ) {
    console.warn(
      `Migration preflight: destructive migration explicitly allowed; ${productsCount} old product(s) will be removed.`,
    );
    return;
  }

  throw new Error(
    [
      `Migration ${destructiveMigration} would delete ${productsCount} existing product(s).`,
      'Create and verify a database backup before continuing.',
      'If these records are disposable, set ALLOW_DESTRUCTIVE_CATALOG_MIGRATION=true explicitly.',
    ].join(' '),
  );
}

try {
  await main();
} finally {
  await client.end();
}
