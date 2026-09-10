import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import {
  createAdminCategory,
  type CreateAdminCategoryInput,
} from '../api/create-admin-category';
import {
  AdminCategoriesApiError,
  type AdminCategory,
} from '../api/get-admin-categories';

interface CreateAdminCategoryModalProps {
  onClose: () => void;
  onCreated: (category: AdminCategory) => void;
}

const MAX_IMAGE_SIZE = 100 * 1024 * 1024;

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function CreateAdminCategoryModal({
  onClose,
  onCreated,
}: CreateAdminCategoryModalProps) {
  const navigate = useNavigate();

  const [slug, setSlug] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [isPublished, setIsPublished] =
    useState(false);
  const [image, setImage] = useState<File | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  const imagePreviewUrl = useMemo(() => {
    if (!image) {
      return null;
    }

    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

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

  function handleImageChange(
    file: File | undefined,
  ): void {
    setError(null);

    if (!file) {
      setImage(null);
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
        'Заполните slug, русское и английское названия',
      );

      return;
    }

    let parsedSortOrder: number | undefined;

    if (sortOrder.trim() !== '') {
      parsedSortOrder = Number(sortOrder);

      if (
        !Number.isInteger(parsedSortOrder) ||
        parsedSortOrder < 0
      ) {
        setError(
          'Порядок должен быть целым положительным числом или нулём',
        );

        return;
      }
    }

    if (isPublished && !image) {
      setError(
        'Для публикации категории необходимо загрузить изображение',
      );

      return;
    }

    const input: CreateAdminCategoryInput = {
      slug: normalizedSlug,
      nameRu: normalizedNameRu,
      nameEn: normalizedNameEn,
      sortOrder: parsedSortOrder,
      isPublished,
      image: image ?? undefined,
    };

    setError(null);
    setIsSubmitting(true);

    try {
      const category =
        await createAdminCategory(input);

      onCreated(category);
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
          : 'Не удалось создать категорию',
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
        aria-labelledby="create-category-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-[42rem] overflow-y-auto rounded-[1.75rem] border border-white/10 bg-[#141414] shadow-[0_2rem_8rem_rgba(0,0,0,0.65)]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/[0.07] bg-[#141414]/95 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/25">
              Новая запись
            </p>

            <h2
              id="create-category-title"
              className="text-2xl font-medium tracking-[-0.035em]"
            >
              Добавить категорию
            </h2>
          </div>

          <button
            type="button"
            aria-label="Закрыть"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
              Slug *
            </span>

            <input
              autoFocus
              type="text"
              value={slug}
              disabled={isSubmitting}
              placeholder="Например: dining-tables"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => {
                setSlug(
                  event.target.value.toLowerCase(),
                );
                setError(null);
              }}
              className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.055] focus:border-white/25 focus:bg-white/[0.06]"
            />

            <span className="mt-2 block text-xs text-white/25">
              Используется в адресе страницы:
              /products/dining-tables
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Название на русском *
              </span>

              <input
                type="text"
                value={nameRu}
                disabled={isSubmitting}
                placeholder="Обеденные столы"
                onChange={(event) => {
                  setNameRu(event.target.value);
                  setError(null);
                }}
                className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.055] focus:border-white/25 focus:bg-white/[0.06]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Название на английском *
              </span>

              <input
                type="text"
                value={nameEn}
                disabled={isSubmitting}
                placeholder="Dining tables"
                onChange={(event) => {
                  setNameEn(event.target.value);
                  setError(null);
                }}
                className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.055] focus:border-white/25 focus:bg-white/[0.06]"
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
              placeholder="Например: 10"
              onChange={(event) => {
                setSortOrder(event.target.value);
                setError(null);
              }}
              className="h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.055] focus:border-white/25 focus:bg-white/[0.06]"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
              Изображение
            </span>

            {imagePreviewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <img
                  src={imagePreviewUrl}
                  alt="Предпросмотр категории"
                  draggable={false}
                  className="aspect-[16/9] w-full object-cover"
                />

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setImage(null)}
                  className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
                >
                  Удалить
                </button>

                <div className="border-t border-white/[0.07] px-4 py-3">
                  <p className="truncate text-sm text-white/55">
                    {image?.name}
                  </p>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-10 text-center transition-[border-color,background-color] hover:border-white/30 hover:bg-white/[0.04]">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  disabled={isSubmitting}
                  onChange={(event) =>
                    handleImageChange(
                      event.target.files?.[0],
                    )
                  }
                  className="sr-only"
                />

                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.055] text-white/45">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-6 w-6"
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
                </span>

                <span className="text-sm text-white/65">
                  Выберите изображение
                </span>

                <span className="mt-2 text-xs text-white/25">
                  JPG, JPEG, PNG или WEBP, до 100 МБ
                </span>
              </label>
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
                Опубликовать категорию
              </span>

              <span className="mt-1 block text-xs leading-relaxed text-white/25">
                Опубликованная категория будет видна
                посетителям сайта. Для публикации
                обязательно изображение.
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
              className="h-12 rounded-xl border border-white/10 px-5 text-sm text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
                ? 'Создание'
                : 'Создать категорию'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}