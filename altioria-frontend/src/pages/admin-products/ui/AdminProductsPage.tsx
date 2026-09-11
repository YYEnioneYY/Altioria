import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router';

import {
  AdminProductsApiError,
  getAdminProducts,
  type AdminProduct,
} from '../../../features/admin-products';

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}

interface ProductImageProps {
  src: string | null;
  alt: string;
}

const skeletonItems = Array.from(
  {
    length: 8,
  },
  (_, index) => index,
);

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatPrice(
  product: AdminProduct,
): string {
  if (product.priceType === 'ON_REQUEST') {
    return 'По запросу';
  }

  if (!product.priceAmount) {
    return 'Цена не указана';
  }

  const amount = Number(product.priceAmount);

  if (!Number.isFinite(amount)) {
    return product.priceAmount;
  }

  if (!product.priceCurrency) {
    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 2,
    }).format(amount);
  }

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: product.priceCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 2,
    }).format(amount)} ${product.priceCurrency}`;
  }
}

function ProductImage({
  src,
  alt,
}: ProductImageProps) {
  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-white/[0.025] text-white/20">
        <div className="flex flex-col items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-8 w-8"
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

            <circle
              cx="9"
              cy="9.5"
              r="1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />

            <path
              d="M5.5 17l4.5-4 3 2.5 2.5-2 3 3"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.4"
            />
          </svg>

          <span className="text-xs">
            Нет изображения
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[4/5] overflow-hidden bg-white/[0.025]">
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        onError={() => setHasError(true)}
        className="block h-full w-full object-cover transition-[filter,transform] duration-700 ease-in-out group-hover:scale-[1.015] group-hover:brightness-[1.04]"
      />
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: AdminProduct;
}) {
  const coverImage =
    product.images[0] ?? null;

  return (
    <Link
      to={`/admin/products/${product.id}`}
      aria-label={`Открыть товар ${product.nameRu}`}
      draggable={false}
      className="group block overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] text-white transition-[border-color,background-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.035] hover:shadow-[0_1.5rem_4rem_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <div className="relative overflow-hidden">
        <ProductImage
          src={coverImage?.imageUrl ?? null}
          alt={
            coverImage?.altRu ??
            product.nameRu
          }
        />

        <span className="absolute left-3 top-3 max-w-[60%] truncate rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[0.68rem] font-medium text-white/65 backdrop-blur-lg">
          {product.category.nameRu}
        </span>

        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-medium backdrop-blur-lg ${
            product.isPublished
              ? 'border-[#91c89a]/20 bg-[#142017]/85 text-[#a7d6ae]'
              : 'border-white/10 bg-[#141414]/85 text-white/45'
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

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 pb-4 pt-14">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[0.67rem] text-white/60 backdrop-blur-md">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-3.5 w-3.5"
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

              {product.images.length}
            </span>

            {product.files.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[0.67rem] text-white/60 backdrop-blur-md">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="M7 3.5h7l4 4V20H7V3.5zM14 3.5V8h4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>

                {product.files.length}
              </span>
            )}
          </div>

          <span className="rounded-lg border border-white/10 bg-black/45 px-2 py-1 text-[0.65rem] text-white/40 backdrop-blur-md">
            #{product.sortOrder}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium tracking-[-0.025em]">
              {product.nameRu}
            </h2>

            <p className="mt-1 truncate text-sm text-white/35">
              {product.nameEn}
            </p>
          </div>

          {product.variantsCount > 0 && (
            <span
              title="Количество дополнительных исполнений"
              className="flex h-8 shrink-0 items-center rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 text-xs text-white/45"
            >
              +{product.variantsCount}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
          <div>
            <p className="text-[0.63rem] uppercase tracking-[0.13em] text-white/20">
              Стоимость
            </p>

            <p className="mt-1 text-sm font-medium text-white/70">
              {formatPrice(product)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[0.63rem] uppercase tracking-[0.13em] text-white/20">
              Исполнения
            </p>

            <p className="mt-1 text-sm text-white/55">
              {product.variantsCount}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <code className="min-w-0 truncate text-xs text-white/25">
            /{product.slug}
          </code>

          <span className="inline-flex shrink-0 items-center gap-2 text-[0.67rem] text-white/25 transition-colors duration-300 group-hover:text-white/60">
            {formatDate(product.updatedAt)}

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M5 12h14M14 7l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function AdminProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<
    AdminProduct[] | null
  >(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadProducts =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const loadedProducts =
          await getAdminProducts();

        setProducts(loadedProducts);
      } catch (error: unknown) {
        if (
          error instanceof
            AdminProductsApiError &&
          error.status === 401
        ) {
          navigate('/admin/login', {
            replace: true,
          });

          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить товары',
        );
      } finally {
        setIsLoading(false);
      }
    }, [navigate]);

  useEffect(() => {
    document.title =
      'Товары — панель управления Altioria';

    void loadProducts();

    return () => {
      document.title = 'Altioria';
    };
  }, [loadProducts]);

  const categoryFilters =
    useMemo<CategoryFilter[]>(() => {
      const categoryMap = new Map<
        string,
        CategoryFilter
      >();

      for (const product of products ?? []) {
        const existingCategory =
          categoryMap.get(product.category.id);

        if (existingCategory) {
          existingCategory.count += 1;
          continue;
        }

        categoryMap.set(
          product.category.id,
          {
            id: product.category.id,
            name: product.category.nameRu,
            count: 1,
          },
        );
      }

      return Array.from(
        categoryMap.values(),
      );
    }, [products]);

  useEffect(() => {
    if (selectedCategoryId === 'all') {
      return;
    }

    const categoryStillExists =
      categoryFilters.some(
        (category) =>
          category.id ===
          selectedCategoryId,
      );

    if (!categoryStillExists) {
      setSelectedCategoryId('all');
    }
  }, [
    categoryFilters,
    selectedCategoryId,
  ]);

  const displayedProducts = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLocaleLowerCase();

    return (products ?? []).filter(
      (product) => {
        const matchesCategory =
          selectedCategoryId === 'all' ||
          product.categoryId ===
            selectedCategoryId;

        if (!matchesCategory) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          product.nameRu,
          product.nameEn,
          product.slug,
          product.category.nameRu,
          product.category.nameEn,
        ].some((value) =>
          value
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        );
      },
    );
  }, [
    products,
    searchQuery,
    selectedCategoryId,
  ]);

  const isInitialLoading =
    products === null && isLoading;

  return (
    <section>
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
            Управление каталогом
          </p>

          <div className="flex items-end gap-4">
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
              Товары
            </h1>

            {products !== null && (
              <span className="mb-1.5 flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs text-white/40">
                {products.length}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-[38rem] text-sm leading-relaxed text-white/35">
            Все товары, изображения, файлы и
            дополнительные исполнения каталога
            Altioria.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void loadProducts()}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-4 w-4 ${
                isLoading ? 'animate-spin' : ''
              }`}
            >
              <path
                d="M20 7v5h-5M4 17v-5h5M18.4 9A7 7 0 006.7 6.6L4 9M5.6 15A7 7 0 0017.3 17.4L20 15"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          
            Обновить
          </button>
          
          <Link
            to="/admin/products/new"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5] sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            </svg>
          
            Добавить товар
          </Link>
        </div>
      </header>

      {error && products !== null && (
        <div
          role="alert"
          className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.06] px-4 py-3"
        >
          <p className="text-sm text-[#e4aaaa]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadProducts()}
            className="shrink-0 text-xs text-white/50 transition-colors hover:text-white"
          >
            Повторить
          </button>
        </div>
      )}

      {products !== null &&
        products.length > 0 && (
          <>
            {/* Полоса категорий */}

            <div className="mb-5 rounded-[1.4rem] border border-white/[0.07] bg-white/[0.025] p-2">
              <div
                role="tablist"
                aria-label="Фильтр товаров по категории"
                className="flex flex-wrap gap-1.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    selectedCategoryId === 'all'
                  }
                  onClick={() =>
                    setSelectedCategoryId('all')
                  }
                  className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition-[background-color,color,box-shadow] duration-300 ${
                    selectedCategoryId === 'all'
                      ? 'bg-white text-black shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.2)]'
                      : 'text-white/40 hover:bg-white/[0.055] hover:text-white/75'
                  }`}
                >
                  Все

                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] ${
                      selectedCategoryId === 'all'
                        ? 'bg-black/10 text-black/60'
                        : 'bg-white/[0.055] text-white/30'
                    }`}
                  >
                    {products.length}
                  </span>
                </button>

                {categoryFilters.map(
                  (category) => {
                    const isActive =
                      selectedCategoryId ===
                      category.id;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() =>
                          setSelectedCategoryId(
                            category.id,
                          )
                        }
                        className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm transition-[background-color,color,box-shadow] duration-300 ${
                          isActive
                            ? 'bg-white text-black shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.2)]'
                            : 'text-white/40 hover:bg-white/[0.055] hover:text-white/75'
                        }`}
                      >
                        {category.name}

                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.65rem] ${
                            isActive
                              ? 'bg-black/10 text-black/60'
                              : 'bg-white/[0.055] text-white/30'
                          }`}
                        >
                          {category.count}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Поиск */}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-[25rem]">
                <span className="sr-only">
                  Найти товар
                </span>

                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
                >
                  <circle
                    cx="10.5"
                    cy="10.5"
                    r="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M15 15l5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>

                <input
                  type="search"
                  value={searchQuery}
                  placeholder="Найти товар..."
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-10 text-sm text-white outline-none transition-[border-color,background-color] duration-300 placeholder:text-white/20 hover:bg-white/[0.04] focus:border-white/20 focus:bg-white/[0.045]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Очистить поиск"
                    onClick={() =>
                      setSearchQuery('')
                    }
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/25 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </label>

              <p className="text-xs text-white/25">
                Показано{' '}
                <span className="text-white/50">
                  {displayedProducts.length}
                </span>{' '}
                из {products.length}
              </p>
            </div>
          </>
        )}

      {isInitialLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {skeletonItems.map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025]"
            >
              <div className="aspect-[4/5] animate-pulse bg-white/[0.045]" />

              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                <div className="h-10 animate-pulse rounded bg-white/[0.035]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {products === null &&
        !isLoading &&
        error && (
          <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-[1.75rem] border border-white/[0.07] bg-white/[0.02] px-5 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d99595]/10 text-[#d99595]">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-6 w-6"
              >
                <path
                  d="M12 8v5M12 17h.01M10.3 4.9L3.6 17a2 2 0 001.8 3h13.2a2 2 0 001.8-3L13.7 4.9a2 2 0 00-3.4 0z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <h2 className="text-lg font-medium">
              Не удалось загрузить товары
            </h2>

            <p className="mt-2 text-sm text-white/35">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadProducts()
              }
              className="mt-6 h-11 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5]"
            >
              Попробовать снова
            </button>
          </div>
        )}

      {products?.length === 0 && (
        <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.015] px-5 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-white/25">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path
                d="M5 7.5L12 4l7 3.5v9L12 20l-7-3.5v-9zM5 7.5l7 3.5 7-3.5M12 11v9"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <h2 className="text-lg font-medium">
            Товаров пока нет
          </h2>

          <p className="mt-2 text-sm text-white/35">
            Созданные товары появятся здесь.
          </p>
        </div>
      )}

      {products !== null &&
        products.length > 0 &&
        displayedProducts.length === 0 && (
          <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.015] px-5 text-center">
            <h2 className="text-lg font-medium">
              Ничего не найдено
            </h2>

            <p className="mt-2 text-sm text-white/35">
              Попробуйте изменить категорию или
              поисковый запрос.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
              }}
              className="mt-5 text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

      {displayedProducts.length > 0 && (
        <div
          id="admin-products-list"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {displayedProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}