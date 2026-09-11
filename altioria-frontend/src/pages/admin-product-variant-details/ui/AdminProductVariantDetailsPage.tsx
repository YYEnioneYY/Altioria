import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router';

import {
  AdminProductVariantsApiError,
  getAdminProductVariant,
  type AdminProductVariant,
} from '../../../features/admin-product-variants';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatFileSize(
  sizeBytes: number,
): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} Б`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} КБ`;
  }

  return `${(
    sizeBytes /
    1024 /
    1024
  ).toFixed(1)} МБ`;
}

function formatPrice(
  variant: AdminProductVariant,
): string {
  if (variant.priceType === null) {
    return 'Как у основного товара';
  }

  if (
    variant.priceType === 'ON_REQUEST'
  ) {
    return 'По запросу';
  }

  if (!variant.priceAmount) {
    return 'Стоимость не указана';
  }

  const amount = Number(
    variant.priceAmount,
  );

  if (Number.isNaN(amount)) {
    return variant.priceAmount;
  }

  if (!variant.priceCurrency) {
    return new Intl.NumberFormat(
      'ru-RU',
    ).format(amount);
  }

  try {
    return new Intl.NumberFormat(
      'ru-RU',
      {
        style: 'currency',
        currency:
          variant.priceCurrency,
        maximumFractionDigits: 2,
      },
    ).format(amount);
  } catch {
    return `${new Intl.NumberFormat(
      'ru-RU',
    ).format(amount)} ${
      variant.priceCurrency
    }`;
  }
}

function InformationCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <div className="mt-3 text-sm leading-relaxed text-white/70">
        {children}
      </div>
    </div>
  );
}

function InheritedValue() {
  return (
    <span className="inline-flex items-center gap-2 text-white/30">
      <span className="h-1.5 w-1.5 rounded-full bg-white/25" />

      Используется значение основного товара
    </span>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-[92rem] animate-pulse px-5 pb-20 pt-8 sm:px-8 lg:px-10">
      <div className="h-4 w-40 rounded bg-white/[0.06]" />

      <div className="mt-10 h-16 max-w-xl rounded-2xl bg-white/[0.06]" />

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="h-72 rounded-[1.75rem] bg-white/[0.04] lg:col-span-2" />
        <div className="h-72 rounded-[1.75rem] bg-white/[0.04]" />
      </div>
    </div>
  );
}

export function AdminProductVariantDetailsPage() {
  const {
    productId,
    variantId,
  } = useParams<{
    productId: string;
    variantId: string;
  }>();

  const navigate = useNavigate();

  const [variant, setVariant] =
    useState<AdminProductVariant | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadVariant =
    useCallback(async () => {
      if (!productId || !variantId) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const loadedVariant =
          await getAdminProductVariant(
            productId,
            variantId,
          );

        setVariant(loadedVariant);
      } catch (error: unknown) {
        if (
          error instanceof
            AdminProductVariantsApiError &&
          error.status === 401
        ) {
          navigate('/admin/login', {
            replace: true,
          });
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить исполнение',
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      navigate,
      productId,
      variantId,
    ]);

  useEffect(() => {
    void loadVariant();
  }, [loadVariant]);

  if (!productId || !variantId) {
    return (
      <Navigate
        to="/admin/products"
        replace
      />
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (loadError || !variant) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[92rem] items-center justify-center px-5">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-[#d99595]/20 bg-[#211515] p-7 text-center">
          <p className="text-sm leading-relaxed text-[#e4aaaa]">
            {loadError ??
              'Исполнение не найдено'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={`/admin/products/${productId}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Вернуться к товару
            </Link>

            <button
              type="button"
              onClick={() =>
                void loadVariant()
              }
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[92rem] px-5 pb-20 pt-8 sm:px-8 lg:px-10">
      <header className="mb-10">
        <Link
          to={`/admin/products/${productId}`}
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span>

          Вернуться к товару
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/25">
                Дополнительное исполнение
              </p>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium ${
                  variant.isPublished
                    ? 'border-[#91c89a]/20 bg-[#142017] text-[#a7d6ae]'
                    : 'border-white/10 bg-white/[0.035] text-white/40'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    variant.isPublished
                      ? 'bg-[#91c89a]'
                      : 'bg-white/30'
                  }`}
                />

                {variant.isPublished
                  ? 'Опубликовано'
                  : 'Черновик'}
              </span>
            </div>

            <h1 className="max-w-[55rem] break-words text-[clamp(2.15rem,4.5vw,3.9rem)] font-medium leading-[0.96] tracking-[-0.045em]">
              {variant.nameRu}
            </h1>

            <p className="mt-4 text-lg text-white/35">
              {variant.nameEn}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
            <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 text-white/25"
              >
                <path
                  d="M8 6h12M4 6h.01M8 12h12M4 12h.01M8 18h12M4 18h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.7"
                />
              </svg>
                          
              <span className="text-xs text-white/30">
                Позиция
              </span>
                          
              <span className="text-sm font-medium text-white/65">
                #{variant.sortOrder}
              </span>
            </div>
                          
            <Link
              to={`/admin/products/${productId}/variants/${variant.id}/edit`}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-[background-color,transform] duration-300 hover:bg-[#d6d6d6] active:scale-[0.98]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-6"
              >
                <path
                  d="M14.5 5.5l4 4M6 18l2.3-5.2L16.8 4.3a1.4 1.4 0 012 0l.9.9a1.4 1.4 0 010 2l-8.5 8.5L6 18zM6 18l4-.7"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
                          
              Изменить
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.7fr)]">
        <main className="space-y-6">
          <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025]">
            <div className="border-b border-white/[0.07] p-5 sm:p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-white/25">
                Галерея исполнения
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-medium">
                  Изображения
                </h2>

                <span className="text-xs text-white/30">
                  {variant.images.length}{' '}
                  изображений
                </span>
              </div>
            </div>

            {variant.images.length > 0 ? (
              <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-5">
                {variant.images.map(
                  (image, index) => (
                    <figure
                      key={image.id}
                      className={`relative overflow-hidden rounded-2xl ${
                        index === 0
                          ? 'sm:col-span-2'
                          : ''
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={
                          image.altRu ??
                          variant.nameRu
                        }
                        draggable={false}
                        className={`block w-full bg-[#151515] object-cover ${
                          index === 0
                            ? 'aspect-[16/9]'
                            : 'aspect-[4/3]'
                        }`}
                      />

                      {index === 0 && (
                        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[0.68rem] text-white/70 backdrop-blur-md">
                          Главное изображение
                        </span>
                      )}
                    </figure>
                  ),
                )}
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-white/30">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <rect
                      x="3.5"
                      y="4.5"
                      width="17"
                      height="15"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M5.5 17l4.5-4 3 2.5 2.5-2 3 3"
                      fill="none"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                <h3 className="mt-5 text-base font-medium">
                  Используются изображения
                  товара
                </h3>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/30">
                  У исполнения нет собственной
                  галереи. На публичной странице
                  будут показаны фотографии
                  основного товара.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Содержание
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Описание
            </h2>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/25">
                  Русский
                </p>

                {variant.descriptionRu ? (
                  <p className="whitespace-pre-line text-sm leading-[1.75] text-white/60">
                    {variant.descriptionRu}
                  </p>
                ) : (
                  <InheritedValue />
                )}
              </div>

              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-white/25">
                  English
                </p>

                {variant.descriptionEn ? (
                  <p className="whitespace-pre-line text-sm leading-[1.75] text-white/60">
                    {variant.descriptionEn}
                  </p>
                ) : (
                  <InheritedValue />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Материалы
            </p>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <InformationCard label="Русский">
                {variant.materialsRu ?? (
                  <InheritedValue />
                )}
              </InformationCard>

              <InformationCard label="English">
                {variant.materialsEn ?? (
                  <InheritedValue />
                )}
              </InformationCard>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/25">
                  Вложения
                </p>

                <h2 className="mt-2 text-xl font-medium">
                  Файлы исполнения
                </h2>
              </div>

              <span className="text-xs text-white/30">
                {variant.files.length}
              </span>
            </div>

            {variant.files.length > 0 ? (
              <div className="mt-6 space-y-3">
                {variant.files.map(
                  (file) => (
                    <a
                      key={file.id}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.15] hover:bg-white/[0.045]"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-xs font-medium text-white/45">
                          {file.type === 'PDF'
                            ? 'PDF'
                            : '3D'}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm text-white/70">
                            {file.labelRu ??
                              file.originalName}
                          </p>

                          <p className="mt-1 truncate text-xs text-white/25">
                            {file.originalName}
                            {' · '}
                            {formatFileSize(
                              file.sizeBytes,
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-white/25 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </a>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-9 text-center text-sm text-white/30">
                Для этого исполнения файлы не
                загружены
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Параметры
            </p>

            <div className="mt-5 space-y-3">
              <InformationCard label="Стоимость">
                {formatPrice(variant)}
              </InformationCard>

              <div className="grid grid-cols-3 gap-2">
                <InformationCard label="Высота">
                  {variant.heightMm !== null
                    ? `${variant.heightMm} мм`
                    : 'Основная'}
                </InformationCard>

                <InformationCard label="Ширина">
                  {variant.widthMm !== null
                    ? `${variant.widthMm} мм`
                    : 'Основная'}
                </InformationCard>

                <InformationCard label="Глубина">
                  {variant.depthMm !== null
                    ? `${variant.depthMm} мм`
                    : 'Основная'}
                </InformationCard>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Системная информация
            </p>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs text-white/25">
                  Slug
                </dt>

                <dd className="mt-1 break-all font-mono text-xs text-white/55">
                  /{variant.slug}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-white/25">
                  Изображения
                </dt>

                <dd className="mt-1 text-sm text-white/55">
                  {variant.usesProductImages
                    ? 'Из основного товара'
                    : 'Собственные'}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-white/25">
                  Создано
                </dt>

                <dd className="mt-1 text-sm text-white/55">
                  {formatDate(
                    variant.createdAt,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-white/25">
                  Обновлено
                </dt>

                <dd className="mt-1 text-sm text-white/55">
                  {formatDate(
                    variant.updatedAt,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-white/25">
                  ID
                </dt>

                <dd className="mt-1 break-all font-mono text-[0.7rem] text-white/30">
                  {variant.id}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}