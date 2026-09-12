# Импорт каталога со старого сайта

Скрипт `download-old-catalog.mjs` обходит опубликованные категории и товары на
`https://altioria.ru`, скачивает изображения в `infra/minio/products/seed` и
создаёт manifest `altioria-backend/prisma/data/catalog.json`.

Запускать из корня репозитория:

```powershell
node .\infra\catalog\download-old-catalog.mjs
```

После успешной загрузки запустить или пересобрать Docker Compose:

```powershell
docker compose up -d --build
```

Проверить импорт:

```powershell
docker compose logs --no-color minio-init backend-seed
```

Seed безопасно пропускает товары, slug которых уже существует. Для чистой базы
он создаёт все категории, товары, изображения и дополнительные исполнения из
manifest. `minio-init` рекурсивно загружает файлы из `infra/minio/products` в
ключи `products/...` бакета MinIO.

## Важное ограничение старого сайта

На старом сайте все показанные ссылки «Drawings» ведут на отсутствующий
`/docs/Horas.pdf` (HTTP 404), а элементы «3D Models» не содержат ссылок на
файлы. Загрузчик сообщает об этом и не создаёт фиктивные записи в базе. Реальные
PDF, GLB или GLTF можно позднее добавить через готовую админ-панель.
