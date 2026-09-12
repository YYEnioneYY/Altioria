import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
} from 'react-router';
import {
  DragDropProvider,
} from '@dnd-kit/react';
import {
  isSortable,
  useSortable,
} from '@dnd-kit/react/sortable';

import {
  AdminProductVariantsApiError,
  getAdminProductVariants,
  reorderAdminProductVariants,
  type AdminProductVariant,
} from '../../../features/admin-product-variants';

interface AdminProductVariantsSectionProps {
  productId: string;
  productCoverImageUrl: string | null;
}

interface VariantCoverProps {
  src: string | null;
  alt: string;
}

function VariantCover({
  src,
  alt,
}: VariantCoverProps) {
  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-white/[0.025]">
        <div className="text-center text-white/20">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mx-auto h-7 w-7"
          >
            <rect
              x="3.5"
              y="4.5"
              width="17"
              height="15"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />

            <path
              d="M5.5 17l4.5-4 3 2.5 2.5-2 3 3"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.4"
            />
          </svg>

          <p className="mt-2 text-xs">
            Нет изображения
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[16/10] overflow-hidden bg-black">
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover transition-[filter,transform] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] group-hover:brightness-105"
      />
    </div>
  );
}

function formatPrice(
  variant: AdminProductVariant,
): string {
  if (variant.priceType === null) {
    return 'Как у товара';
  }

  if (variant.priceType === 'ON_REQUEST') {
    return 'По запросу';
  }

  if (
    variant.priceAmount === null ||
    variant.priceCurrency === null
  ) {
    return 'Не указана';
  }

  const amount = Number(
    variant.priceAmount,
  );

  if (!Number.isFinite(amount)) {
    return `${variant.priceAmount} ${variant.priceCurrency}`;
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
    return `${variant.priceAmount} ${variant.priceCurrency}`;
  }
}

function formatDimensions(
  variant: AdminProductVariant,
): string {
  const dimensions = [
    variant.widthMm,
    variant.heightMm,
    variant.depthMm,
  ];

  if (
    dimensions.every(
      (dimension) => dimension === null,
    )
  ) {
    return 'Как у товара';
  }

  return dimensions
    .map((dimension) =>
      dimension === null
        ? 'осн.'
        : String(dimension),
    )
    .join(' × ')
    .concat(' мм');
}

function VariantCard({
  variant,
  productCoverImageUrl,
  isReordering,
  displayPosition,
}: {
  variant: AdminProductVariant;
  productCoverImageUrl: string | null;
  isReordering: boolean;
  displayPosition: number;
}) {
  const coverImageUrl =
    variant.images[0]?.imageUrl ??
    (variant.usesProductImages
      ? productCoverImageUrl
      : null);

  const cardClassName = `group block min-w-0 overflow-hidden rounded-[1.15rem] border bg-white/[0.022] transition-[border-color,background-color,box-shadow,opacity] duration-500 ${
    isReordering
      ? 'cursor-default border-white/[0.14]'
      : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.035] hover:shadow-[0_1rem_3rem_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30'
  }`;

  const cardContent = (
    <>
      <div className="relative overflow-hidden">
        <VariantCover
          src={coverImageUrl}
          alt={variant.nameRu}
        />

        <span
          className={`absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem] font-medium backdrop-blur-lg ${
            variant.isPublished
              ? 'border-[#91c89a]/20 bg-[#142017]/85 text-[#a7d6ae]'
              : 'border-white/10 bg-[#141414]/85 text-white/45'
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

        {!isReordering && (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[0.64rem] text-white/55 backdrop-blur-lg">
            #{variant.sortOrder}
          </span>
        )}

        {isReordering && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[0.65rem] font-medium text-white/75 backdrop-blur-lg">
            Позиция {displayPosition}
          </span>
        )}

        {variant.usesProductImages && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[0.62rem] text-white/55 backdrop-blur-lg">
            Фото основного товара
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium tracking-[-0.025em]">
              {variant.nameRu}
            </h3>

            <p className="mt-0.5 truncate text-xs text-white/35">
              {variant.nameEn}
            </p>
          </div>

          {!isReordering && (
            <span className="mt-0.5 shrink-0 text-sm text-white/20 transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-white/60">
              →
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 min-h-9 text-xs leading-[1.5] text-white/30">
          {variant.descriptionRu ??
            'Используется описание основного товара'}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-3">
          <div className="min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.12em] text-white/20">
              Стоимость
            </p>

            <p className="mt-1 truncate text-xs text-white/65">
              {formatPrice(variant)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.12em] text-white/20">
              Размеры
            </p>

            <p
              title={formatDimensions(
                variant,
              )}
              className="mt-1 truncate text-xs text-white/50"
            >
              {formatDimensions(variant)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
          <div className="flex min-w-0 items-center gap-1.5 text-[0.68rem] text-white/30">
            <span className="truncate">
              {variant.usesProductImages
                ? 'Фото товара'
                : `${variant.images.length} фото`}
            </span>

            <span className="text-white/15">
              ·
            </span>

            <span className="shrink-0">
              {variant.files.length} файл.
            </span>
          </div>

          <code className="max-w-[45%] min-w-0 truncate text-[0.68rem] text-white/25">
            /{variant.slug}
          </code>
        </div>
      </div>
    </>
  );

  if (isReordering) {
    return (
      <article
        className={cardClassName}
      >
        {cardContent}
      </article>
    );
  }

  return (
    <Link
      to={`/admin/products/${variant.productId}/variants/${variant.id}`}
      aria-label={`Открыть исполнение ${variant.nameRu}`}
      className={cardClassName}
    >
      {cardContent}
    </Link>
  );
}

function SortableVariantItem({
  variant,
  index,
  productCoverImageUrl,
  isReordering,
  isSaving,
}: {
  variant: AdminProductVariant;
  index: number;
  productCoverImageUrl: string | null;
  isReordering: boolean;
  isSaving: boolean;
}) {
  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id: variant.id,
    index,
    disabled:
      !isReordering || isSaving,
  });

  return (
    <div
      ref={ref}
      className={`relative min-w-0 transition-[opacity,transform] duration-200 ${
        isDragSource
          ? 'z-20 opacity-75'
          : ''
      }`}
    >
      {isReordering && (
        <button
          ref={handleRef}
          type="button"
          disabled={isSaving}
          aria-label={`Переместить исполнение ${variant.nameRu}`}
          title="Зажмите и перетащите"
          className="absolute left-2.5 top-2.5 z-20 flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full border border-white/15 bg-black/75 text-white/70 shadow-lg backdrop-blur-md transition-colors hover:bg-white hover:text-black active:cursor-grabbing disabled:cursor-wait disabled:opacity-50"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <circle
              cx="8"
              cy="7"
              r="1"
              fill="currentColor"
            />

            <circle
              cx="16"
              cy="7"
              r="1"
              fill="currentColor"
            />

            <circle
              cx="8"
              cy="12"
              r="1"
              fill="currentColor"
            />

            <circle
              cx="16"
              cy="12"
              r="1"
              fill="currentColor"
            />

            <circle
              cx="8"
              cy="17"
              r="1"
              fill="currentColor"
            />

            <circle
              cx="16"
              cy="17"
              r="1"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      <VariantCard
        variant={variant}
        productCoverImageUrl={
          productCoverImageUrl
        }
        isReordering={isReordering}
        displayPosition={index + 1}
      />
    </div>
  );
}

const skeletonItems = [
  'one',
  'two',
  'three',
];

export function AdminProductVariantsSection({
  productId,
  productCoverImageUrl,
}: AdminProductVariantsSectionProps) {
  const navigate = useNavigate();

  const [variants, setVariants] =
    useState<
      AdminProductVariant[] | null
    >(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    isReordering,
    setIsReordering,
  ] = useState(false);

  const [
    isSavingOrder,
    setIsSavingOrder,
  ] = useState(false);

  const [
    reorderError,
    setReorderError,
  ] = useState<string | null>(null);

  const [
    orderSnapshot,
    setOrderSnapshot,
  ] = useState<
    AdminProductVariant[] | null
  >(null);

  const loadVariants =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const result =
          await getAdminProductVariants(
            productId,
          );

        setVariants(result);
        setIsReordering(false);
        setOrderSnapshot(null);
        setReorderError(null);
      } catch (
        requestError: unknown
      ) {
        if (
          requestError instanceof
            AdminProductVariantsApiError &&
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
            : 'Не удалось получить исполнения',
        );
      } finally {
        setIsLoading(false);
      }
    }, [navigate, productId]);

  useEffect(() => {
    void loadVariants();
  }, [loadVariants]);

  const startReordering = () => {
    if (
      !variants ||
      variants.length < 2
    ) {
      return;
    }

    setOrderSnapshot([...variants]);
    setReorderError(null);
    setIsReordering(true);
  };

  const cancelReordering = () => {
    if (isSavingOrder) {
      return;
    }

    if (orderSnapshot) {
      setVariants(orderSnapshot);
    }

    setOrderSnapshot(null);
    setReorderError(null);
    setIsReordering(false);
  };

  const saveOrder = async () => {
    if (!variants) {
      return;
    }

    setIsSavingOrder(true);
    setReorderError(null);

    try {
      const reorderedVariants =
        await reorderAdminProductVariants(
          productId,
          variants.map(
            (variant) => variant.id,
          ),
        );

      setVariants(reorderedVariants);
      setOrderSnapshot(null);
      setIsReordering(false);
    } catch (
      requestError: unknown
    ) {
      if (
        requestError instanceof
          AdminProductVariantsApiError &&
        requestError.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });

        return;
      }

      setReorderError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось сохранить порядок исполнений',
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <section className="mt-10 border-t border-white/[0.07] pt-9">
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
            Дополнительные исполнения
          </p>

          <div className="mt-2 flex items-end gap-3">
            <h2 className="text-2xl font-medium tracking-[-0.035em] sm:text-3xl">
              Варианты товара
            </h2>

            {variants && (
              <span className="mb-0.5 flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs text-white/40">
                {variants.length}
              </span>
            )}
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/30">
            Исполнения могут использовать
            собственные характеристики,
            стоимость, фотографии и файлы
            либо наследовать данные основного
            товара.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:shrink-0">
          {isReordering ? (
            <>
              <button
                type="button"
                disabled={isSavingOrder}
                onClick={
                  cancelReordering
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Отмена
              </button>

              <button
                type="button"
                disabled={isSavingOrder}
                onClick={() =>
                  void saveOrder()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSavingOrder && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                )}

                {isSavingOrder
                  ? 'Сохранение...'
                  : 'Сохранить порядок'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  void loadVariants()
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                Обновить
              </button>

              <button
                type="button"
                disabled={
                  !variants ||
                  variants.length < 2
                }
                title={
                  variants &&
                  variants.length < 2
                    ? 'Для перестановки нужно минимум два исполнения'
                    : 'Изменить порядок исполнений'
                }
                onClick={
                  startReordering
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.7"
                  />
                </svg>

                Изменить порядок
              </button>

              <Link
                to={`/admin/products/${productId}/variants/new`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Добавить исполнение
              </Link>
            </>
          )}
        </div>
      </header>

      {isReordering && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#d7bd82]/15 bg-[#d7bd82]/[0.045] px-4 py-3 text-sm text-[#d7bd82]/70">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
          >
            <path
              d="M12 3v18M8.5 6.5L12 3l3.5 3.5M8.5 17.5L12 21l3.5-3.5M3 12h18M6.5 8.5L3 12l3.5 3.5M17.5 8.5L21 12l-3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.4"
            />
          </svg>

          Зажмите кнопку из точек на карточке
          и перетащите исполнение на нужное
          место.
        </div>
      )}

      {reorderError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.05] px-4 py-3 text-sm text-[#e4aaaa]"
        >
          {reorderError}
        </div>
      )}

      {isLoading &&
        variants === null && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-4">
            {skeletonItems.map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-white/[0.025]"
                >
                  <div className="aspect-[16/10] animate-pulse bg-white/[0.045]" />

                  <div className="space-y-3 p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.06]" />

                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />

                    <div className="h-12 animate-pulse rounded bg-white/[0.035]" />
                  </div>
                </div>
              ),
            )}
          </div>
        )}

      {error && (
        <div
          role="alert"
          className="flex min-h-48 flex-col items-center justify-center rounded-[1.5rem] border border-[#d99595]/20 bg-[#d99595]/[0.045] px-5 text-center"
        >
          <p className="text-sm text-[#e4aaaa]">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadVariants()
            }
            className="mt-5 h-10 rounded-xl bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5]"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {!error &&
        variants?.length === 0 && (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.015] px-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl text-white/30">
              +
            </span>

            <h3 className="mt-4 text-lg font-medium">
              Дополнительных исполнений
              пока нет
            </h3>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/30">
              Сейчас посетители видят только
              основной товар. Здесь можно
              добавить его дополнительные
              исполнения.
            </p>

            <Link
              to={`/admin/products/${productId}/variants/new`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
            >
              Добавить исполнение
            </Link>
          </div>
        )}

      {!error &&
        variants &&
        variants.length > 0 && (
          <DragDropProvider
            onDragEnd={(event) => {
              if (
                event.canceled ||
                !isReordering ||
                isSavingOrder
              ) {
                return;
              }

              const { source } =
                event.operation;

              if (!isSortable(source)) {
                return;
              }

              const {
                initialIndex,
                index,
              } = source;

              if (
                initialIndex === index
              ) {
                return;
              }

              setReorderError(null);

              setVariants(
                (currentVariants) => {
                  if (!currentVariants) {
                    return currentVariants;
                  }

                  const reorderedVariants =
                    [...currentVariants];

                  const [movedVariant] =
                    reorderedVariants.splice(
                      initialIndex,
                      1,
                    );

                  if (!movedVariant) {
                    return currentVariants;
                  }

                  reorderedVariants.splice(
                    index,
                    0,
                    movedVariant,
                  );

                  return reorderedVariants;
                },
              );
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-4">
              {variants.map(
                (variant, index) => (
                  <SortableVariantItem
                    key={variant.id}
                    variant={variant}
                    index={index}
                    productCoverImageUrl={
                      productCoverImageUrl
                    }
                    isReordering={
                      isReordering
                    }
                    isSaving={
                      isSavingOrder
                    }
                  />
                ),
              )}
            </div>
          </DragDropProvider>
        )}
    </section>
  );
}