import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router';

import {
  AdminProductsApiError,
  DeleteAdminProductModal,
  getAdminProduct,
  type AdminProduct,
  type AdminProductImage,
} from '../../../features/admin-products';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} КБ`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function formatPrice(product: AdminProduct): string {
  if (product.priceType === 'ON_REQUEST') {
    return 'По запросу';
  }

  if (
    product.priceAmount === null ||
    product.priceCurrency === null
  ) {
    return 'Не указана';
  }

  const amount = Number(product.priceAmount);

  if (!Number.isFinite(amount)) {
    return `${product.priceAmount} ${product.priceCurrency}`;
  }

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: product.priceCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${product.priceAmount} ${product.priceCurrency}`;
  }
}

interface InfoItemProps {
  label: string;
  value: string | number | null;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  const displayedValue =
    value === null || value === ''
      ? 'Не указано'
      : value;

  return (
    <div className="border-b border-white/[0.07] py-4 last:border-b-0">
      <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-white/25">
        {label}
      </dt>

      <dd className="mt-2 text-sm text-white/70">
        {displayedValue}
      </dd>
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-24 rounded-3xl bg-white/[0.04]" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
        <div className="aspect-[4/3] rounded-3xl bg-white/[0.04]" />
        <div className="h-[30rem] rounded-3xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function AdminProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState<AdminProduct | null>(null);

  const [selectedImageId, setSelectedImageId] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError('Не указан ID товара');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminProduct(id);

      setProduct(result);
      setSelectedImageId(
        result.images[0]?.id ?? null,
      );
    } catch (requestError: unknown) {
      if (
        requestError instanceof
          AdminProductsApiError &&
        requestError.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });

        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось получить товар',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    document.title = product
      ? `${product.nameRu} — Altioria`
      : 'Товар — Altioria';
  }, [product]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <section className="flex min-h-[60dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#3a2020] text-[#e4aaaa]">
            !
          </span>

          <h1 className="mt-5 text-2xl font-medium">
            Не удалось открыть товар
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/35">
            {error ?? 'Товар не найден'}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/admin/products"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              К списку товаров
            </Link>

            <button
              type="button"
              onClick={() => void loadProduct()}
              className="h-11 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5]"
            >
              Повторить
            </button>
          </div>
        </div>
      </section>
    );
  }

  const selectedImage: AdminProductImage | undefined =
    product.images.find(
      (image) => image.id === selectedImageId,
    ) ?? product.images[0];

  return (
    <div className="mx-auto w-full max-w-[100rem]">
      <header className="mb-8 border-b border-white/[0.07] pb-7">
        <Link
          to="/admin/products"
          className="mb-5 inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Все товары
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                  product.isPublished
                    ? 'border-[#91c89a]/20 bg-[#142017] text-[#a7d6ae]'
                    : 'border-white/10 bg-white/[0.035] text-white/40'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    product.isPublished
                      ? 'bg-[#91c89a]'
                      : 'bg-white/30'
                  }`}
                />

                {product.isPublished
                  ? 'Опубликован'
                  : 'Черновик'}
              </span>

              <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1 text-xs text-white/35">
                {product.category.nameRu}
              </span>
            </div>

            <h1 className="break-words text-3xl font-medium tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              {product.nameRu}
            </h1>

            <p className="mt-2 text-lg text-white/30">
              {product.nameEn}
            </p>
          </div>

          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => void loadProduct()}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white sm:flex-none"
            >
              Обновить
            </button>
                          
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5] sm:flex-none"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  d="M14.5 5.5l4 4M6 18l2.3-5.2L16.8 4.3a1.4 1.4 0 012 0l.9.9a1.4 1.4 0 010 2l-8.5 8.5L6 18z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
                          
              Изменить
            </Link>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d99595]/15 bg-[#d99595]/[0.055] px-4 text-sm text-[#d99595]/75 transition-colors hover:border-[#d99595]/30 hover:bg-[#d99595]/10 hover:text-[#e4aaaa] sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  d="M5 7h14M9 7V4.5h6V7M7.5 7l.7 12h7.6l.7-12M10 10.5v5M14 10.5v5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>

              Удалить
            </button>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.02]">
            <div className="flex aspect-[4/3] items-center justify-center bg-[#0b0b0b]">
              {selectedImage ? (
                <img
                  src={selectedImage.imageUrl}
                  alt={
                    selectedImage.altRu ??
                    product.nameRu
                  }
                  draggable={false}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-sm text-white/25">
                  Изображения отсутствуют
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto border-t border-white/[0.07] p-4">
                {product.images.map(
                  (image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() =>
                        setSelectedImageId(image.id)
                      }
                      className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border transition-colors ${
                        selectedImage?.id === image.id
                          ? 'border-white/60'
                          : 'border-white/[0.08] hover:border-white/25'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wide text-white/70">
                          Обложка
                        </span>
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              Описание
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <article>
                <h2 className="text-sm font-medium text-white/70">
                  Русский
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-[1.75] text-white/40">
                  {product.descriptionRu}
                </p>
              </article>

              <article>
                <h2 className="text-sm font-medium text-white/70">
                  English
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-[1.75] text-white/40">
                  {product.descriptionEn}
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              Материалы
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <article>
                <h2 className="text-sm font-medium text-white/70">
                  Русский
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-[1.75] text-white/40">
                  {product.materialsRu ??
                    'Не указаны'}
                </p>
              </article>

              <article>
                <h2 className="text-sm font-medium text-white/70">
                  English
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-[1.75] text-white/40">
                  {product.materialsEn ??
                    'Не указаны'}
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
                  Вложения
                </p>

                <h2 className="mt-2 text-xl font-medium">
                  Файлы
                </h2>
              </div>

              <span className="text-xs text-white/25">
                {product.files.length}
              </span>
            </div>

            {product.files.length > 0 ? (
              <div className="mt-6 space-y-2">
                {product.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[0.65rem] font-medium uppercase text-white/55">
                      {file.type === 'MODEL_3D'
                        ? '3D'
                        : 'PDF'}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white/70">
                        {file.labelRu ??
                          file.originalName}
                      </span>

                      <span className="mt-1 block text-xs text-white/25">
                        {formatBytes(file.sizeBytes)}
                      </span>
                    </span>

                    <span className="text-lg text-white/25">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-white/25">
                К товару не прикреплены файлы
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-8">
          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              Характеристики
            </p>

            <dl className="mt-3">
              <InfoItem
                label="Стоимость"
                value={formatPrice(product)}
              />

              <InfoItem
                label="Высота"
                value={
                  product.heightMm === null
                    ? null
                    : `${product.heightMm} мм`
                }
              />

              <InfoItem
                label="Ширина"
                value={
                  product.widthMm === null
                    ? null
                    : `${product.widthMm} мм`
                }
              />

              <InfoItem
                label="Глубина"
                value={
                  product.depthMm === null
                    ? null
                    : `${product.depthMm} мм`
                }
              />

              <InfoItem
                label="Дополнительных исполнений"
                value={product.variantsCount}
              />
            </dl>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              Системная информация
            </p>

            <dl className="mt-3">
              <InfoItem
                label="Slug"
                value={`/${product.slug}`}
              />

              <InfoItem
                label="Категория"
                value={`${product.category.nameRu} / ${product.category.nameEn}`}
              />

              <InfoItem
                label="Порядок"
                value={product.sortOrder}
              />

              <InfoItem
                label="Фотографий"
                value={product.images.length}
              />

              <InfoItem
                label="Создан"
                value={formatDate(product.createdAt)}
              />

              <InfoItem
                label="Обновлён"
                value={formatDate(product.updatedAt)}
              />
            </dl>
          </section>
        </aside>
      </div>

      {isDeleteModalOpen && (
        <DeleteAdminProductModal
          product={product}
          onClose={() =>
            setIsDeleteModalOpen(false)
          }
          onDeleted={() => {
            setIsDeleteModalOpen(false);
          
            navigate('/admin/products', {
              replace: true,
            });
          }}
        />
      )}
    </div>
  );
}