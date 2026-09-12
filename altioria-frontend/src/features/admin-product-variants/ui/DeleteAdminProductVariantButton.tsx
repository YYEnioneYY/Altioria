import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { AdminProductVariantsApiError } from '../api/get-admin-product-variants';
import { deleteAdminProductVariant } from '../api/delete-admin-product-variant';

interface DeleteAdminProductVariantButtonProps {
  productId: string;
  variantId: string;
  variantName: string;
}

export function DeleteAdminProductVariantButton({
  productId,
  variantId,
  variantName,
}: DeleteAdminProductVariantButtonProps) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        setIsOpen(false);
        setDeleteError(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDeleting, isOpen]);

  const closeDialog = () => {
    if (isDeleting) {
      return;
    }

    setIsOpen(false);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAdminProductVariant(productId, variantId);

      navigate(`/admin/products/${productId}`, {
        replace: true,
      });
    } catch (error: unknown) {
      if (
        error instanceof AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });
        return;
      }

      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить исполнение',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.045] px-4 text-sm text-[#e4aaaa]/75 transition-[border-color,background-color,color] duration-300 hover:border-[#d99595]/35 hover:bg-[#d99595]/10 hover:text-[#efb4b4]"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path
            d="M5 7h14M9 7V4.5h6V7M7.5 7l.7 12h7.6l.7-12M10 10.5v5M14 10.5v5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        Удалить
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-variant-title"
            aria-describedby="delete-variant-description"
            className="w-full max-w-[31rem] rounded-[1.75rem] border border-white/10 bg-[#151515] p-6 shadow-[0_2rem_6rem_rgba(0,0,0,0.65)] sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d99595]/20 bg-[#d99595]/[0.07] text-[#e4aaaa]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
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

            <h2
              id="delete-variant-title"
              className="mt-5 text-2xl font-medium tracking-[-0.035em]"
            >
              Удалить исполнение?
            </h2>

            <p
              id="delete-variant-description"
              className="mt-3 text-sm leading-relaxed text-white/40"
            >
              Исполнение «{variantName}», его собственные изображения и файлы
              будут удалены без возможности восстановления. Основной товар не
              пострадает.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.06] px-4 py-3 text-sm text-[#e4aaaa]"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeDialog}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                Отмена
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d99595] px-5 text-sm font-medium text-[#1b0d0d] transition-colors hover:bg-[#e7aaaa] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isDeleting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                )}

                {isDeleting ? 'Удаление...' : 'Удалить исполнение'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}