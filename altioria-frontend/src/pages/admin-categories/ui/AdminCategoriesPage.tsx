import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import {
  AdminCategoriesApiError,
  getAdminCategories,
  type AdminCategory,
} from '../../../features/admin-categories';

interface CategoryImageProps {
  src: string | null;
  alt: string;
}

function CategoryImage({
  src,
  alt,
}: CategoryImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-white/[0.025] text-white/20">
        <div className="flex flex-col items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-7 w-7"
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
    <div className="aspect-[16/10] overflow-hidden bg-white/[0.025]">
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        onError={() => setHasError(true)}
        className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
      />
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat(
  'ru-RU',
  {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
);

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Неизвестно';
  }

  return dateFormatter.format(date);
}

const skeletonItems = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
];

export function AdminCategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<
    AdminCategory[] | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  const loadCategories =
    useCallback(async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminCategories();

        setCategories(result);
      } catch (error: unknown) {
        if (
          error instanceof AdminCategoriesApiError &&
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
            : 'Не удалось получить категории',
        );
      } finally {
        setIsLoading(false);
      }
    }, [navigate]);

  useEffect(() => {
    document.title = 'Категории — Altioria';

    void loadCategories();

    return () => {
      document.title = 'Altioria';
    };
  }, [loadCategories]);

  const sortedCategories = categories
    ? [...categories].sort(
        (first, second) =>
          first.sortOrder - second.sortOrder,
      )
    : [];

  const isInitialLoading =
    categories === null && isLoading;

  return (
    <section>
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
            Управление каталогом
          </p>

          <div className="flex items-end gap-4">
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
              Категории
            </h1>

            {categories && (
              <span className="mb-1.5 flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs text-white/40">
                {categories.length}
              </span>
            )}
          </div>

          <p className="mt-5 max-w-[38rem] text-sm leading-relaxed text-white/35">
            Категории отображаются в том же порядке,
            который используется на публичной странице
            продукции.
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => void loadCategories()}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-[background-color,color] duration-300 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
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
      </header>

      {error && categories !== null && (
        <div
          role="alert"
          className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.06] px-4 py-3"
        >
          <p className="text-sm text-[#e4aaaa]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadCategories()}
            className="shrink-0 text-xs text-white/50 transition-colors hover:text-white"
          >
            Повторить
          </button>
        </div>
      )}

      {isInitialLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {skeletonItems.map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025]"
            >
              <div className="aspect-[16/10] animate-pulse bg-white/[0.045]" />

              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {categories === null &&
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
              Не удалось загрузить категории
            </h2>

            <p className="mt-2 text-sm text-white/35">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadCategories()}
              className="mt-6 h-11 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5]"
            >
              Попробовать снова
            </button>
          </div>
        )}

      {categories?.length === 0 && (
        <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.015] px-5 text-center">
          <h2 className="text-lg font-medium">
            Категорий пока нет
          </h2>

          <p className="mt-2 text-sm text-white/35">
            Созданные категории появятся здесь.
          </p>
        </div>
      )}

      {sortedCategories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {sortedCategories.map((category) => (
            <article
              key={category.id}
              className="group overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-white/[0.04]"
            >
              <div className="relative">
                <CategoryImage
                  src={category.imageUrl}
                  alt={category.nameRu}
                />

                <span
                  className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium backdrop-blur-lg ${
                    category.isPublished
                      ? 'border-[#91c89a]/20 bg-[#142017]/85 text-[#a7d6ae]'
                      : 'border-white/10 bg-[#141414]/85 text-white/45'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      category.isPublished
                        ? 'bg-[#91c89a]'
                        : 'bg-white/30'
                    }`}
                  />

                  {category.isPublished
                    ? 'Опубликована'
                    : 'Черновик'}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-medium tracking-[-0.025em]">
                      {category.nameRu}
                    </h2>

                    <p className="mt-1 truncate text-sm text-white/35">
                      {category.nameEn}
                    </p>
                  </div>

                  <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] px-2 text-xs text-white/40">
                    {category.sortOrder}
                  </span>
                </div>

                <div className="mt-5 border-t border-white/[0.07] pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <code className="truncate text-xs text-white/30">
                      /{category.slug}
                    </code>

                    <span className="shrink-0 text-[0.68rem] uppercase tracking-[0.12em] text-white/20">
                      Позиция
                    </span>
                  </div>

                  <p className="mt-4 text-[0.7rem] text-white/20">
                    Обновлена{' '}
                    {formatDate(category.updatedAt)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}