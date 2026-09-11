import {
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';

import {
  deleteAdminProduct,
} from '../api/delete-admin-product';

import {
  AdminProductsApiError,
  type AdminProduct,
} from '../api/get-admin-products';

interface DeleteAdminProductModalProps {
  product: AdminProduct;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteAdminProductModal({
  product,
  onClose,
  onDeleted,
}: DeleteAdminProductModalProps) {
  const navigate = useNavigate();

  const [isConfirmed, setIsConfirmed] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
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
    if (!isConfirmed || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteAdminProduct(product.id);
      onDeleted();
    } catch (requestError: unknown) {
      if (
        requestError instanceof
          AdminProductsApiError &&
        requestError.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });

        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не удалось удалить товар',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Закрыть окно"
        disabled={isDeleting}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-[1.75rem] border border-[#d99595]/15 bg-[#141414] shadow-[0_2rem_8rem_rgba(0,0,0,0.7)]"
      >
        <header className="flex items-start justify-between gap-5 border-b border-white/[0.07] px-6 py-5 sm:px-7">
          <div>
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#d99595]/60">
              Опасное действие
            </p>

            <h2
              id="delete-product-title"
              className="text-2xl font-medium tracking-[-0.035em]"
            >
              Удалить товар?
            </h2>
          </div>

          <button
            type="button"
            aria-label="Закрыть"
            disabled={isDeleting}
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

        <div className="px-6 py-6 sm:px-7">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-white/25">
              Удаляемый товар
            </p>

            <p className="mt-2 text-lg font-medium text-white/80">
              {product.nameRu}
            </p>

            <p className="mt-1 text-sm text-white/30">
              {product.nameEn}
            </p>

            <code className="mt-3 block text-xs text-white/25">
              /{product.slug}
            </code>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
              <p className="text-lg font-medium">
                {product.images.length}
              </p>

              <p className="mt-1 text-[0.65rem] text-white/30">
                фотографий
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
              <p className="text-lg font-medium">
                {product.files.length}
              </p>

              <p className="mt-1 text-[0.65rem] text-white/30">
                файлов
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
              <p className="text-lg font-medium">
                {product.variantsCount}
              </p>

              <p className="mt-1 text-[0.65rem] text-white/30">
                исполнений
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#d99595]/15 bg-[#d99595]/[0.055] p-4">
            <p className="text-sm leading-relaxed text-[#e4aaaa]/80">
              Товар будет удалён вместе со всеми его
              фотографиями, файлами и дополнительными
              исполнениями. Восстановить его будет
              невозможно.
            </p>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.08] p-4">
            <input
              type="checkbox"
              checked={isConfirmed}
              disabled={isDeleting}
              onChange={(event) => {
                setIsConfirmed(
                  event.target.checked,
                );
                setError(null);
              }}
              className="mt-0.5 h-4 w-4 accent-[#d99595]"
            />

            <span className="text-sm leading-relaxed text-white/55">
              Я понимаю, что товар и связанные с ним
              данные будут удалены без возможности
              восстановления
            </span>
          </label>

          <div
            aria-live="polite"
            className="mt-4 min-h-5"
          >
            {error && (
              <p className="text-sm text-[#e4aaaa]">
                {error}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="h-11 rounded-xl border border-white/10 px-5 text-sm text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
            >
              Отмена
            </button>

            <button
              type="button"
              disabled={
                !isConfirmed || isDeleting
              }
              onClick={() => void handleDelete()}
              className="flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-[#d99595] px-5 text-sm font-medium text-[#1a0e0e] transition-colors hover:bg-[#e6aaaa] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isDeleting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              )}

              {isDeleting
                ? 'Удаление...'
                : 'Удалить товар'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}