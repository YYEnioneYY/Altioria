import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  getCategories,
  type PublicCategory,
} from '../../../entities/category';

import {
  getPublicProducts,
  type PublicProduct,
} from '../../../entities/product';

import {
  useLocale,
} from '../../../shared/lib/i18n';

function ProductImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="catalog-product-placeholder">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
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
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading="lazy"
      onError={() =>
        setHasError(true)
      }
      className="catalog-product-image"
    />
  );
}

function ProductCard({
  product,
}: {
  product: PublicProduct;
}) {
  return (
    <Link
      to={`/products/${product.category.slug}/${product.slug}`}
      draggable={false}
      className="catalog-product-card"
    >
      <div className="catalog-product-media">
        <ProductImage
          src={product.coverImageUrl}
          alt={product.name}
        />
      </div>

      <h2 className="catalog-product-name">
        {product.name}
      </h2>
    </Link>
  );
}

function CatalogSkeleton() {
  return (
    <div
      className="catalog-products-grid"
      aria-label="Загрузка товаров"
    >
      {[
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
      ].map(
        (item) => (
          <div
            key={item}
            className="catalog-product-skeleton"
          >
            <div className="catalog-product-skeleton-image" />

            <div className="catalog-product-skeleton-name" />
          </div>
        ),
      )}
    </div>
  );
}

export function PublicCatalog() {
  const {
    categorySlug,
  } = useParams<{
    categorySlug?: string;
  }>();

  const {
    locale,
  } = useLocale();

  const [categories, setCategories] =
    useState<PublicCategory[]>([]);

  const [products, setProducts] =
    useState<PublicProduct[] | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  const loadCatalog = useCallback(
    async (
      signal?: AbortSignal,
    ): Promise<void> => {
      setProducts(null);
      setError(null);

      try {
        const [
          loadedCategories,
          loadedProducts,
        ] = await Promise.all([
          getCategories(
            locale,
            signal,
          ),

          getPublicProducts(
            locale,
            categorySlug,
            signal,
          ),
        ]);

        setCategories(
          loadedCategories,
        );

        setProducts(
          loadedProducts,
        );
      } catch (requestError: unknown) {
        if (
          requestError instanceof
            DOMException &&
          requestError.name ===
            'AbortError'
        ) {
          return;
        }

        setError(
          locale === 'ru'
            ? 'Не удалось загрузить каталог'
            : 'Failed to load catalogue',
        );

        setProducts([]);
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

    void loadCatalog(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadCatalog]);

  const allProductsSelected =
    !categorySlug;

  const allProductsName =
    locale === 'ru'
      ? 'Вся мебель'
      : 'All furniture';

  const activeCategory =
    categories.find(
      (category) =>
        category.slug ===
        categorySlug,
    );

  const mobileNavigationItems = [
    ...(
      allProductsSelected
        ? []
        : [
            {
              id: 'all-products',
              name: allProductsName,
              path: '/products',
            },
          ]
    ),

    ...categories
      .filter(
        (category) =>
          category.slug !==
          categorySlug,
      )
      .map(
        (category) => ({
          id: category.id,
          name: category.name,
          path:
            `/products/${category.slug}`,
        }),
      ),
  ];

  return (
    <main className="public-catalog">
      <div
        key={`tabs-${locale}-${categorySlug ?? 'all'}`}
        className="catalog-tabs-scroll language-content-in"
      >
        {/* Десктопная навигация */}
        <div className="catalog-tabs-desktop">
          <nav
            className="catalog-tabs"
            aria-label={
              locale === 'ru'
                ? 'Категории каталога'
                : 'Catalogue categories'
            }
          >
            <Link
              to="/products"
              aria-current={
                allProductsSelected
                  ? 'page'
                  : undefined
              }
              className={`catalog-tab catalog-tab-all ${
                allProductsSelected
                  ? 'catalog-tab-active'
                  : ''
              }`}
            >
              {allProductsName}
            </Link>
            
            {categories.map(
              (category) => {
                const isActive =
                  category.slug ===
                  categorySlug;
              
                return (
                  <div
                    key={category.id}
                    className={`catalog-tab-group ${
                      isActive
                        ? 'catalog-tab-group-active'
                        : ''
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="catalog-tab-divider"
                    />
      
                    <Link
                      to={`/products/${category.slug}`}
                      aria-current={
                        isActive
                          ? 'page'
                          : undefined
                      }
                      className={`catalog-tab ${
                        isActive
                          ? 'catalog-tab-active'
                          : ''
                      }`}
                    >
                      {category.name}
                    </Link>
                  </div>
                );
              },
            )}
          </nav>
        </div>
          
        {/* Мобильная навигация */}
        <div className="catalog-tabs-mobile">
          {allProductsSelected && (
            <Link
              to="/products"
              aria-current="page"
              className="catalog-mobile-selected catalog-mobile-selected-top"
            >
              {allProductsName}
            </Link>
          )}
      
          <nav
            className="catalog-mobile-grid"
            aria-label={
              locale === 'ru'
                ? 'Категории каталога'
                : 'Catalogue categories'
            }
          >
            {mobileNavigationItems.map(
              (item) => (
                <div
                  key={item.id}
                  className="catalog-mobile-cell"
                >
                  <Link
                    to={item.path}
                    className="catalog-mobile-link"
                  >
                    {item.name}
                  </Link>
                </div>
              ),
            )}
          </nav>
          
          {!allProductsSelected &&
            activeCategory && (
              <Link
                to={`/products/${activeCategory.slug}`}
                aria-current="page"
                className="catalog-mobile-selected catalog-mobile-selected-bottom"
              >
                {activeCategory.name}
              </Link>
            )}
        </div>
      </div>

      {products === null &&
        !error && (
          <CatalogSkeleton />
        )}

      {error && (
        <div
          role="alert"
          className="catalog-state"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              void loadCatalog()
            }
          >
            {locale === 'ru'
              ? 'Попробовать снова'
              : 'Try again'}
          </button>
        </div>
      )}

      {!error &&
        products?.length === 0 && (
          <div className="catalog-state">
            <p>
              {locale === 'ru'
                ? 'В этой категории пока нет товаров'
                : 'There are no products in this category yet'}
            </p>
          </div>
        )}

      {!error &&
        products &&
        products.length > 0 && (
          <div
            key={`products-${locale}-${categorySlug ?? 'all'}`}
            className="catalog-products-grid language-content-in"
          >
            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>
        )}
    </main>
  );
}