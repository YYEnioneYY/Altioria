import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import {
  type UpdateAdminCategoryInput,
  updateAdminCategory,
} from '../api/update-admin-category';
import {
  AdminCategoriesApiError,
  type AdminCategory,
} from '../api/get-admin-categories';

interface UpdateAdminCategoryModalProps {
  category: AdminCategory;
  onClose: () => void;
  onUpdated: (category: AdminCategory) => void;
}

const MAX_IMAGE_SIZE = 100 * 1024 * 1024;

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function UpdateAdminCategoryModal({
  category,
  onClose,
  onUpdated,
}: UpdateAdminCategoryModalProps) {
  const navigate = useNavigate();

  const [slug, setSlug] = useState(category.slug);
  const [nameRu, setNameRu] = useState(
    category.nameRu,
  );
  const [nameEn, setNameEn] = useState(
    category.nameEn,
  );

  const [sortOrder, setSortOrder] = useState(
    String(category.sortOrder),
  );

  const [isPublished, setIsPublished] = useState(
    category.isPublished,
  );

  const [image, setImage] = useState<File | null>(
    null,
  );

  const [removeImage, setRemoveImage] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const newImagePreviewUrl = useMemo(() => {
    if (!image) {
      return null;
    }

    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (newImagePreviewUrl) {
        URL.revokeObjectURL(newImagePreviewUrl);
      }
    };
  }, [newImagePreviewUrl]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (
        event.key === 'Escape' &&
        !isSubmitting
      ) {
        onClose();
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isSubmitting, onClose]);

  const displayedImageUrl =
    newImagePreviewUrl ??
    (!removeImage ? category.imageUrl : null);

  function handleImageChange(
    file: File | undefined,
  ): void {
    setError(null);

    if (!file) {
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      setError(
        'Допустимы изображения JPG, JPEG, PNG и WEBP',
      );

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        'Размер изображения не должен превышать 100 МБ',
      );

      return;
    }

    setImage(file);
    setRemoveImage(false);
  }

  function handleRemoveImage(): void {
    setError(null);

    if (image) {
      setImage(null);
      return;
    }

    if (category.imageUrl) {
      setRemoveImage(true);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedSlug = slug.trim();
    const normalizedNameRu = nameRu.trim();
    const normalizedNameEn = nameEn.trim();

    if (
      !normalizedSlug ||
      !normalizedNameRu ||
      !normalizedNameEn
    ) {
      setError(
        'Slug и оба названия не могут быть пустыми',
      );

      return;
    }

    const parsedSortOrder = Number(sortOrder);

    if (
      !Number.isInteger(parsedSortOrder) ||
      parsedSortOrder < 0
    ) {
      setError(
        'Порядок должен быть целым положительным числом или нулём',
      );

      return;
    }

    const hasResultingImage = Boolean(
      image ||
        (category.imageUrl && !removeImage),
    );

    if (isPublished && !hasResultingImage) {
      setError(
        'Нельзя опубликовать категорию без изображения',
      );

      return;
    }

    const changes: UpdateAdminCategoryInput = {};

    if (normalizedSlug !== category.slug) {
      changes.slug = normalizedSlug;
    }

    if (normalizedNameRu !== category.nameRu) {
      changes.nameRu = normalizedNameRu;
    }

    if (normalizedNameEn !== category.nameEn) {
      changes.nameEn = normalizedNameEn;
    }

    if (parsedSortOrder !== category.sortOrder) {
      changes.sortOrder = parsedSortOrder;
    }

    if (isPublished !== category.isPublished) {
      changes.isPublished = isPublished;
    }

    if (removeImage) {
      changes.removeImage = true;
    }

    if (image) {
      changes.image = image;
    }

    if (Object.keys(changes).length === 0) {
      setError('Вы ничего не изменили');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const updatedCategory =
        await updateAdminCategory(
          category.id,
          changes,
        );

      onUpdated(updatedCategory);
      onClose();
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
          : 'Не удалось обновить категорию',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Закрыть окно"
        disabled={isSubmitting}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-category-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-[42rem] overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#141414] shadow-[0_2rem_8rem_rgba(0,0,0,0.65)]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/[0.07] bg-[#141414]/95 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/25">
              Редактирование
            </p>

            <h2
              id="update-category-title"
              className="text-2xl font-medium tracking-[-0.035em]"
            >
              {category.nameRu}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Закрыть"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-6 py-6 sm:px-8 sm:py-8"
        >
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
              Slug
            </span>

            <input
              autoFocus
              type="text"
              value={slug}
              disabled={isSubmitting}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => {
                setSlug(
                  event.target.value.toLowerCase(),
                );
                setError(null);
              }}
              className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors focus:border-white/25 focus:bg-white/[0.06]"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Название на русском
              </span>

              <input
                type="text"
                value={nameRu}
                disabled={isSubmitting}
                onChange={(event) => {
                  setNameRu(event.target.value);
                  setError(null);
                }}
                className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors focus:border-white/25 focus:bg-white/[0.06]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Название на английском
              </span>

              <input
                type="text"
                value={nameEn}
                disabled={isSubmitting}
                onChange={(event) => {
                  setNameEn(event.target.value);
                  setError(null);
                }}
                className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors focus:border-white/25 focus:bg-white/[0.06]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
              Порядок отображения
            </span>

            <input
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              disabled={isSubmitting}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setError(null);
              }}
              className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors focus:border-white/25 focus:bg-white/[0.06]"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
              Изображение
            </span>

            {displayedImageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <img
                  src={displayedImageUrl}
                  alt={nameRu}
                  draggable={false}
                  className="aspect-[16/9] w-full object-cover"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] p-4">
                  <p className="min-w-0 truncate text-sm text-white/40">
                    {image
                      ? image.name
                      : 'Текущее изображение'}
                  </p>

                  <div className="flex gap-2">
                    <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white">
                      Заменить

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        disabled={isSubmitting}
                        onChange={(event) => {
                          handleImageChange(
                            event.target.files?.[0],
                          );

                          event.currentTarget.value = '';
                        }}
                        className="sr-only"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRemoveImage}
                      className="rounded-lg border border-[#d99595]/15 px-3 py-2 text-xs text-[#d99595]/70 transition-colors hover:bg-[#d99595]/10 hover:text-[#e4aaaa]"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-9 text-center transition-colors hover:border-white/30 hover:bg-white/[0.04]">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    disabled={isSubmitting}
                    onChange={(event) => {
                      handleImageChange(
                        event.target.files?.[0],
                      );

                      event.currentTarget.value = '';
                    }}
                    className="sr-only"
                  />

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="mb-3 h-7 w-7 text-white/30"
                  >
                    <path
                      d="M12 16V5M8 9l4-4 4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>

                  <span className="text-sm text-white/60">
                    Загрузить изображение
                  </span>

                  <span className="mt-2 text-xs text-white/25">
                    JPG, JPEG, PNG или WEBP
                  </span>
                </label>

                {removeImage && category.imageUrl && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d99595]/15 bg-[#d99595]/[0.05] px-4 py-3">
                    <p className="text-xs text-[#e4aaaa]/70">
                      Текущее изображение будет удалено
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setRemoveImage(false)
                      }
                      className="text-xs text-white/50 hover:text-white"
                    >
                      Вернуть
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <input
              type="checkbox"
              checked={isPublished}
              disabled={isSubmitting}
              onChange={(event) => {
                setIsPublished(event.target.checked);
                setError(null);
              }}
              className="mt-0.5 h-4 w-4 accent-white"
            />

            <span>
              <span className="block text-sm text-white/70">
                Категория опубликована
              </span>

              <span className="mt-1 block text-xs leading-relaxed text-white/25">
                Опубликованная категория обязательно
                должна иметь изображение.
              </span>
            </span>
          </label>

          <div
            aria-live="polite"
            className="min-h-5"
          >
            {error && (
              <p className="text-sm text-[#e4aaaa]">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-12 rounded-xl border border-white/10 px-5 text-sm text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              )}

              {isSubmitting
                ? 'Сохранение'
                : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}