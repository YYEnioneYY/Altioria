import {
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import { deleteAdminCategory } from '../api/delete-admin-category';
import {
  AdminCategoriesApiError,
  type AdminCategory,
} from '../api/get-admin-categories';

interface DeleteAdminCategoryModalProps {
  category: AdminCategory;
  onClose: () => void;
  onDeleted: (categoryId: string) => void;
}

export function DeleteAdminCategoryModal({
  category,
  onClose,
  onDeleted,
}: DeleteAdminCategoryModalProps) {
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (
        event.key === 'Escape' &&
        !isDeleting
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
  }, [isDeleting, onClose]);

  async function handleDelete(): Promise<void> {
    if (isDeleting) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteAdminCategory(category.id);

      onDeleted(category.id);
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
          : 'Не удалось удалить категорию',
      );

      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Закрыть окно"
        disabled={isDeleting}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        aria-describedby="delete-category-description"
        className="relative z-10 w-full max-w-[29rem] rounded-[1.75rem] border border-white/10 bg-[#151515] p-6 shadow-[0_2rem_8rem_rgba(0,0,0,0.7)] sm:p-8"
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d99595]/15 bg-[#d99595]/10 text-[#e4aaaa]">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6"
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
        </div>

        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#d99595]/50">
          Удаление
        </p>

        <h2
          id="delete-category-title"
          className="text-2xl font-medium tracking-[-0.035em]"
        >
          Удалить категорию?
        </h2>

        <p
          id="delete-category-description"
          className="mt-4 text-sm leading-relaxed text-white/40"
        >
          Категория{' '}
          <strong className="font-medium text-white/75">
            «{category.nameRu}»
          </strong>{' '}
          будет удалена из каталога. Это действие
          нельзя отменить.
        </p>

        {category.isPublished && (
          <div className="mt-5 rounded-xl border border-[#d99595]/15 bg-[#d99595]/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-[#e4aaaa]/70">
              Сейчас категория опубликована и видна
              посетителям сайта.
            </p>
          </div>
        )}

        <div
          aria-live="polite"
          className="mt-4 min-h-5"
        >
          {error && (
            <p
              role="alert"
              className="text-sm leading-relaxed text-[#e4aaaa]"
            >
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="h-12 rounded-xl border border-white/10 px-5 text-sm text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Отмена
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d99595] px-5 text-sm font-medium text-[#1a0e0e] transition-colors hover:bg-[#e4aaaa] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isDeleting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            )}

            {isDeleting
              ? 'Удаление'
              : 'Удалить категорию'}
          </button>
        </div>
      </section>
    </div>
  );
}