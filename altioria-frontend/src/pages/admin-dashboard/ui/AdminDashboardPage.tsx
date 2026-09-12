import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useOutletContext,
} from 'react-router';

import type {
  AdminLoginResult,
} from '../../../features/admin-auth';

import {
  AdminCategoriesApiError,
  getAdminCategories,
  type AdminCategory,
} from '../../../features/admin-categories';

import {
  AdminProductsApiError,
  getAdminProducts,
  type AdminProduct,
} from '../../../features/admin-products';

interface AdminLayoutContext {
  admin: AdminLoginResult['admin'];
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Неизвестно';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-40 rounded bg-white/[0.05]" />

      <div className="mt-6 h-16 max-w-xl rounded-2xl bg-white/[0.05]" />

      <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {['one', 'two', 'three', 'four'].map(
          (item) => (
            <div
              key={item}
              className="h-32 rounded-[1.5rem] border border-white/[0.06] bg-white/[0.025]"
            />
          ),
        )}
      </div>

      <div className="mt-8 h-96 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025]" />
    </div>
  );
}

interface StatisticCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: 'green' | 'yellow' | 'neutral';
}

function StatisticCard({
  label,
  value,
  hint,
  accent = 'neutral',
}: StatisticCardProps) {
  const indicatorClassName = {
    green:
      'bg-[#91c89a] shadow-[0_0_1rem_rgba(145,200,154,0.5)]',

    yellow:
      'bg-[#d7bd82] shadow-[0_0_1rem_rgba(215,189,130,0.4)]',

    neutral:
      'bg-white/35 shadow-[0_0_1rem_rgba(255,255,255,0.2)]',
  }[accent];

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] p-5 transition-[border-color,background-color] duration-300 hover:border-white/[0.13] hover:bg-white/[0.04]">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${indicatorClassName}`}
          />

          <p className="text-[0.67rem] font-medium uppercase tracking-[0.15em] text-white/30">
            {label}
          </p>
        </div>

        <p className="mt-5 text-[2.6rem] font-medium leading-none tracking-[-0.055em] text-white">
          {value}
        </p>

        <p className="mt-3 text-xs text-white/25">
          {hint}
        </p>
      </div>
    </article>
  );
}

interface ProductCoverProps {
  product: AdminProduct;
}

function ProductCover({
  product,
}: ProductCoverProps) {
  const [hasError, setHasError] =
    useState(false);

  const imageUrl =
    product.images[0]?.imageUrl ?? null;

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (!imageUrl || hasError) {
    return (
      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/15">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5"
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
      </div>
    );
  }

  return (
    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
      <img
        src={imageUrl}
        alt={
          product.images[0]?.altRu ??
          product.nameRu
        }
        draggable={false}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover/row:scale-105"
      />
    </div>
  );
}

interface AttentionItemProps {
  label: string;
  description: string;
  count: number;
  to: string;
  important?: boolean;
}

function AttentionItem({
  label,
  description,
  count,
  to,
  important = false,
}: AttentionItemProps) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/15 px-4 py-3.5 transition-[border-color,background-color] hover:border-white/[0.12] hover:bg-white/[0.035]"
    >
      <div className="min-w-0">
        <p className="text-sm text-white/65 transition-colors group-hover:text-white">
          {label}
        </p>

        <p className="mt-1 text-xs text-white/25">
          {description}
        </p>
      </div>

      <span
        className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border px-2 text-xs font-medium ${
          important && count > 0
            ? 'border-[#d7bd82]/20 bg-[#d7bd82]/10 text-[#d7bd82]'
            : 'border-white/[0.07] bg-white/[0.035] text-white/40'
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

export function AdminDashboardPage() {
  const { admin } =
    useOutletContext<AdminLayoutContext>();

  const navigate = useNavigate();

  const [products, setProducts] =
    useState<AdminProduct[] | null>(null);

  const [categories, setCategories] =
    useState<AdminCategory[] | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    document.title =
      'Обзор панели управления — Altioria';

    return () => {
      document.title = 'Altioria';
    };
  }, []);

  const loadDashboard =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          loadedProducts,
          loadedCategories,
        ] = await Promise.all([
          getAdminProducts(),
          getAdminCategories(),
        ]);

        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (requestError: unknown) {
        const isUnauthorized =
          (requestError instanceof
            AdminProductsApiError &&
            requestError.status === 401) ||
          (requestError instanceof
            AdminCategoriesApiError &&
            requestError.status === 401);

        if (isUnauthorized) {
          navigate('/admin/login', {
            replace: true,
          });

          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не удалось загрузить данные обзора',
        );
      } finally {
        setIsLoading(false);
      }
    }, [navigate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statistics = useMemo(() => {
    const productList = products ?? [];
    const categoryList = categories ?? [];

    const publishedProducts =
      productList.filter(
        (product) => product.isPublished,
      ).length;

    const draftProducts =
      productList.length -
      publishedProducts;

    const totalVariants =
      productList.reduce(
        (total, product) =>
          total + product.variantsCount,
        0,
      );

    const productsWithoutImages =
      productList.filter(
        (product) =>
          product.images.length === 0,
      );

    const productsWithoutFiles =
      productList.filter(
        (product) =>
          product.files.length === 0,
      );

    const draftCategories =
      categoryList.filter(
        (category) =>
          !category.isPublished,
      );

    const emptyCategories =
      categoryList.filter(
        (category) =>
          !productList.some(
            (product) =>
              product.categoryId ===
              category.id,
          ),
      );

    return {
      publishedProducts,
      draftProducts,
      totalVariants,
      productsWithoutImages,
      productsWithoutFiles,
      draftCategories,
      emptyCategories,
    };
  }, [categories, products]);

  const recentlyUpdatedProducts =
    useMemo(
      () =>
        [...(products ?? [])]
          .sort(
            (first, second) =>
              new Date(
                second.updatedAt,
              ).getTime() -
              new Date(
                first.updatedAt,
              ).getTime(),
          )
          .slice(0, 6),
      [products],
    );

  const categoriesWithCounts =
    useMemo(
      () =>
        (categories ?? [])
          .map((category) => ({
            category,
            productsCount: (
              products ?? []
            ).filter(
              (product) =>
                product.categoryId ===
                category.id,
            ).length,
          }))
          .sort(
            (first, second) =>
              second.productsCount -
              first.productsCount,
          ),
      [categories, products],
    );

  if (
    isLoading &&
    products === null &&
    categories === null
  ) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-5">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-[#d99595]/20 bg-[#211515] p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d99595]/10 text-[#e4aaaa]">
            !
          </div>

          <h1 className="mt-5 text-xl font-medium">
            Не удалось открыть обзор
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#e4aaaa]/70">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] pb-20">
      <header className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
            Панель управления
          </p>

          <h1 className="text-[clamp(2.8rem,7vw,5.3rem)] font-medium leading-[0.9] tracking-[-0.055em]">
            Обзор
          </h1>

          <p className="mt-5 max-w-[38rem] text-sm leading-relaxed text-white/35">
            Добрый день,{' '}
            <strong className="font-medium text-white/70">
              {admin.username}
            </strong>
            . Здесь собрана основная информация о
            каталоге Altioria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              void loadDashboard()
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-4 w-4 ${
                isLoading
                  ? 'animate-spin'
                  : ''
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
          >
            <span className="text-lg leading-none">
              +
            </span>

            Добавить товар
          </Link>
        </div>
      </header>

      <section
        aria-label="Статистика каталога"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatisticCard
          label="Все товары"
          value={products?.length ?? 0}
          hint={`${statistics.draftProducts} в черновиках`}
        />

        <StatisticCard
          label="Опубликовано"
          value={
            statistics.publishedProducts
          }
          hint="Доступны посетителям"
          accent="green"
        />

        <StatisticCard
          label="Категории"
          value={categories?.length ?? 0}
          hint={`${statistics.draftCategories.length} в черновиках`}
          accent={
            statistics.draftCategories.length >
            0
              ? 'yellow'
              : 'neutral'
          }
        />

        <StatisticCard
          label="Исполнения"
          value={statistics.totalVariants}
          hint="Дополнительные варианты товаров"
        />
      </section>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.65fr)]">
        <section className="overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.022]">
          <header className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.17em] text-white/25">
                Каталог
              </p>

              <h2 className="mt-1.5 text-xl font-medium tracking-[-0.03em]">
                Недавно изменённые товары
              </h2>
            </div>

            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white"
            >
              Все товары
              <span aria-hidden="true">
                →
              </span>
            </Link>
          </header>

          {recentlyUpdatedProducts.length ===
          0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-xl text-white/25">
                +
              </div>

              <h3 className="mt-4 text-base font-medium">
                Товаров пока нет
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/30">
                Создайте первый товар, чтобы он
                появился в таблице.
              </p>

              <Link
                to="/admin/products/new"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-black"
              >
                Добавить товар
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left">
                      <th className="px-6 py-3 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/20">
                        Товар
                      </th>

                      <th className="px-4 py-3 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/20">
                        Статус
                      </th>

                      <th className="px-4 py-3 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/20">
                        Медиа
                      </th>

                      <th className="px-4 py-3 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/20">
                        Исполнения
                      </th>

                      <th className="px-6 py-3 text-right text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/20">
                        Изменён
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentlyUpdatedProducts.map(
                      (product) => (
                        <tr
                          key={product.id}
                          className="group/row border-b border-white/[0.055] transition-colors last:border-0 hover:bg-white/[0.025]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <ProductCover
                                product={product}
                              />

                              <div className="min-w-0">
                                <Link
                                  to={`/admin/products/${product.id}`}
                                  className="block truncate text-sm font-medium text-white/70 transition-colors hover:text-white"
                                >
                                  {product.nameRu}
                                </Link>

                                <p className="mt-1 truncate text-xs text-white/25">
                                  {
                                    product.category
                                      .nameRu
                                  }{' '}
                                  · /{product.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.67rem] ${
                                product.isPublished
                                  ? 'border-[#91c89a]/20 bg-[#91c89a]/[0.07] text-[#a7d6ae]'
                                  : 'border-white/[0.08] bg-white/[0.025] text-white/35'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  product.isPublished
                                    ? 'bg-[#91c89a]'
                                    : 'bg-white/25'
                                }`}
                              />

                              {product.isPublished
                                ? 'Опубликован'
                                : 'Черновик'}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <span>
                                {
                                  product.images
                                    .length
                                }{' '}
                                фото
                              </span>

                              <span className="text-white/15">
                                ·
                              </span>

                              <span>
                                {
                                  product.files
                                    .length
                                }{' '}
                                файл.
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 text-xs text-white/45">
                              {
                                product.variantsCount
                              }
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-xs text-white/25">
                                {formatDate(
                                  product.updatedAt,
                                )}
                              </span>

                              <Link
                                to={`/admin/products/${product.id}`}
                                aria-label={`Открыть товар ${product.nameRu}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 transition-[background-color,color,transform] hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white"
                              >
                                →
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/[0.06] md:hidden">
                {recentlyUpdatedProducts.map(
                  (product) => (
                    <Link
                      key={product.id}
                      to={`/admin/products/${product.id}`}
                      className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.025]"
                    >
                      <ProductCover
                        product={product}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-white/70">
                            {product.nameRu}
                          </h3>

                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              product.isPublished
                                ? 'bg-[#91c89a]'
                                : 'bg-white/25'
                            }`}
                          />
                        </div>

                        <p className="mt-1 truncate text-xs text-white/25">
                          {
                            product.category
                              .nameRu
                          }
                        </p>

                        <p className="mt-2 text-[0.68rem] text-white/20">
                          {product.images.length}{' '}
                          фото ·{' '}
                          {product.variantsCount}{' '}
                          исполн.
                        </p>
                      </div>

                      <span className="text-white/25">
                        →
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.022] p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.17em] text-white/25">
              Проверка каталога
            </p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <h2 className="text-xl font-medium tracking-[-0.03em]">
                Требует внимания
              </h2>

              <span className="mb-0.5 h-2 w-2 rounded-full bg-[#d7bd82] shadow-[0_0_0.8rem_rgba(215,189,130,0.45)]" />
            </div>

            <div className="mt-5 space-y-2">
              <AttentionItem
                label="Товары в черновиках"
                description="Не показываются посетителям"
                count={statistics.draftProducts}
                to="/admin/products"
                important
              />

              <AttentionItem
                label="Товары без изображений"
                description="Карточка останется без обложки"
                count={
                  statistics
                    .productsWithoutImages
                    .length
                }
                to="/admin/products"
                important
              />

              <AttentionItem
                label="Категории в черновиках"
                description="Скрыты из публичного каталога"
                count={
                  statistics.draftCategories
                    .length
                }
                to="/admin/categories"
              />

              <AttentionItem
                label="Пустые категории"
                description="В категории нет товаров"
                count={
                  statistics.emptyCategories
                    .length
                }
                to="/admin/categories"
              />

              <AttentionItem
                label="Товары без файлов"
                description="PDF и 3D-файлы не добавлены"
                count={
                  statistics
                    .productsWithoutFiles
                    .length
                }
                to="/admin/products"
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/[0.07] bg-white/[0.022] p-5">
            <p className="text-[0.65rem] uppercase tracking-[0.17em] text-white/25">
              Быстрый доступ
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
              Действия
            </h2>

            <div className="mt-5 grid gap-2">
              <Link
                to="/admin/products/new"
                className="group flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
              >
                Добавить товар

                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <Link
                to="/admin/categories"
                className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Управление категориями

                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <Link
                to="/products"
                target="_blank"
                className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Открыть каталог на сайте

                <span className="transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {categoriesWithCounts.length > 0 && (
        <section className="mt-6 rounded-[1.75rem] border border-white/[0.07] bg-white/[0.022] p-5 sm:p-6">
          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.17em] text-white/25">
                Структура каталога
              </p>

              <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                Товары по категориям
              </h2>
            </div>

            <Link
              to="/admin/categories"
              className="text-sm text-white/30 transition-colors hover:text-white"
            >
              Категории →
            </Link>
          </header>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categoriesWithCounts.map(
              ({
                category,
                productsCount,
              }) => {
                const maximumCount =
                  Math.max(
                    1,
                    ...categoriesWithCounts.map(
                      (item) =>
                        item.productsCount,
                    ),
                  );

                const width =
                  (productsCount /
                    maximumCount) *
                  100;

                return (
                  <Link
                    key={category.id}
                    to={`/admin/products?category=${category.id}`}
                    className="group rounded-2xl border border-white/[0.06] bg-black/15 p-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/65 transition-colors group-hover:text-white">
                          {category.nameRu}
                        </p>

                        <p className="mt-1 truncate text-xs text-white/25">
                          {category.nameEn}
                        </p>
                      </div>

                      <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 text-xs text-white/45">
                        {productsCount}
                      </span>
                    </div>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-white/35 transition-[width] duration-700"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        </section>
      )}
    </div>
  );
}