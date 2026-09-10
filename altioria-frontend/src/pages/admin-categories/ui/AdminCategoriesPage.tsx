import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import {
  AdminCategoriesApiError,
  CreateAdminCategoryModal,
  DeleteAdminCategoryModal,
  getAdminCategories,
  reorderAdminCategories,
  UpdateAdminCategoryModal,
  type AdminCategory,
} from '../../../features/admin-categories';

import { DragDropProvider } from '@dnd-kit/react';
import {
  isSortable,
  useSortable,
} from '@dnd-kit/react/sortable';

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
      <div className="flex aspect-[4/5] items-center justify-center bg-white/[0.025] text-white/20">
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
    <div className="aspect-[4/5] overflow-hidden bg-white/[0.025]">
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        onError={() => setHasError(true)}
        className="block h-full w-full object-cover transition-[filter,opacity] duration-500 group-hover:brightness-[1.07] group-hover:saturate-[1.03]"
      />
    </div>
  );
}

interface SortableCategoryItemProps {
  id: string;
  index: number;
  name: string;
  isReordering: boolean;
  isSaving: boolean;
  children: ReactNode;
}

function SortableCategoryItem({
  id,
  index,
  name,
  isReordering,
  isSaving,
  children,
}: SortableCategoryItemProps) {
  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id,
    index,
    disabled: !isReordering || isSaving,
  });

  return (
    <div
      ref={ref}
      className={`relative transition-[opacity,filter] duration-200 ${
        isDragSource
          ? 'z-30 opacity-80 drop-shadow-[0_2rem_2rem_rgba(0,0,0,0.5)]'
          : ''
      }`}
    >
      {isReordering && (
        <button
          ref={handleRef}
          type="button"
          disabled={isSaving}
          aria-label={`Переместить категорию ${name}, текущая позиция ${index + 1}`}
          className="absolute left-3 top-3 z-20 flex h-10 cursor-grab touch-none items-center gap-2 rounded-full border border-white/15 bg-black/80 px-3 text-xs text-white/70 shadow-xl backdrop-blur-md transition-colors hover:bg-white hover:text-black active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <circle
              cx="6"
              cy="5"
              r="1.2"
              fill="currentColor"
            />
            <circle
              cx="14"
              cy="5"
              r="1.2"
              fill="currentColor"
            />
            <circle
              cx="6"
              cy="10"
              r="1.2"
              fill="currentColor"
            />
            <circle
              cx="14"
              cy="10"
              r="1.2"
              fill="currentColor"
            />
            <circle
              cx="6"
              cy="15"
              r="1.2"
              fill="currentColor"
            />
            <circle
              cx="14"
              cy="15"
              r="1.2"
              fill="currentColor"
            />
          </svg>

          <span>#{index + 1}</span>
        </button>
      )}

      {children}
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

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<AdminCategory | null>(null);

  const [
    deletingCategory,
    setDeletingCategory,
  ] = useState<AdminCategory | null>(null);

  const [isReordering, setIsReordering] =
    useState(false);
  
  const [isSavingOrder, setIsSavingOrder] =
    useState(false);
  
  const [
    orderBeforeEditing,
    setOrderBeforeEditing,
  ] = useState<AdminCategory[] | null>(null);
  
  const [reorderError, setReorderError] = useState<
    string | null
  >(null);

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

  function handleCategoryCreated(
    category: AdminCategory,
  ): void {
    setCategories((currentCategories) => {
      if (!currentCategories) {
        return [category];
      }
  
      return [
        ...currentCategories,
        category,
      ];
    });
  }

  function handleCategoryUpdated(
    updatedCategory: AdminCategory,
  ): void {
    setCategories((currentCategories) => {
      if (!currentCategories) {
        return [updatedCategory];
      }
  
      return currentCategories.map((category) =>
        category.id === updatedCategory.id
          ? updatedCategory
          : category,
      );
    });
  }

  function handleCategoryDeleted(
    categoryId: string,
  ): void {
    setCategories((currentCategories) => {
      if (!currentCategories) {
        return [];
      }
  
      return currentCategories.filter(
        (category) => category.id !== categoryId,
      );
    });
  }

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

  const displayedCategories =
    isReordering && categories
      ? categories
      : sortedCategories;
  
  const hasOrderChanges =
    isReordering &&
    categories !== null &&
    orderBeforeEditing !== null &&
    categories.some(
      (category, index) =>
        category.id !==
        orderBeforeEditing[index]?.id,
    );

  function startReordering(): void {
    if (!categories || categories.length < 2) {
      return;
    }
  
    const orderedCategories = [...categories].sort(
      (first, second) =>
        first.sortOrder - second.sortOrder,
    );
  
    setCategories(orderedCategories);
    setOrderBeforeEditing(orderedCategories);
    setReorderError(null);
    setIsReordering(true);
  }
  
  function cancelReordering(): void {
    if (orderBeforeEditing) {
      setCategories(orderBeforeEditing);
    }
  
    setOrderBeforeEditing(null);
    setReorderError(null);
    setIsReordering(false);
  }
  
  async function saveCategoryOrder(): Promise<void> {
    if (
      !categories ||
      !hasOrderChanges ||
      isSavingOrder
    ) {
      return;
    }
  
    setIsSavingOrder(true);
    setReorderError(null);
  
    try {
      await reorderAdminCategories(
        categories.map((category) => category.id),
      );
  
      const refreshedCategories =
        await getAdminCategories();
  
      setCategories(refreshedCategories);
      setOrderBeforeEditing(null);
      setIsReordering(false);
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
  
      setReorderError(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить порядок',
      );
    } finally {
      setIsSavingOrder(false);
    }
  }

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

        <div className="flex flex-wrap items-center gap-3">
          {isReordering ? (
            <>
              <button
                type="button"
                disabled={isSavingOrder}
                onClick={cancelReordering}
                className="h-11 rounded-xl border border-white/10 px-4 text-sm text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
              >
                Отмена
              </button>
        
              <button
                type="button"
                disabled={
                  !hasOrderChanges || isSavingOrder
                }
                onClick={() =>
                  void saveCategoryOrder()
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {isSavingOrder && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                )}
        
                {isSavingOrder
                  ? 'Сохранение'
                  : 'Сохранить порядок'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  void loadCategories()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
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
              
              <button
                type="button"
                disabled={
                  !categories ||
                  categories.length < 2
                }
                onClick={startReordering}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M8 6h12M4 6h.01M8 12h12M4 12h.01M8 18h12M4 18h.01"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
            
                Изменить порядок
              </button>
            
              <button
                type="button"
                onClick={() =>
                  setIsCreateModalOpen(true)
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5]"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.7"
                  />
                </svg>
            
                Добавить категорию
              </button>
            </>
          )}
        </div>
      </header>

      {isReordering && reorderError && (
        <div
          role="alert"
          className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.06] px-4 py-3"
        >
          <p className="text-sm text-[#e4aaaa]">
            {reorderError}
          </p>

          <button
            type="button"
            onClick={() => setReorderError(null)}
            className="shrink-0 text-xs text-white/50 transition-colors hover:text-white"
          >
            Закрыть
          </button>
        </div>
      )}

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
              <div className="aspect-[4/5] animate-pulse bg-white/[0.045]" />

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

      {displayedCategories.length > 0 && (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled || !isReordering) {
              return;
            }
        
            const { source } = event.operation;
        
            if (!isSortable(source)) {
              return;
            }
        
            const {
              initialIndex,
              index,
            } = source;
        
            if (initialIndex === index) {
              return;
            }
        
            setReorderError(null);
        
            setCategories((currentCategories) => {
              if (!currentCategories) {
                return currentCategories;
              }
          
              const reorderedCategories = [
                ...currentCategories,
              ];
          
              const [movedCategory] =
                reorderedCategories.splice(
                  initialIndex,
                  1,
                );
            
              if (!movedCategory) {
                return currentCategories;
              }
          
              reorderedCategories.splice(
                index,
                0,
                movedCategory,
              );
          
              return reorderedCategories;
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {displayedCategories.map(
              (category, index) => (
                <SortableCategoryItem
                  key={category.id}
                  id={category.id}
                  index={index}
                  name={category.nameRu}
                  isReordering={isReordering}
                  isSaving={isSavingOrder}
                >
                  <article className="group overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/[0.15] hover:bg-white/[0.035] hover:shadow-[0_1.5rem_4rem_rgba(0,0,0,0.28)]">
                    <div className="relative">
                      <CategoryImage
                        src={category.imageUrl}
                        alt={category.nameRu}
                      />
      
                      {!isReordering && (
                        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Изменить категорию ${category.nameRu}`}
                            title="Изменить"
                            onClick={() =>
                              setEditingCategory(category)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white/65 backdrop-blur-md transition-[background-color,color] hover:bg-white hover:text-black"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-4 w-4"
                            >
                              <path
                                d="M14.5 5.5l4 4M6 18l2.3-5.2L16.8 4.3a1.4 1.4 0 012 0l.9.9a1.4 1.4 0 010 2l-8.5 8.5L6 18zM6 18l4-.7"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </button>
                        
                          <button
                            type="button"
                            aria-label={`Удалить категорию ${category.nameRu}`}
                            title="Удалить"
                            onClick={() =>
                              setDeletingCategory(category)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white/50 backdrop-blur-md transition-[background-color,color] hover:bg-[#d99595] hover:text-[#1a0e0e]"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-4 w-4"
                            >
                              <path
                                d="M5 7h14M9 7V4.5h6V7M7.5 7l.7 12h7.6l.7-12M10 10.5v5M14 10.5v5"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
      
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
                          {isReordering
                            ? index + 1
                            : category.sortOrder}
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
                </SortableCategoryItem>
              ),
            )}
          </div>
        </DragDropProvider>
      )}

      {isCreateModalOpen && (
        <CreateAdminCategoryModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleCategoryCreated}
        />
      )}

      {editingCategory && (
        <UpdateAdminCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onUpdated={handleCategoryUpdated}
        />
      )}

      {deletingCategory && (
        <DeleteAdminCategoryModal
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onDeleted={handleCategoryDeleted}
        />
      )}
    </section>
  );
}