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
    error: 'Не удалось выполнить поиск',
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
  },
} as const;

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
      <div className="flex h-full w-full items-center justify-center border-r border-white/40 bg-[#090909] px-2 text-center text-[9px] lowercase text-white/25 transition-colors group-hover:border-black/35 group-hover:bg-[#ededed] group-hover:text-black/35">
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
      className="block h-full w-full border-r border-white/40 object-cover transition-[border-color,filter] duration-300 group-hover:border-black/35"
    />
  );
}

const skeletonItems = [
  'first',
  'second',
  'third',
  'fourth',
];

function SearchSkeleton() {
  return (
    <div className="border-t border-white/45">
      {skeletonItems.map(
        (item) => (
          <div
            key={item}
            className="grid min-h-[108px] animate-pulse grid-cols-[96px_minmax(0,1fr)] border-b border-white/45"
          >
            <div className="border-r border-white/30 bg-white/[0.05]" />

            <div className="flex flex-col justify-center px-4">
              <div className="h-4 w-2/3 bg-white/[0.08]" />

              <div className="mt-3 h-2.5 w-1/3 bg-white/[0.05]" />
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
          title: content.products,

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
          title: content.products,

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
          ? ''
          : 'z-[120]'
      }`}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setIsOpen(true);
        }}
        className={`relative z-[90] flex items-center gap-3 border-b bg-black transition-colors duration-300 ${
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
          className={`site-mono min-w-0 flex-1 border-0 bg-black p-0 font-normal lowercase text-white outline-none placeholder:text-white/35 ${
            isDesktop
              ? 'text-[13px]'
              : 'text-[14px]'
          }`}
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
            className="site-mono border-0 bg-transparent text-[13px] text-white/40 transition-colors hover:text-white"
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
              className="h-[15px] w-[15px]"
            />
          )}
        </button>
      </form>

      <div
        aria-hidden={!isOpen}
        className={`site-mono z-[130] flex flex-col overflow-hidden border border-white/70 bg-[#111111] text-white shadow-[0_24px_70px_rgba(0,0,0,0.95)] transition-[opacity,transform,visibility] duration-300 ${
          isDesktop
            ? 'absolute right-0 top-[calc(100%+18px)] h-[560px] max-h-[calc(100dvh-100px)] w-[520px]'
            : 'absolute inset-x-0 top-[calc(100%+12px)] h-[calc(100dvh-190px)] max-h-[520px] w-full'
        } ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <header className="flex min-h-[58px] shrink-0 items-center justify-between border-b border-white/65 px-4">
          <div>
            <h2 className="site-display text-[24px] font-normal uppercase leading-none">
              {content.title}
            </h2>

            <p className="mt-1 text-[9px] lowercase text-white/35">
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
            className="flex h-8 w-8 items-center justify-center border border-white/45 bg-black text-white transition-[background-color,color] duration-300 hover:bg-white hover:text-black"
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
                strokeWidth="1.5"
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
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-6 text-center">
                  <span className="flex h-10 w-10 items-center justify-center border border-white/50 text-white/60">
                    !
                  </span>

                  <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-white/55">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setReloadVersion(
                        (
                          current,
                        ) =>
                          current +
                          1,
                      )
                    }
                    className="mt-5 border border-white/50 bg-black px-5 py-2 text-[11px] lowercase text-white transition-[background-color,color] hover:bg-white hover:text-black"
                  >
                    {locale === 'ru'
                      ? 'повторить'
                      : 'retry'}
                  </button>
                </div>
              )}

            {!isLoading &&
              !error &&
              results?.length ===
                0 && (
                <div className="flex h-full min-h-[260px] items-center justify-center px-6 text-center">
                  <p className="site-display text-[clamp(24px,4vw,38px)] uppercase leading-none text-white/30">
                    {content.empty}
                  </p>
                </div>
              )}

            {!error &&
              results &&
              results.length >
                0 && (
                <div className="border-t border-white/45">
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
                        className={`group grid border-b border-white/45 bg-[#111111] text-white transition-[background-color,color] duration-300 hover:bg-white hover:text-black ${
                          isDesktop
                            ? 'min-h-[108px] grid-cols-[96px_minmax(0,1fr)]'
                            : 'min-h-[88px] grid-cols-[82px_minmax(0,1fr)]'
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

                        <div className="flex min-w-0 flex-col justify-between px-4 py-3">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-[9px] lowercase text-white/35 transition-colors group-hover:text-black/40">
                              {getResultDescription(
                                result,
                              )}
                            </span>

                            <span className="text-[9px] text-white/25 transition-colors group-hover:text-black/35">
                              {String(
                                index + 1,
                              ).padStart(
                                2,
                                '0',
                              )}
                            </span>
                          </div>

                          <h3 className="site-display truncate text-[clamp(20px,2.1vw,29px)] font-normal uppercase leading-none">
                            {result.name}
                          </h3>

                          <span className="flex items-center justify-between text-[9px] lowercase text-white/35 transition-colors group-hover:text-black/50">
                            {content.open}

                            <span className="text-[15px] transition-transform duration-300 group-hover:translate-x-1">
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

        <footer className="flex min-h-[66px] shrink-0 items-center justify-between gap-5 border-t border-white/65 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[8px] lowercase text-white/30">
              {categoryInformation
                .isSingleCategory
                ? content.category
                : content.catalog}
            </p>

            <p className="site-display mt-1 truncate text-[18px] uppercase leading-none text-white">
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
            className="shrink-0 border border-white/55 px-4 py-2 text-[10px] lowercase text-white transition-[background-color,color] duration-300 hover:bg-white hover:text-black"
          >
            {content.viewAll}
          </Link>
        </footer>
      </div>
    </div>
  );
}