import {
  useEffect,
  useState,
} from 'react';
import { Link } from 'react-router';

import {
  getCategories,
  type PublicCategory,
} from '../../../entities/category';

import { useLocale } from '../../../shared/lib/i18n';

import { productsContent } from '../config/products-content';

const skeletonItems = Array.from(
  {
    length: 6,
  },
  (_, index) => index,
);

export function ProductsPage() {
  const { locale } = useLocale();

  const content = productsContent[locale];

  const [categories, setCategories] =
    useState<PublicCategory[] | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [reloadVersion, setReloadVersion] =
    useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    setCategories(null);
    setError(null);

    void getCategories(
      locale,
      abortController.signal,
    )
      .then((loadedCategories) => {
        if (abortController.signal.aborted) {
          return;
        }

        setCategories(loadedCategories);
      })
      .catch(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setError(content.loadError);
      });

    return () => {
      abortController.abort();
    };
  }, [
    content.loadError,
    locale,
    reloadVersion,
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white">
      <section className="relative flex min-h-screen flex-col items-center px-5 pb-20 pt-[calc(10vw+3.125rem)] min-[1201px]:pt-[calc(10vw+1.25rem)]">
        <h1
          key={`title-${locale}`}
          className="language-content-in pointer-events-none relative z-[2] whitespace-nowrap text-[15vw] font-normal leading-[0.5] text-[#a0a0a0] select-none min-[1201px]:text-[14vw]"
        >
          {content.title}
        </h1>

        {categories === null && !error && (
          <div
            aria-label="Загрузка категорий"
            className="relative z-[2] grid w-full max-w-[1200px] grid-cols-2 gap-[15px] min-[1201px]:grid-cols-3 min-[1201px]:gap-[30px]"
          >
            {skeletonItems.map((item) => (
              <div
                key={item}
                className="flex flex-col items-center"
              >
                <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-[#1a1a1a]" />

                <div className="mt-[14px] h-4 w-20 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="relative z-[2] flex min-h-[24rem] w-full max-w-[1200px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111] px-6 text-center"
          >
            <p className="text-lg text-white/65">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setReloadVersion(
                  (current) => current + 1,
                )
              }
              className="mt-6 rounded-full border border-white/15 px-6 py-3 text-sm text-white transition-colors hover:bg-white hover:text-black"
            >
              {content.retry}
            </button>
          </div>
        )}

        {categories?.length === 0 && (
          <div className="relative z-[2] flex min-h-[24rem] w-full max-w-[1200px] items-center justify-center rounded-2xl border border-white/10 bg-[#111] px-6 text-center">
            <p className="text-lg text-white/50">
              {content.empty}
            </p>
          </div>
        )}

        {categories &&
          categories.length > 0 && (
            <div
              key={`categories-${locale}`}
              className="language-content-in relative z-[2] grid w-full max-w-[1200px] grid-cols-2 gap-[15px] min-[1201px]:grid-cols-3 min-[1201px]:gap-[30px]"
            >
              {categories.map(
                (category, index) => (
                  <Link
                    key={category.id}
                    to={`/products/${category.slug}`}
                    aria-label={category.name}
                    draggable={false}
                    className="group flex flex-col items-center text-white no-underline"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-[0_8px_24px_rgba(0,0,0,0.5)] transform-gpu transition-all duration-700 ease-in-out min-[1201px]:group-hover:-translate-y-1.5 min-[1201px]:group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        draggable={false}
                        loading={
                          index < 3
                            ? 'eager'
                            : 'lazy'
                        }
                        className="pointer-events-none block h-full w-full object-cover"
                      />
                    </div>
                    
                    <span className="mt-[14px] text-center text-[15px] text-white transition-colors duration-500 group-hover:text-white/65 min-[1201px]:text-[18px]">
                      {category.name}
                    </span>
                  </Link>
                ),
              )}
            </div>
          )}
      </section>
    </main>
  );
}