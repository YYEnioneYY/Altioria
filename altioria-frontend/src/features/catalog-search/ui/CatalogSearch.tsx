import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
} from 'react-router';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  searchCatalog,
  type SearchResult,
} from '../api/search-catalog';

interface CatalogSearchProps {
  mode?: 'desktop' | 'mobile';
  tabIndex?: number;
  onNavigate?: () => void;
}

const contentByLocale = {
  ru: {
    placeholder: 'Поиск...',
    title: 'Каталог',
    loading: 'Поиск...',
    empty: 'Ничего не найдено',
    error: 'Не удалось выполнить поиск',
    product: 'Товар',
    category: 'Категория',
    variant: 'Исполнение',
    catalog: 'Каталог',
    products: 'Товары',
    viewAll: 'Посмотреть все',
    close: 'Закрыть поиск',
    noImage: 'Нет фото',
  },

  en: {
    placeholder: 'Search...',
    title: 'Catalog',
    loading: 'Searching...',
    empty: 'Nothing found',
    error: 'Search failed',
    product: 'Product',
    category: 'Category',
    variant: 'Variant',
    catalog: 'Catalog',
    products: 'Products',
    viewAll: 'View all results',
    close: 'Close search',
    noImage: 'No image',
  },
} as const;

function getResultPath(
  result: SearchResult,
): string {
  if (result.type === 'CATEGORY') {
    return `/products/${result.slug}`;
  }

  if (!result.categorySlug) {
    return '/products';
  }

  const productPath =
    `/products/${result.categorySlug}/${result.slug}`;

  if (
    result.type === 'PRODUCT_VARIANT' &&
    result.variantSlug
  ) {
    return `${productPath}?variant=${encodeURIComponent(
      result.variantSlug,
    )}`;
  }

  return productPath;
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

function ResultImage({
  src,
  alt,
  fallback,
}: {
  src: string | null;
  alt: string;
  fallback: string;
}) {
  const [hasError, setHasError] =
    useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-[10px] bg-[#222] text-center text-[10px] text-white/20">
        {fallback}
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
      className="h-[82px] w-[82px] shrink-0 rounded-[10px] bg-[#222] object-cover"
    />
  );
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-[10px]">
      {Array.from(
        {
          length: 3,
        },
        (_, index) => (
          <div
            key={index}
            className="grid h-[104px] animate-pulse grid-cols-[82px_minmax(0,1fr)] gap-[10px] rounded-xl border border-white/[0.06] bg-white/[0.04] p-[10px]"
          >
            <div className="rounded-[10px] bg-white/[0.06]" />

            <div className="pt-2">
              <div className="h-3.5 w-2/3 rounded-full bg-white/[0.07]" />

              <div className="mt-3 h-2.5 w-1/3 rounded-full bg-white/[0.04]" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export function CatalogSearch({
  mode = 'desktop',
  tabIndex = 0,
  onNavigate,
}: CatalogSearchProps) {
  const {
    locale,
  } = useLocale();

  const content =
    contentByLocale[locale];

  const rootRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [query, setQuery] =
    useState('');

  const [isOpen, setIsOpen] =
    useState(false);

  const [results, setResults] =
    useState<SearchResult[] | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [reloadVersion, setReloadVersion] =
    useState(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    );

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller =
      new AbortController();

    const debounceDelay =
      query.trim() ? 300 : 0;

    const timeoutId =
      window.setTimeout(() => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        void searchCatalog(
          query,
          locale,
          10,
          controller.signal,
        )
          .then((loadedResults) => {
            if (
              controller.signal.aborted
            ) {
              return;
            }

            setResults(loadedResults);
          })
          .catch(
            (requestError: unknown) => {
              if (
                requestError instanceof
                  DOMException &&
                requestError.name ===
                  'AbortError'
              ) {
                return;
              }

              setError(
                requestError instanceof Error
                  ? requestError.message
                  : content.error,
              );

              setResults([]);
            },
          )
          .finally(() => {
            if (
              !controller.signal.aborted
            ) {
              setIsLoading(false);
            }
          });
      }, debounceDelay);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    isOpen,
    query,
    locale,
    reloadVersion,
    content.error,
  ]);

  const categoryInformation =
    useMemo(() => {
      if (!results?.length) {
        return {
          title: content.products,
          path: '/products',
          isSingleCategory: false,
        };
      }

      const categorySlugs =
        new Set<string>();

      for (const result of results) {
        if (result.type === 'CATEGORY') {
          categorySlugs.add(result.slug);
        } else if (result.categorySlug) {
          categorySlugs.add(
            result.categorySlug,
          );
        }
      }

      if (categorySlugs.size !== 1) {
        return {
          title: content.products,
          path: '/products',
          isSingleCategory: false,
        };
      }

      const [categorySlug] =
        [...categorySlugs];

      const categoryResult =
        results.find(
          (result) =>
            result.type === 'CATEGORY' &&
            result.slug === categorySlug,
        );

      return {
        title:
          categoryResult?.name ??
          formatSlug(categorySlug),
        path: `/products/${categorySlug}`,
        isSingleCategory: true,
      };
    }, [
      results,
      content.products,
    ]);

  const getResultDescription = (
    result: SearchResult,
  ): string => {
    if (result.type === 'CATEGORY') {
      return content.category;
    }

    if (
      result.type ===
      'PRODUCT_VARIANT'
    ) {
      return result.parentProductName
        ? `${content.variant} · ${result.parentProductName}`
        : content.variant;
    }

    return content.product;
  };

  const closeSearch = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  const isDesktop =
    mode === 'desktop';

  return (
    <div
      ref={rootRef}
      className={`relative ${
        isDesktop
          ? 'w-[239px]'
          : 'w-full'
      }`}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setIsOpen(true);
        }}
        className="flex items-center gap-2 rounded-[20px] bg-white/10 px-[15px] py-[5px] transition-[background-color,transform] duration-300 hover:scale-[1.02] hover:bg-white/[0.13] focus-within:bg-white/[0.14]"
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={content.placeholder}
          aria-label={content.placeholder}
          autoComplete="off"
          tabIndex={tabIndex}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent px-1 py-0.5 text-white outline-none placeholder:text-white/50 ${
            isDesktop
              ? 'text-sm'
              : 'text-base'
          }`}
        />

        <button
          type="submit"
          tabIndex={tabIndex}
          aria-label={content.placeholder}
          className="flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-transparent"
        >
          {isLoading && isOpen ? (
            <span className="h-[15px] w-[15px] animate-spin rounded-full border border-white/20 border-t-white/70" />
          ) : (
            <img
              src="/images/search-icon.svg"
              alt=""
              draggable={false}
              className="h-[15px] w-[15px] opacity-70"
            />
          )}
        </button>
      </form>

      <div
        aria-hidden={!isOpen}
        className={`absolute z-[80] flex h-[484px] max-h-[calc(100dvh-100px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#242424] text-white shadow-[0_1.5rem_5rem_rgba(0,0,0,0.55)] transition-[opacity,transform,visibility] duration-300 ${
          isDesktop
            ? 'right-0 top-[calc(100%+20px)] w-[475px]'
            : 'inset-x-0 top-[calc(100%+12px)] w-full'
        } ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
        }`}
      >
        <header className="flex h-[53px] shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
          <h2 className="text-base font-semibold">
            {content.title}
          </h2>

          <button
            type="button"
            aria-label={content.close}
            title={content.close}
            onClick={() =>
              setIsOpen(false)
            }
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition-[background-color,color,transform] duration-300 hover:rotate-90 hover:bg-white/10 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.6"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 p-3">
          <div
            aria-live="polite"
            className="h-full overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]"
          >
            {isLoading &&
              results === null && (
                <SearchSkeleton />
              )}

            {!isLoading && error && (
              <div className="flex h-full min-h-[15rem] flex-col items-center justify-center px-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/35">
                  !
                </span>

                <p className="mt-4 text-sm text-white/45">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setReloadVersion(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs text-white/60 transition-colors hover:bg-white hover:text-black"
                >
                  {locale === 'ru'
                    ? 'Повторить'
                    : 'Retry'}
                </button>
              </div>
            )}

            {!isLoading &&
              !error &&
              results?.length === 0 && (
                <div className="flex h-full min-h-[15rem] items-center justify-center px-6 text-center">
                  <p className="text-sm text-white/35">
                    {content.empty}
                  </p>
                </div>
              )}

            {!error &&
              results &&
              results.length > 0 && (
                <div className="flex flex-col gap-[10px]">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={getResultPath(
                        result,
                      )}
                      onClick={closeSearch}
                      className="group grid min-h-[104px] grid-cols-[82px_minmax(0,1fr)] gap-[10px] rounded-xl border border-white/[0.08] bg-white/[0.06] p-[10px] text-white transition-[background-color,border-color,transform] duration-300 hover:border-white/[0.14] hover:bg-white/[0.1]"
                    >
                      <ResultImage
                        src={result.imageUrl}
                        alt={result.name}
                        fallback={
                          content.noImage
                        }
                      />

                      <div className="flex min-w-0 flex-col justify-center pr-2">
                        <h3 className="truncate text-sm font-normal">
                          {result.name}
                        </h3>

                        <p className="mt-1 truncate text-xs text-white/40">
                          {getResultDescription(
                            result,
                          )}
                        </p>

                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-white/25 transition-colors group-hover:text-white/50">
                          {locale === 'ru'
                            ? 'Открыть'
                            : 'Open'}

                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        </div>

        <footer className="flex min-h-[70px] shrink-0 items-center justify-between gap-5 border-t border-white/[0.08] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
              {categoryInformation
                .isSingleCategory
                ? content.category
                : content.catalog}
            </p>

            <p className="mt-1 truncate text-sm text-white/70">
              {categoryInformation.title}
            </p>
          </div>

          <Link
            to={categoryInformation.path}
            onClick={closeSearch}
            className="shrink-0 text-xs text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            {content.viewAll}
          </Link>
        </footer>
      </div>
    </div>
  );
}