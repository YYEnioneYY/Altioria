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
    placeholder: 'поиск',
    title: 'Результаты',
    loading: 'Ищем...',
    empty: 'Ничего не найдено',
    error:
      'Не удалось выполнить поиск',
    product: 'товар',
    category: 'категория',
    variant: 'исполнение',
    catalog: 'каталог',
    products: 'вся мебель',
    viewAll: 'смотреть всё',
    close: 'Закрыть поиск',
    noImage: 'нет фото',
    open: 'открыть',
    initial:
      'Первые предметы каталога',
    retry: 'повторить',
  },

  en: {
    placeholder: 'search',
    title: 'Results',
    loading: 'Searching...',
    empty: 'Nothing found',
    error: 'Search failed',
    product: 'product',
    category: 'category',
    variant: 'variant',
    catalog: 'catalog',
    products: 'all furniture',
    viewAll: 'view all',
    close: 'Close search',
    noImage: 'no image',
    open: 'open',
    initial:
      'First catalog items',
    retry: 'retry',
  },
} as const;

const skeletonItems = [
  'first',
  'second',
  'third',
  'fourth',
];

function getResultPath(
  result: SearchResult,
  locale: 'ru' | 'en',
): string {
  if (result.type === 'CATEGORY') {
    return `/${locale}/products/${result.slug}`;
  }

  if (!result.categorySlug) {
    return `/${locale}/products`;
  }

  const productPath =
    `/${locale}/products/${result.categorySlug}/${result.slug}`;

  if (
    result.type ===
      'PRODUCT_VARIANT' &&
    result.variantSlug
  ) {
    return `${productPath}?variant=${encodeURIComponent(
      result.variantSlug,
    )}`;
  }

  return productPath;
}

function formatSlug(
  slug: string,
): string {
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
      <div className="flex h-full w-full items-center justify-center border-r border-white/35 bg-[#0a0a0a] px-1 text-center text-[8px] font-normal lowercase leading-tight text-white/30 transition-colors group-hover:border-black/35 group-hover:bg-[#ededed] group-hover:text-black/40">
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
      onError={() =>
        setHasError(true)
      }
      className="block h-full w-full border-r border-white/35 object-cover transition-[border-color,filter] duration-300 group-hover:border-black/35"
    />
  );
}

function SearchSkeleton() {
  return (
    <div>
      {skeletonItems.map(
        (item) => (
          <div
            key={item}
            className="grid min-h-[76px] animate-pulse grid-cols-[68px_minmax(0,1fr)] border-b border-white/30"
          >
            <div className="border-r border-white/25 bg-white/[0.05]" />

            <div className="flex flex-col justify-center px-3">
              <div className="h-3 w-2/3 bg-white/[0.08]" />

              <div className="mt-2 h-2 w-1/3 bg-white/[0.05]" />
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
    useState<SearchResult[] | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    reloadVersion,
    setReloadVersion,
  ] = useState(0);

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
          .then(
            (loadedResults) => {
              if (
                controller.signal
                  .aborted
              ) {
                return;
              }

              setResults(
                loadedResults,
              );
            },
          )
          .catch(
            (
              requestError:
                unknown,
            ) => {
              if (
                requestError instanceof
                  DOMException &&
                requestError.name ===
                  'AbortError'
              ) {
                return;
              }

              setError(
                requestError instanceof
                  Error
                  ? requestError.message
                  : content.error,
              );

              setResults([]);
            },
          )
          .finally(() => {
            if (
              !controller.signal
                .aborted
            ) {
              setIsLoading(false);
            }
          });
      }, debounceDelay);

    return () => {
      window.clearTimeout(
        timeoutId,
      );

      controller.abort();
    };
  }, [
    content.error,
    isOpen,
    locale,
    query,
    reloadVersion,
  ]);

  const categoryInformation =
    useMemo(() => {
      if (!results?.length) {
        return {
          title:
            content.products,

          path:
            `/${locale}/products`,

          isSingleCategory:
            false,
        };
      }

      const categorySlugs =
        new Set<string>();

      for (
        const result of results
      ) {
        if (
          result.type ===
          'CATEGORY'
        ) {
          categorySlugs.add(
            result.slug,
          );
        } else if (
          result.categorySlug
        ) {
          categorySlugs.add(
            result.categorySlug,
          );
        }
      }

      if (
        categorySlugs.size !== 1
      ) {
        return {
          title:
            content.products,

          path:
            `/${locale}/products`,

          isSingleCategory:
            false,
        };
      }

      const [categorySlug] = [
        ...categorySlugs,
      ];

      const categoryResult =
        results.find(
          (result) =>
            result.type ===
              'CATEGORY' &&
            result.slug ===
              categorySlug,
        );

      return {
        title:
          categoryResult?.name ??
          formatSlug(
            categorySlug,
          ),

        path:
          `/${locale}/products/${categorySlug}`,

        isSingleCategory:
          true,
      };
    }, [
      content.products,
      locale,
      results,
    ]);

  const getResultDescription = (
    result: SearchResult,
  ): string => {
    if (
      result.type ===
      'CATEGORY'
    ) {
      return content.category;
    }

    if (
      result.type ===
        'PRODUCT_VARIANT'
    ) {
      return result
        .parentProductName
        ? `${content.variant} / ${result.parentProductName}`
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

  const normalizedQuery =
    query.trim();

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${
        isDesktop
          ? 'z-[60]'
          : 'z-[120]'
      }`}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setIsOpen(true);
        }}
        className={`relative z-[140] flex items-center gap-3 border-b bg-black transition-colors duration-300 ${
          isOpen
            ? 'border-white'
            : 'border-white/50'
        } ${
          isDesktop
            ? 'h-[32px]'
            : 'h-10'
        }`}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={
            content.placeholder
          }
          aria-label={
            content.placeholder
          }
          autoComplete="off"
          tabIndex={tabIndex}
          onFocus={() =>
            setIsOpen(true)
          }
          onChange={(event) => {
            setQuery(
              event.target.value,
            );

            setIsOpen(true);
          }}
          className="site-mono min-w-0 flex-1 border-0 bg-black p-0 text-[14px] font-normal lowercase leading-none text-white outline-none placeholder:text-white/35"
        />

        {query && (
          <button
            type="button"
            tabIndex={tabIndex}
            aria-label={
              locale === 'ru'
                ? 'Очистить поиск'
                : 'Clear search'
            }
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="site-mono border-0 bg-transparent text-[14px] font-normal text-white/40 transition-colors hover:text-white"
          >
            ×
          </button>
        )}

        <button
          type="submit"
          tabIndex={tabIndex}
          aria-label={
            content.placeholder
          }
          className="flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-black"
        >
          {isLoading &&
          isOpen ? (
            <span className="h-[14px] w-[14px] animate-spin rounded-full border border-white/20 border-t-white" />
          ) : (
            <img
              src="/images/search-icon.svg"
              alt=""
              draggable={false}
              className="h-[14px] w-[14px]"
            />
          )}
        </button>
      </form>

      <div
        aria-hidden={!isOpen}
        className={`site-mono z-[130] flex flex-col overflow-hidden border border-white/60 bg-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.95)] transition-[opacity,transform,visibility] duration-300 ${
          isDesktop
            ? 'absolute right-0 top-[calc(100%+14px)] h-[500px] max-h-[calc(100dvh-96px)] w-[440px]'
            : 'absolute left-0 top-[calc(100%+12px)] h-[calc(100dvh-112px)] max-h-[460px] w-[calc(100vw-30px)]'
        } ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <header className="flex min-h-[48px] shrink-0 items-center justify-between border-b border-white/50 px-3">
          <div className="min-w-0">
            <h2 className="site-mono truncate text-[14px] font-normal lowercase leading-none text-white">
              {content.title}
            </h2>

            <p className="mt-1 truncate text-[9px] font-normal lowercase text-white/35">
              {normalizedQuery
                ? `“${normalizedQuery}”`
                : content.initial}
            </p>
          </div>

          <button
            type="button"
            aria-label={
              content.close
            }
            title={content.close}
            onClick={() =>
              setIsOpen(false)
            }
            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center border-0 bg-black text-white/70 transition-colors duration-300 hover:text-white"
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
                strokeWidth="1.2"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div
            aria-live="polite"
            className="h-full overflow-y-auto [scrollbar-color:rgba(255,255,255,0.3)_transparent] [scrollbar-width:thin]"
          >
            {isLoading &&
              results === null && (
                <SearchSkeleton />
              )}

            {!isLoading &&
              error && (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-5 text-center">
                  <span className="flex h-8 w-8 items-center justify-center border border-white/40 text-[12px] text-white/60">
                    !
                  </span>

                  <p className="mt-4 max-w-xs text-[11px] leading-relaxed text-white/55">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setReloadVersion(
                        (
                          current,
                        ) =>
                          current + 1,
                      )
                    }
                    className="mt-5 border border-white/50 bg-black px-4 py-2 text-[10px] font-normal lowercase text-white transition-[background-color,color] hover:bg-white hover:text-black"
                  >
                    {content.retry}
                  </button>
                </div>
              )}

            {!isLoading &&
              !error &&
              results?.length ===
                0 && (
                <div className="flex h-full min-h-[220px] items-center justify-center px-5 text-center">
                  <p className="site-mono text-[14px] font-normal lowercase text-white/35">
                    {content.empty}
                  </p>
                </div>
              )}

            {!error &&
              results &&
              results.length > 0 && (
                <div>
                  {results.map(
                    (
                      result,
                      index,
                    ) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        to={getResultPath(
                          result,
                          locale,
                        )}
                        onClick={
                          closeSearch
                        }
                        className={`group grid border-b border-white/30 bg-black text-white transition-[background-color,color] duration-300 hover:bg-white hover:text-black ${
                          isDesktop
                            ? 'min-h-[84px] grid-cols-[76px_minmax(0,1fr)]'
                            : 'min-h-[72px] grid-cols-[64px_minmax(0,1fr)]'
                        }`}
                      >
                        <ResultImage
                          src={
                            result.imageUrl
                          }
                          alt={
                            result.name
                          }
                          fallback={
                            content.noImage
                          }
                        />

                        <div className="flex min-w-0 flex-col justify-between px-3 py-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="truncate text-[9px] font-normal lowercase text-white/35 transition-colors group-hover:text-black/45">
                              {getResultDescription(
                                result,
                              )}
                            </span>

                            <span className="shrink-0 text-[9px] text-white/25 transition-colors group-hover:text-black/35">
                              {String(
                                index + 1,
                              ).padStart(
                                2,
                                '0',
                              )}
                            </span>
                          </div>

                          <h3 className="site-mono truncate text-[14px] font-normal uppercase leading-none text-white transition-colors group-hover:text-black">
                            {result.name}
                          </h3>

                          <span className="flex items-center justify-between text-[9px] font-normal lowercase text-white/35 transition-colors group-hover:text-black/50">
                            {content.open}

                            <span className="text-[13px] transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
          </div>
        </div>

        <footer className="flex min-h-[56px] shrink-0 items-center justify-between gap-4 border-t border-white/50 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[8px] font-normal lowercase text-white/30">
              {categoryInformation
                .isSingleCategory
                ? content.category
                : content.catalog}
            </p>

            <p className="site-mono mt-1 truncate text-[13px] font-normal lowercase leading-none text-white">
              {
                categoryInformation.title
              }
            </p>
          </div>

          <Link
            to={
              categoryInformation.path
            }
            onClick={closeSearch}
            className="shrink-0 border border-white/50 px-3 py-2 text-[10px] font-normal lowercase text-white transition-[background-color,color] duration-300 hover:bg-white hover:text-black"
          >
            {content.viewAll}
          </Link>
        </footer>
      </div>
    </div>
  );
}