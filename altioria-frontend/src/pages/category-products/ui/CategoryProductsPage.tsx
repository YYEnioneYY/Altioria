import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  Navigate,
  useLocation,
  useParams,
} from 'react-router';

import { Seo } from '../../../shared/ui/seo';

import {
  getCategories,
} from '../../../entities/category';

import {
  getPublicProducts,
  type PublicProduct,
} from '../../../entities/product';

import {
  useLocale,
} from '../../../shared/lib/i18n';

interface CategoryLocationState {
  categoryName?: string;
}

function formatSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(' ');
}

function ProductImage({
  src,
  alt,
  fallbackText,
}: {
  src: string | null;
  alt: string;
  fallbackText: string;
}) {
  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-white/20">
        <div className="text-center">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mx-auto h-8 w-8"
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
            {fallbackText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading="lazy"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover"
    />
  );
}

function ProductCard({
  product,
  fallbackText,
}: {
  product: PublicProduct;
  fallbackText: string;
}) {
  return (
    <Link
      to={`/products/${product.category.slug}/${product.slug}`}
      aria-label={product.name}
      draggable={false}
      className="group block min-w-0 text-white no-underline"
    >
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-[transform,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <ProductImage
          src={product.coverImageUrl}
          alt={product.name}
          fallbackText={fallbackText}
        />
      </div>

      <h2 className="mt-[14px] truncate text-center text-[15px] font-normal text-white transition-colors duration-300 group-hover:text-white/65 min-[1201px]:text-[18px]">
        {product.name}
      </h2>
    </Link>
  );
}

function ProductsSkeleton() {
  return (
    <div className="relative z-[2] grid w-full max-w-[1200px] grid-cols-2 gap-[15px] min-[1201px]:grid-cols-4 min-[1201px]:gap-[30px]">
      {Array.from(
        {
          length: 8,
        },
        (_, index) => (
          <div
            key={index}
            className="animate-pulse"
          >
            <div className="aspect-[3/4] rounded-2xl bg-white/[0.05]" />

            <div className="mx-auto mt-[14px] h-4 w-2/3 rounded-full bg-white/[0.04]" />
          </div>
        ),
      )}
    </div>
  );
}

export function CategoryProductsPage() {
  const {
    categorySlug,
  } = useParams<{
    categorySlug: string;
  }>();

  const location = useLocation();

  const {
    locale,
  } = useLocale();

  const locationState =
    location.state as
      | CategoryLocationState
      | null;

  const [categoryTitle, setCategoryTitle] =
    useState(
      locationState?.categoryName ??
        (categorySlug
          ? formatSlug(categorySlug)
          : ''),
    );

  const [products, setProducts] =
    useState<PublicProduct[] | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadProducts = useCallback(
    async (
      signal?: AbortSignal,
    ): Promise<void> => {
      if (!categorySlug) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [
          loadedProducts,
          loadedCategories,
        ] = await Promise.all([
          getPublicProducts(
            locale,
            categorySlug,
            signal,
          ),

          getCategories(
            locale,
            signal,
          ),
        ]);

        if (signal?.aborted) {
          return;
        }

        const currentCategory =
          loadedCategories.find(
            (category) =>
              category.slug ===
              categorySlug,
          );

        setProducts(loadedProducts);

        setCategoryTitle(
          currentCategory?.name ??
            loadedProducts[0]?.category.name ??
            formatSlug(categorySlug),
        );
      } catch (requestError: unknown) {
        if (signal?.aborted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : locale === 'ru'
              ? 'Не удалось загрузить товары'
              : 'Failed to load products',
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [
      categorySlug,
      locale,
    ],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    setProducts(null);

    void loadProducts(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadProducts]);

  const categoryDescription =
    locale === 'ru'
      ? `${categoryTitle} — авторские предметы коллекции Altioria. Мебель и предметный дизайн Олега Клодта.`
      : `${categoryTitle} from the Altioria collection — designer furniture and objects by Oleg Klodt.`;

  if (!categorySlug) {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }

  const fallbackImageText =
    locale === 'ru'
      ? 'Нет изображения'
      : 'No image';

  return (
    <>
      <Seo
        locale={locale}
        title={categoryTitle}
        description={categoryDescription}
        path={`/products/${categorySlug}`}
      />
      <main className="min-h-screen overflow-hidden bg-[#0c0c0c] text-white">
        <section className="relative mt-[10%] flex min-h-screen flex-col items-center bg-[#0c0c0c] px-5 pb-20 pt-5 max-[1200px]:py-[50px]">
          <h1
            key={`category-title-${locale}-${categoryTitle}`}
            className="language-content-in pointer-events-none relative z-[2] select-none whitespace-nowrap text-[15vw] font-normal leading-[0.5] text-[#a0a0a0] min-[1201px]:text-[11vw]"
          >
            {categoryTitle}
          </h1>
  
          {isLoading &&
            products === null && (
              <ProductsSkeleton />
            )}
  
          {!isLoading && error && (
            <div className="relative z-[2] flex min-h-[28rem] w-full max-w-[1200px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-lg text-white/35">
                !
              </span>
          
              <h2 className="mt-5 text-xl font-normal">
                {locale === 'ru'
                  ? 'Не удалось загрузить товары'
                  : 'Failed to load products'}
              </h2>
              
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/35">
                {error}
              </p>
              
              <button
                type="button"
                onClick={() =>
                  void loadProducts()
                }
                className="mt-6 h-11 rounded-xl border border-white/10 bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
              >
                {locale === 'ru'
                  ? 'Попробовать снова'
                  : 'Try again'}
              </button>
            </div>
          )}
  
          {!isLoading &&
            !error &&
            products?.length === 0 && (
              <div className="relative z-[2] flex min-h-[28rem] w-full max-w-[1200px] flex-col items-center justify-center px-5 text-center">
                <p className="text-lg text-white/55">
                  {locale === 'ru'
                    ? 'В этой категории пока нет товаров'
                    : 'There are no products in this category yet'}
                </p>
                  
                <p className="mt-2 text-sm text-white/25">
                  {locale === 'ru'
                    ? 'Загляните сюда немного позже'
                    : 'Please check again later'}
                </p>
              </div>
            )}
  
          {!error &&
            products &&
            products.length > 0 && (
              <div
                key={`products-${locale}`}
                className="language-content-in relative z-[2] grid w-full max-w-[1200px] grid-cols-2 gap-[15px] min-[1201px]:grid-cols-4 min-[1201px]:gap-[30px]"
              >
                {products.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      fallbackText={
                        fallbackImageText
                      }
                    />
                  ),
                )}
              </div>
            )}
        </section>
      </main>
    </>
  );
}