UPDATE "categories" AS category
SET
  "image_path" = initial_image.image_path,
  "updated_at" = CURRENT_TIMESTAMP
FROM (
  VALUES
    ('tables', 'categories/default/tables.webp'),
    ('lighting', 'categories/default/lighting.webp'),
    ('seating', 'categories/default/seating.webp'),
    ('storages', 'categories/default/storages.webp'),
    ('consoles', 'categories/default/consoles.webp'),
    ('mirrors', 'categories/default/mirrors.webp')
) AS initial_image(slug, image_path)
WHERE category."slug" = initial_image.slug
  AND category."image_path" IS NULL;