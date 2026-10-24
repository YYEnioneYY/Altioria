import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  Navigate,
  useParams,
  useSearchParams,
} from 'react-router';

import {
  getPublicProduct,
  PublicProductsApiError,
  type PublicProductDetails,
  type PublicProductFile,
  type PublicProductImage,
  type PublicProductSpecification,
} from '../../../entities/product';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  Seo,
} from '../../../shared/ui/seo';

import {
  ProductInquiryPanel,
} from './ProductInquiryPanel';

interface DisplayedProductData {
  name: string;
  description: string;
  materials: string | null;

  specifications:
    PublicProductSpecification[];

  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;

  priceType: 'FIXED' | 'ON_REQUEST';
  priceAmount: string | null;
  priceCurrency: string | null;

  images: PublicProductImage[];
  files: PublicProductFile[];
}

function formatPrice(
  product: DisplayedProductData,
  locale: 'ru' | 'en',
): string {
  if (
    product.priceType ===
    'ON_REQUEST'
  ) {
    return locale === 'ru'
      ? 'По запросу'
      : 'On request';
  }

  if (
    !product.priceAmount ||
    !product.priceCurrency
  ) {
    return '';
  }

  const amount =
    Number(product.priceAmount);

  if (!Number.isFinite(amount)) {
    return `${product.priceAmount} ${product.priceCurrency}`;
  }

  try {
    return new Intl.NumberFormat(
      locale === 'ru'
        ? 'ru-RU'
        : 'en-US',
      {
        style: 'currency',

        currency:
          product.priceCurrency,

        maximumFractionDigits: 2,
      },
    ).format(amount);
  } catch {
    return `${product.priceAmount} ${product.priceCurrency}`;
  }
}

function ProductGalleryImage({
  image,
  productName,
  fallbackText,
}: {
  image: PublicProductImage | null;
  productName: string;
  fallbackText: string;
}) {
  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image?.imageUrl]);

  if (!image || hasError) {
    return (
      <div className="product-image-fallback">
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

        <span>
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <img
      key={image.id}
      src={image.imageUrl}
      alt={
        image.alt ??
        productName
      }
      draggable={false}
      fetchPriority="high"
      onError={() =>
        setHasError(true)
      }
      className="product-main-image"
    />
  );
}

function ProductDetailsSkeleton() {
  return (
    <main className="product-details-page">
      <div className="product-details-layout animate-pulse">
        <div className="product-gallery-shell bg-white/[0.04]" />

        <div>
          <div className="h-14 w-2/3 bg-white/[0.06]" />

          <div className="mt-4 h-[34rem] border border-white/15 bg-white/[0.025]" />
        </div>
      </div>
    </main>
  );
}

export function ProductDetailsPage() {
  const {
    categorySlug,
    productSlug,
  } = useParams<{
    categorySlug: string;
    productSlug: string;
  }>();

  const {
    locale,
  } = useLocale();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const variantFromSearch =
    searchParams.get('variant');

  const [product, setProduct] =
    useState<PublicProductDetails | null>(
      null,
    );

  const [
    activeVariantSlug,
    setActiveVariantSlug,
  ] = useState<string | null>(null);

  const [
    currentImageIndex,
    setCurrentImageIndex,
  ] = useState(0);

  const [
    isInquiryOpen,
    setIsInquiryOpen,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [errorStatus, setErrorStatus] =
    useState<number | null>(null);

  const loadProduct = useCallback(
    async (
      signal?: AbortSignal,
    ): Promise<void> => {
      if (
        !productSlug ||
        !categorySlug
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);
      setErrorStatus(null);

      try {
        const loadedProduct =
          await getPublicProduct(
            productSlug,
            locale,
            categorySlug,
            signal,
          );

        if (signal?.aborted) {
          return;
        }

        setProduct(loadedProduct);

        setActiveVariantSlug(
          (currentSlug) => {
            if (!currentSlug) {
              return null;
            }

            const variantStillExists =
              loadedProduct.variants.some(
                (variant) =>
                  variant.slug ===
                  currentSlug,
              );

            return variantStillExists
              ? currentSlug
              : null;
          },
        );

        setCurrentImageIndex(0);
      } catch (requestError: unknown) {
        if (signal?.aborted) {
          return;
        }

        if (
          requestError instanceof
          PublicProductsApiError
        ) {
          setErrorStatus(
            requestError.status,
          );
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : locale === 'ru'
              ? 'Не удалось загрузить товар'
              : 'Failed to load product',
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
      productSlug,
    ],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    void loadProduct(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadProduct]);

  const activeVariant = useMemo(
    () =>
      product?.variants.find(
        (variant) =>
          variant.slug ===
          activeVariantSlug,
      ) ?? null,
    [
      activeVariantSlug,
      product,
    ],
  );

  useEffect(() => {
    if (!product) {
      return;
    }

    if (!variantFromSearch) {
      setActiveVariantSlug(null);
      setCurrentImageIndex(0);

      return;
    }

    const requestedVariant =
      product.variants.find(
        (variant) =>
          variant.slug ===
          variantFromSearch,
      );

    setActiveVariantSlug(
      requestedVariant?.slug ?? null,
    );

    setCurrentImageIndex(0);
  }, [
    product,
    variantFromSearch,
  ]);

  const displayedProduct:
    | DisplayedProductData
    | null = activeVariant
    ? {
        name: activeVariant.name,
        description:
          activeVariant.description,
        materials:
          activeVariant.materials,
        specifications:
          activeVariant.specifications,
        heightMm:
          activeVariant.heightMm,
        widthMm:
          activeVariant.widthMm,
        depthMm:
          activeVariant.depthMm,
        priceType:
          activeVariant.priceType,
        priceAmount:
          activeVariant.priceAmount,
        priceCurrency:
          activeVariant.priceCurrency,
        images:
          activeVariant.images,
        files:
          activeVariant.files,
      }
    : product
      ? {
          name: product.name,
          description:
            product.description,
          materials:
            product.materials,
          specifications:
            product.specifications,
          heightMm:
            product.heightMm,
          widthMm:
            product.widthMm,
          depthMm:
            product.depthMm,
          priceType:
            product.priceType,
          priceAmount:
            product.priceAmount,
          priceCurrency:
            product.priceCurrency,
          images: product.images,
          files: product.files,
        }
      : null;

  if (
    !categorySlug ||
    !productSlug
  ) {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }

  if (
    isLoading &&
    product === null
  ) {
    return <ProductDetailsSkeleton />;
  }

  if (
    error ||
    !product ||
    !displayedProduct
  ) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black px-5 pt-24 text-white">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-white/30 text-xl">
            !
          </span>

          <h1 className="site-display mt-6 text-4xl font-normal uppercase">
            {errorStatus === 404
              ? locale === 'ru'
                ? 'Товар не найден'
                : 'Product not found'
              : locale === 'ru'
                ? 'Ошибка загрузки'
                : 'Loading error'}
          </h1>

          <p className="site-mono mt-4 text-sm text-white/50">
            {error}
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <Link
              to={`/products/${categorySlug}`}
              className="site-mono border border-white/50 px-5 py-3 text-sm"
            >
              {locale === 'ru'
                ? 'Вернуться'
                : 'Go back'}
            </Link>

            <button
              type="button"
              onClick={() =>
                void loadProduct()
              }
              className="site-mono bg-white px-5 py-3 text-sm text-black"
            >
              {locale === 'ru'
                ? 'Повторить'
                : 'Retry'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const currentImage =
    displayedProduct.images[
      currentImageIndex
    ] ??
    displayedProduct.images[0] ??
    null;

  const productPath =
    `/products/${categorySlug}/${productSlug}`;

  const seoDescription =
    product.description.trim().length >
    160
      ? `${product.description
          .trim()
          .slice(0, 157)
          .trimEnd()}...`
      : product.description.trim();

  const seoImage =
    product.images[0]?.imageUrl;

  const productJsonLd = {
    '@context':
      'https://schema.org',

    '@type': 'Product',

    name: product.name,

    description:
      product.description,

    ...(product.images.length > 0
      ? {
          image:
            product.images.map(
              (image) =>
                image.imageUrl,
            ),
        }
      : {}),

    category:
      product.category.name,

    brand: {
      '@type': 'Brand',
      name: 'Altioria',
    },

    ...(product.priceType ===
      'FIXED' &&
    product.priceAmount &&
    product.priceCurrency
      ? {
          offers: {
            '@type': 'Offer',

            url:
              `https://altioria.ru${productPath}`,

            price:
              product.priceAmount,

            priceCurrency:
              product.priceCurrency,
          },
        }
      : {}),
  };

  const selectMainProduct = () => {
    setActiveVariantSlug(null);
    setCurrentImageIndex(0);

    const nextSearchParams =
      new URLSearchParams(
        searchParams,
      );

    nextSearchParams.delete(
      'variant',
    );

    setSearchParams(
      nextSearchParams,
      {
        replace: true,
      },
    );
  };

  const selectVariant = (
    variantSlug: string,
  ) => {
    setActiveVariantSlug(
      variantSlug,
    );

    setCurrentImageIndex(0);

    const nextSearchParams =
      new URLSearchParams(
        searchParams,
      );

    nextSearchParams.set(
      'variant',
      variantSlug,
    );

    setSearchParams(
      nextSearchParams,
      {
        replace: true,
      },
    );
  };

  const dimensionRows: {
    label: string;
    value: string;
  }[] = [];

  if (
    displayedProduct.heightMm !== null
  ) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'высота'
          : 'height',

      value:
        `${displayedProduct.heightMm} мм`,
    });
  }

  if (
    displayedProduct.widthMm !== null
  ) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'ширина'
          : 'width',

      value:
        `${displayedProduct.widthMm} мм`,
    });
  }

  if (
    displayedProduct.depthMm !== null
  ) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'глубина'
          : 'depth',

      value:
        `${displayedProduct.depthMm} мм`,
    });
  }

  for (
    const specification of
    displayedProduct.specifications
  ) {
    const label =
      specification.label.trim();

    const value =
      specification.value.trim();

    const unit =
      specification.unit.trim();

    if (!label || !value) {
      continue;
    }

    dimensionRows.push({
      label,

      value: unit
        ? `${value} ${unit}`
        : value,
    });
  }

  const materials =
    displayedProduct.materials
      ?.split(/\r?\n|,/)
      .map((material) =>
        material.trim(),
      )
      .filter(Boolean) ?? [];

  const formattedPrice =
    formatPrice(
      displayedProduct,
      locale,
    );

  return (
    <>
      <Seo
        locale={locale}
        title={product.name}
        description={seoDescription}
        path={productPath}
        image={seoImage}
        imageAlt={product.name}
        type="product"
        jsonLd={productJsonLd}
      />

      <main
        key={`product-${locale}`}
        className="product-details-page language-content-in site-mono"
      >
        <div className="product-details-layout">
          <section
            aria-label={
              locale === 'ru'
                ? 'Галерея товара'
                : 'Product gallery'
            }
            className="product-gallery-shell"
          >
            <div className="product-thumbnails">
              {displayedProduct.images.map(
                (image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex(
                        index,
                      )
                    }
                    aria-label={
                      locale === 'ru'
                        ? `Открыть изображение ${index + 1}`
                        : `Open image ${index + 1}`
                    }
                    aria-current={
                      currentImageIndex ===
                      index
                        ? 'true'
                        : undefined
                    }
                    className="product-thumbnail"
                  >
                    <img
                      src={image.imageUrl}
                      alt={
                        image.alt ??
                        displayedProduct.name
                      }
                      draggable={false}
                      loading={
                        index < 4
                          ? 'eager'
                          : 'lazy'
                      }
                    />
                  </button>
                ),
              )}
            </div>

            <div className="product-main-image-wrapper">
              <ProductGalleryImage
                image={currentImage}
                productName={
                  displayedProduct.name
                }
                fallbackText={
                  locale === 'ru'
                    ? 'Нет изображения'
                    : 'No image'
                }
              />
            </div>
          </section>

          <section className="product-details-side">
            <h1 className="site-display product-details-title">
              {displayedProduct.name}
            </h1>

            {product.variants.length > 0 && (
              <div className="product-variants">
                <button
                  type="button"
                  onClick={
                    selectMainProduct
                  }
                  className={
                    activeVariantSlug ===
                    null
                      ? 'product-variant-active'
                      : ''
                  }
                >
                  {product.name}
                </button>

                {product.variants.map(
                  (variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() =>
                        selectVariant(
                          variant.slug,
                        )
                      }
                      className={
                        activeVariantSlug ===
                        variant.slug
                          ? 'product-variant-active'
                          : ''
                      }
                    >
                      {variant.name}
                    </button>
                  ),
                )}
              </div>
            )}

            {isInquiryOpen ? (
              <ProductInquiryPanel
                key={
                  activeVariant?.id ??
                  product.id
                }
                locale={locale}
                productId={product.id}
                variantId={
                  activeVariant?.id
                }
                productName={
                  displayedProduct.name
                }
                onBack={() =>
                  setIsInquiryOpen(false)
                }
              />
            ) : (
              <section className="product-information-panel">
                <div className="product-description">
                  <span className="product-panel-label">
                    {locale === 'ru'
                      ? 'описание'
                      : 'description'}
                  </span>

                  <p>
                    {
                      displayedProduct.description
                    }
                  </p>
                </div>

                {(materials.length > 0 ||
                  dimensionRows.length >
                    0) && (
                  <div className="product-specification-grid">
                    {materials.length >
                      0 && (
                      <div className="product-materials">
                        <span className="product-panel-label">
                          {locale === 'ru'
                            ? 'материалы'
                            : 'materials'}
                        </span>

                        <div>
                          {materials.map(
                            (
                              material,
                              index,
                            ) => (
                              <p
                                key={`${material}-${index}`}
                              >
                                {material}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {dimensionRows.length >
                      0 && (
                      <div className="product-dimensions">
                        <span className="product-panel-label">
                          {locale === 'ru'
                            ? 'размеры'
                            : 'dimensions'}
                        </span>

                        <div>
                          {dimensionRows.map(
                            (
                              row,
                              index,
                            ) => (
                              <p
                                key={`${row.label}-${index}`}
                              >
                                <span>
                                  {row.label}
                                </span>

                                <strong>
                                  {row.value}
                                </strong>
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {displayedProduct.files.length >
                  0 && (
                  <div className="product-files">
                    {displayedProduct.files.map(
                      (file) => (
                        <a
                          key={file.id}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>
                            {file.type}
                          </span>

                          {file.label ??
                            file.originalName}
                        </a>
                      ),
                    )}
                  </div>
                )}

                <div className="product-application">
                  {formattedPrice && (
                    <span className="product-price">
                      {formattedPrice}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setIsInquiryOpen(
                        true,
                      )
                    }
                  >
                    {locale === 'ru'
                      ? 'Оформить заявку'
                      : 'Submit application'}
                  </button>
                </div>
              </section>
            )}
          </section>
        </div>
      </main>
    </>
  );
}