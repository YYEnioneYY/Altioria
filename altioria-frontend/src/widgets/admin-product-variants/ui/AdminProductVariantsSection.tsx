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
  AdminProductVariantsApiError,
  getAdminProductVariants,
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
    return 'Как у основного товара';
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

  const amount = Number(variant.priceAmount);

  if (!Number.isFinite(amount)) {
    return `${variant.priceAmount} ${variant.priceCurrency}`;
  }

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: variant.priceCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
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
    return 'Как у основного товара';
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
}: {
  variant: AdminProductVariant;
  productCoverImageUrl: string | null;
}) {
  const coverImageUrl =
    variant.images[0]?.imageUrl ??
    (variant.usesProductImages
      ? productCoverImageUrl
      : null);

  return (
    <Link
      to={`/admin/products/${variant.productId}/variants/${variant.id}`}
      aria-label={`Открыть исполнение ${variant.nameRu}`}
      className="group block min-w-0 overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-white/[0.022] transition-[border-color,background-color,box-shadow] duration-500 hover:border-white/[0.14] hover:bg-white/[0.035] hover:shadow-[0_1rem_3rem_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
    >
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

        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[0.64rem] text-white/55 backdrop-blur-lg">
          #{variant.sortOrder}
        </span>

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

          <span className="mt-0.5 shrink-0 text-sm text-white/20 transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-white/60">
            →
          </span>
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
              title={formatDimensions(variant)}
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
              {variant.files.length}{' '}
              файл.
            </span>
          </div>

          <code className="max-w-[45%] min-w-0 truncate text-[0.68rem] text-white/25">
            /{variant.slug}
          </code>
        </div>
      </div>
    </Link>
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

  const [variants, setVariants] = useState<
    AdminProductVariant[] | null
  >(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
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
      } catch (requestError: unknown) {
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

  return (
    <section className="mt-10 border-t border-white/[0.07] pt-9">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
            Исполнения могут использовать собственные
            характеристики, стоимость, фотографии и
            файлы либо наследовать данные основного
            товара.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void loadVariants()}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
          >
            Обновить
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
        </div>
      </header>

      {isLoading && variants === null && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-4">
          {skeletonItems.map((item) => (
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
          ))}
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
            onClick={() => void loadVariants()}
            className="mt-5 h-10 rounded-xl bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5]"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {!error && variants?.length === 0 && (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.015] px-5 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl text-white/30">
            +
          </span>

          <h3 className="mt-4 text-lg font-medium">
            Дополнительных исполнений пока нет
          </h3>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/30">
            Сейчас посетители видят только основной
            товар. Позже здесь можно будет добавить его
            дополнительные исполнения.
          </p>
        </div>
      )}

      {!error &&
        variants &&
        variants.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-4">
            {variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                productCoverImageUrl={
                  productCoverImageUrl
                }
              />
            ))}
          </div>
        )}
    </section>
  );
}
