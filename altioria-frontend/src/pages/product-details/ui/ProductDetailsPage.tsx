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
} from '../../../entities/product';

import {
  useLocale,
} from '../../../shared/lib/i18n';


interface DisplayedProductData {
  name: string;
  description: string;
  materials: string | null;

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
  if (product.priceType === 'ON_REQUEST') {
    return locale === 'ru'
      ? 'По запросу'
      : 'On request';
  }

  if (
    !product.priceAmount ||
    !product.priceCurrency
  ) {
    return locale === 'ru'
      ? 'Не указана'
      : 'Not specified';
  }

  const amount = Number(
    product.priceAmount,
  );

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
      <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-white/20">
        <div className="text-center">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mx-auto h-10 w-10"
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

          <p className="mt-3 text-sm">
            {fallbackText}
          </p>
        </div>
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
      className="block h-full w-full object-cover"
    />
  );
}

function ResourceIcon({
  type,
}: {
  type: PublicProductFile['type'];
}) {
  if (type === 'PDF') {
    return (
      <svg
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="h-10 w-10"
      >
        <path
          d="M14 4.5h14.5L39.5 15v23a5.5 5.5 0 01-5.5 5.5H14A5.5 5.5 0 018.5 38V10A5.5 5.5 0 0114 4.5z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        <path
          d="M28.5 4.5V12a3 3 0 003 3h8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        <path
          d="M15.3 34.2c3.3-4.4 6.5-10.4 8.3-16.1.7-2.2.7-4.7-.5-4.7-1.5 0-1.3 3.6-.4 6.4 1.4 4.5 4.6 9.7 7.7 12.5 2.2 2 4.3 2.4 4.7 1.1.5-1.7-3.6-3.1-7.4-3-4.7.1-10.1 1.7-12.7 3.6-2.3 1.7-2.8 3.5-1.5 4.1 1.4.7 3.8-1.5 5.8-4.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-current text-sm font-medium">
      3D
    </span>
  );
}

function ProductResource({
  file,
}: {
  file: PublicProductFile;
}) {
  return (
    <a
      href={file.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="group/resource flex items-center gap-2.5 whitespace-nowrap text-white/65 transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="text-white">
        <ResourceIcon
          type={file.type}
        />
      </span>

      <span className="max-w-40 truncate text-sm text-[#a0a0a0] transition-colors group-hover/resource:text-white">
        {file.label ??
          file.originalName}
      </span>
    </a>
  );
}

function ProductDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] px-[30px] pb-[60px] pt-[100px] text-white min-[1201px]:px-[60px] min-[1201px]:pb-20">
      <div className="mx-auto grid w-full max-w-[1400px] animate-pulse gap-10 min-[1201px]:grid-cols-2 min-[1201px]:gap-0">
        <div className="aspect-[3/4] w-full rounded-3xl bg-white/[0.05] min-[1201px]:w-[90%]" />

        <div className="space-y-7">
          <div className="h-14 w-2/3 rounded-xl bg-white/[0.06]" />

          <div className="h-24 rounded-xl bg-white/[0.04]" />

          <div className="space-y-3">
            {[
              'one',
              'two',
              'three',
              'four',
            ].map((item) => (
              <div
                key={item}
                className="h-14 rounded-xl bg-white/[0.035]"
              />
            ))}
          </div>
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

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [errorStatus, setErrorStatus] =
    useState<number | null>(null);

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();
  
  const variantFromSearch =
    searchParams.get('variant');

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

  const inquiryUrl =
    `/products/${categorySlug}/${productSlug}/inquiry${
      activeVariant
        ? `?variant=${encodeURIComponent(
            activeVariant.slug,
          )}`
        : ''
    }`;

  const displayedProduct:
    | DisplayedProductData
    | null = activeVariant
    ? {
        name: activeVariant.name,
        description:
          activeVariant.description,
        materials:
          activeVariant.materials,

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

        images: activeVariant.images,
        files: activeVariant.files,
      }
    : product
      ? {
          name: product.name,
          description:
            product.description,
          materials:
            product.materials,

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

  const currentImage =
    displayedProduct?.images[
      currentImageIndex
    ] ??
    displayedProduct?.images[0] ??
    null;

  useEffect(() => {
    if (!displayedProduct) {
      return;
    }

    document.title =
      `${displayedProduct.name} — Altioria`;

    return () => {
      document.title = 'Altioria';
    };
  }, [displayedProduct]);

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
      <main className="flex min-h-screen items-center justify-center bg-[#0c0c0c] px-5 pt-24 text-white">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-xl text-white/35">
            !
          </span>

          <h1 className="mt-6 text-3xl font-normal tracking-[-0.04em]">
            {errorStatus === 404
              ? locale === 'ru'
                ? 'Товар не найден'
                : 'Product not found'
              : locale === 'ru'
                ? 'Не удалось загрузить товар'
                : 'Failed to load product'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/35">
            {error}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to={`/products/${categorySlug}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {locale === 'ru'
                ? 'Вернуться в категорию'
                : 'Back to category'}
            </Link>

            <button
              type="button"
              onClick={() =>
                void loadProduct()
              }
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
            >
              {locale === 'ru'
                ? 'Попробовать снова'
                : 'Try again'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const imagesCount =
    displayedProduct.images.length;

  const showImageNavigation =
    imagesCount > 1;

  const selectMainProduct = () => {
    setActiveVariantSlug(null);
    setCurrentImageIndex(0);
  
    const nextSearchParams =
      new URLSearchParams(searchParams);
  
    nextSearchParams.delete('variant');
  
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
      new URLSearchParams(searchParams);
  
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

  const showPreviousImage = () => {
    if (!showImageNavigation) {
      return;
    }

    setCurrentImageIndex(
      (current) =>
        (current - 1 + imagesCount) %
        imagesCount,
    );
  };

  const showNextImage = () => {
    if (!showImageNavigation) {
      return;
    }

    setCurrentImageIndex(
      (current) =>
        (current + 1) %
        imagesCount,
    );
  };

  const dimensionRows: Array<{
    label: string;
    value: string;
  }> = [];
  
  if (
    displayedProduct.heightMm !== null
  ) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'Высота'
          : 'Height',
  
      value:
        `${displayedProduct.heightMm} mm`,
    });
  }
  
  if (
    displayedProduct.widthMm !== null
  ) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'Ширина'
          : 'Width',
  
      value:
        `${displayedProduct.widthMm} mm`,
    });
  }
  
  if (
    displayedProduct.depthMm !== null
  ) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'Глубина'
          : 'Depth',
  
      value:
        `${displayedProduct.depthMm} mm`,
    });
  }
  
  const normalizedMaterials =
    displayedProduct.materials?.trim();
  
  if (normalizedMaterials) {
    dimensionRows.push({
      label:
        locale === 'ru'
          ? 'Материалы'
          : 'Materials',
  
      value: normalizedMaterials,
    });
  }

  return (
    <main
      key={`product-${locale}`}
      className="language-content-in min-h-screen bg-[#0c0c0c] px-[30px] pb-[60px] pt-[100px] text-white min-[1201px]:px-[60px] min-[1201px]:pb-20"
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-10 min-[1201px]:grid-cols-2 min-[1201px]:gap-0">
        <section
          aria-label={
            locale === 'ru'
              ? 'Галерея товара'
              : 'Product gallery'
          }
          className="relative flex w-full min-[1201px]:w-[90%]"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-[#1a1a1a] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
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

            {showImageNavigation && (
              <>
                <button
                  type="button"
                  onClick={
                    showPreviousImage
                  }
                  aria-label={
                    locale === 'ru'
                      ? 'Предыдущее изображение'
                      : 'Previous image'
                  }
                  className="absolute bottom-5 left-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-0 bg-[#555]/20 text-white backdrop-blur-[10px] transition-[background-color,transform] duration-300 hover:scale-110 hover:bg-white/30 active:scale-95"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M15 5l-7 7 7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label={
                    locale === 'ru'
                      ? 'Следующее изображение'
                      : 'Next image'
                  }
                  className="absolute bottom-5 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-0 bg-[#555]/20 text-white backdrop-blur-[10px] transition-[background-color,transform] duration-300 hover:scale-110 hover:bg-white/30 active:scale-95"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </section>

        <section className="flex flex-col justify-start gap-[30px]">
          <h1 className="text-[36px] font-normal uppercase leading-[1.2] tracking-[-2px] text-white min-[1201px]:text-[48px]">
            {displayedProduct.name}
          </h1>

          {product.variants.length > 0 && (
            <section>
              <h2 className="text-base font-light leading-[1.8] text-[#e0e0e0]">
                {locale === 'ru'
                  ? 'Выберите исполнение:'
                  : 'Choose option:'}
              </h2>

              <div className="mt-5 flex flex-wrap gap-5">
                <button
                  type="button"
                  onClick={
                    selectMainProduct
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-1 ${
                    activeVariantSlug ===
                    null
                      ? 'border-white bg-white text-black'
                      : 'border-white/70 text-white hover:bg-white/10'
                  }`}
                >
                  {product.name}
                </button>

                {product.variants.map(
                  (variant) => {
                    const isActive =
                      activeVariantSlug ===
                      variant.slug;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() =>
                          selectVariant(
                            variant.slug,
                          )
                        }
                        className={`rounded-lg border px-3 py-1.5 text-sm uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-1 ${
                          isActive
                            ? 'border-white bg-white text-black'
                            : 'border-white/70 text-white hover:bg-white/10'
                        }`}
                      >
                        {variant.name}
                      </button>
                    );
                  },
                )}
              </div>
            </section>
          )}

          <p className="text-base font-light leading-[1.8] text-[#e0e0e0]">
            {displayedProduct.description}
          </p>

          {dimensionRows.length > 0 && (
            <div className="flex flex-col border-t border-white/10">
              {dimensionRows.map(
                (row) => (
                  <div
                    key={row.label}
                    className="flex flex-col items-start gap-2 border-b border-white/10 py-5 text-base min-[1201px]:flex-row min-[1201px]:items-center min-[1201px]:justify-between min-[1201px]:gap-8"
                  >
                    <span className="font-light text-[#a0a0a0]">
                      {row.label}
                    </span>
              
                    <span className="w-full break-words text-left font-normal text-white min-[1201px]:max-w-[70%] min-[1201px]:text-right">
                      {row.value}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}

          {displayedProduct.files.length >
            0 && (
            <div className="flex flex-wrap gap-5 min-[1201px]:gap-[50px]">
              {displayedProduct.files.map(
                (file) => (
                  <ProductResource
                    key={file.id}
                    file={file}
                  />
                ),
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-5 border-t border-white/10 pt-10 text-2xl font-normal">
            <span className="mr-2 text-lg text-[#a0a0a0]">
              {locale === 'ru'
                ? 'Цена:'
                : 'Price:'}
            </span>

            <span>
              {formatPrice(
                displayedProduct,
                locale,
              )}
            </span>

            <Link
              to={inquiryUrl}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-black transition-[background-color,transform] duration-300 hover:bg-[#d8d8d8] active:scale-[0.99]"
            >
              {locale === 'ru'
                ? 'Оставить заявку'
                : 'Submit application'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}