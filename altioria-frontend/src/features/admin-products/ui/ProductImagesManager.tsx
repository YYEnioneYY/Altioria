import { useState } from 'react';
import { useNavigate } from 'react-router';

import { DragDropProvider } from '@dnd-kit/react';
import {
  isSortable,
  useSortable,
} from '@dnd-kit/react/sortable';

import {
  deleteAdminProductImage,
} from '../api/delete-admin-product-image';

import {
  AdminProductsApiError,
  type AdminProductImage,
} from '../api/get-admin-products';

import {
  reorderAdminProductImages,
} from '../api/reorder-admin-product-images';

interface ProductImagesManagerProps {
  productId: string;
  productName: string;
  images: AdminProductImage[];
  isPublished: boolean;
  onImagesChange: (
    images: AdminProductImage[],
  ) => void;
}

interface SortableImageProps {
  image: AdminProductImage;
  index: number;
  productName: string;
  isLocked: boolean;
  isPublished: boolean;
  imagesCount: number;
  isConfirmingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

function DragHandleIcon() {
  return (
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
  );
}

function DeleteIcon() {
  return (
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
  );
}

function SortableImage({
  image,
  index,
  productName,
  isLocked,
  isPublished,
  imagesCount,
  isConfirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: SortableImageProps) {
  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id: image.id,
    index,
    disabled: isLocked || imagesCount < 2,
  });

  const cannotDelete =
    isPublished && imagesCount === 1;

  return (
    <article
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border bg-black transition-[border-color,opacity,filter,transform] duration-200 ${
        isDragSource
          ? 'z-30 scale-[1.02] border-white/30 opacity-80 shadow-[0_2rem_3rem_rgba(0,0,0,0.55)]'
          : 'border-white/[0.08]'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image.imageUrl}
          alt={image.altRu ?? productName}
          draggable={false}
          className="h-full w-full object-cover"
        />

        <button
          ref={handleRef}
          type="button"
          disabled={isLocked || imagesCount < 2}
          aria-label={`Переместить изображение, текущая позиция ${index + 1}`}
          title={
            imagesCount < 2
              ? 'Для перестановки нужно несколько изображений'
              : 'Перетащить изображение'
          }
          className="absolute left-3 top-3 z-10 flex h-9 cursor-grab touch-none items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-3 text-xs text-white/70 backdrop-blur-md transition-colors hover:bg-white hover:text-black active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DragHandleIcon />

          <span>#{index + 1}</span>
        </button>

        <button
          type="button"
          disabled={isLocked || cannotDelete}
          aria-label={`Удалить изображение ${index + 1}`}
          title={
            cannotDelete
              ? 'Нельзя удалить единственное изображение опубликованного товара'
              : 'Удалить изображение'
          }
          onClick={onRequestDelete}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white/55 backdrop-blur-md transition-colors hover:bg-[#d99595] hover:text-[#1a0e0e] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <DeleteIcon />
        </button>

        {index === 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white px-2.5 py-1 text-[0.65rem] font-medium text-black">
            Обложка
          </span>
        )}

        {isConfirmingDelete && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-4 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-white">
              Удалить изображение?
            </p>

            <p className="mt-2 text-xs leading-relaxed text-white/35">
              {index === 0 && imagesCount > 1
                ? 'Следующая фотография станет обложкой.'
                : 'Это действие нельзя отменить.'}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onCancelDelete}
                className="h-9 rounded-lg border border-white/10 px-3 text-xs text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={onConfirmDelete}
                className="h-9 rounded-lg bg-[#d99595] px-3 text-xs font-medium text-[#1a0e0e] transition-colors hover:bg-[#e6aaaa]"
              >
                Удалить
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-3 py-2.5">
        <span className="text-xs text-white/30">
          Изображение {index + 1}
        </span>

        <span className="text-[0.65rem] text-white/20">
          Позиция {image.sortOrder}
        </span>
      </div>
    </article>
  );
}

export function ProductImagesManager({
  productId,
  productName,
  images,
  isPublished,
  onImagesChange,
}: ProductImagesManagerProps) {
  const navigate = useNavigate();

  const [isSavingOrder, setIsSavingOrder] =
    useState(false);

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState<string | null>(null);

  const [
    confirmingDeleteId,
    setConfirmingDeleteId,
  ] = useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const isLocked =
    isSavingOrder ||
    deletingImageId !== null ||
    confirmingDeleteId !== null;

  async function saveOrder(
    previousImages: AdminProductImage[],
    reorderedImages: AdminProductImage[],
  ): Promise<void> {
    setIsSavingOrder(true);
    setError(null);

    onImagesChange(reorderedImages);

    try {
      const savedImages =
        await reorderAdminProductImages(
          productId,
          reorderedImages.map(
            (image) => image.id,
          ),
        );

      onImagesChange(savedImages);
    } catch (requestError: unknown) {
      onImagesChange(previousImages);

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
          : 'Не удалось сохранить порядок изображений',
      );
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function removeImage(
    imageId: string,
  ): Promise<void> {
    if (
      deletingImageId !== null ||
      isSavingOrder
    ) {
      return;
    }

    setDeletingImageId(imageId);
    setError(null);

    try {
      await deleteAdminProductImage(
        productId,
        imageId,
      );

      onImagesChange(
        images.filter(
          (image) => image.id !== imageId,
        ),
      );

      setConfirmingDeleteId(null);
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
          : 'Не удалось удалить изображение',
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  if (images.length === 0) {
    return (
      <div className="mb-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
        <p className="text-sm text-white/35">
          У товара пока нет сохранённых фотографий
        </p>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-white/30">
            Текущие фотографии
          </p>

          <p className="mt-1 text-xs text-white/20">
            Перетащите фотографию за кнопку с точками
          </p>
        </div>

        {isSavingOrder && (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/45">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />

            Сохранение порядка
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-[#d99595]/20 bg-[#d99595]/[0.06] px-4 py-3"
        >
          <p className="text-sm text-[#e4aaaa]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-xs text-white/45 transition-colors hover:text-white"
          >
            Закрыть
          </button>
        </div>
      )}

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled || isLocked) {
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

          const previousImages = [...images];
          const reorderedImages = [...images];

          const [movedImage] =
            reorderedImages.splice(
              initialIndex,
              1,
            );

          if (!movedImage) {
            return;
          }

          reorderedImages.splice(
            index,
            0,
            movedImage,
          );

          void saveOrder(
            previousImages,
            reorderedImages,
          );
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => (
            <SortableImage
              key={image.id}
              image={image}
              index={index}
              productName={productName}
              isLocked={isLocked}
              isPublished={isPublished}
              imagesCount={images.length}
              isConfirmingDelete={
                confirmingDeleteId === image.id
              }
              onRequestDelete={() => {
                setError(null);

                setConfirmingDeleteId(
                  image.id,
                );
              }}
              onCancelDelete={() =>
                setConfirmingDeleteId(null)
              }
              onConfirmDelete={() =>
                void removeImage(image.id)
              }
            />
          ))}
        </div>
      </DragDropProvider>

      <p className="mt-3 text-xs leading-relaxed text-white/20">
        Изменение порядка и удаление сохраняются
        сразу, независимо от кнопки «Сохранить
        изменения» внизу формы.
      </p>
    </div>
  );
}