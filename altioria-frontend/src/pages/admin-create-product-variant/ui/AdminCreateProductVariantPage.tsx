import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import { DragDropProvider } from '@dnd-kit/react';

import {
  isSortable,
  useSortable,
} from '@dnd-kit/react/sortable';

import {
  AdminProductVariantsApiError,
  createAdminProductVariant,
  deleteAdminProductVariantFile,
  deleteAdminProductVariantImage,
  getAdminProductVariant,
  reorderAdminProductVariantFiles,
  reorderAdminProductVariantImages,
  updateAdminProductVariant,
  updateAdminProductVariantFile,
  type AdminProductVariant,
} from '../../../features/admin-product-variants';

const MAX_IMAGES = 15;
const MAX_FILES = 10;

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type PriceMode = "INHERIT" | "FIXED" | "ON_REQUEST";

type VariantNameMode =
  | "same"
  | "localized";

interface VariantForm {
  slug: string;
  nameRu: string;
  nameEn: string;

  descriptionRu: string;
  descriptionEn: string;
  materialsRu: string;
  materialsEn: string;

  heightMm: string;
  widthMm: string;
  depthMm: string;

  priceMode: PriceMode;
  priceAmount: string;
  priceCurrency: string;

  sortOrder: string;
  isPublished: boolean;

  images: File[];
  files: File[];
}

const initialForm: VariantForm = {
  slug: "",
  nameRu: "",
  nameEn: "",

  descriptionRu: "",
  descriptionEn: "",
  materialsRu: "",
  materialsEn: "",

  heightMm: "",
  widthMm: "",
  depthMm: "",

  priceMode: "INHERIT",
  priceAmount: "",
  priceCurrency: "RUB",

  sortOrder: "0",
  isPublished: false,

  images: [],
  files: [],
};

const fieldClassName =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition-[border-color,background-color] placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.055]";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

function TextField({
  label,
  hint,
  required = false,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/65">
        {label}

        {required && (
          <span aria-hidden="true" className="ml-1 text-[#d99595]">
            *
          </span>
        )}
      </span>

      <input
        {...props}
        required={required}
        className={`${fieldClassName} ${className}`}
      />

      {hint && (
        <span className="mt-2 block text-xs leading-relaxed text-white/25">
          {hint}
        </span>
      )}
    </label>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

function TextAreaField({
  label,
  hint,
  className = "",
  ...props
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/65">{label}</span>

      <textarea
        {...props}
        className={`min-h-32 w-full resize-y rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-white outline-none transition-[border-color,background-color] placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.055] ${className}`}
      />

      {hint && (
        <span className="mt-2 block text-xs leading-relaxed text-white/25">
          {hint}
        </span>
      )}
    </label>
  );
}

function ImagePreview({
  file,
  index,
  total,
  isFirstOverall,
  onMove,
  onRemove,
}: {
  file: File;
  index: number;
  total: number;
  isFirstOverall: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#151515]">
        {previewUrl && (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        )}

        {isFirstOverall && (
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/65 px-3 py-1 text-[0.68rem] text-white/70 backdrop-blur-md">
            Первое изображение
          </span>
        )}

        <button
          type="button"
          aria-label="Удалить изображение"
          onClick={() => onRemove(index)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/65 text-white/65 backdrop-blur-md transition-colors hover:bg-[#d99595] hover:text-black"
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 p-3">
        <p className="min-w-0 truncate text-xs text-white/40">{file.name}</p>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={index === 0}
            aria-label="Переместить левее"
            onClick={() => onMove(index, -1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/45 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-20"
          >
            ←
          </button>

          <button
            type="button"
            disabled={index === total - 1}
            aria-label="Переместить правее"
            onClick={() => onMove(index, 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/45 transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-20"
          >
            →
          </button>
        </div>
      </div>
    </article>
  );
}

type ExistingVariantImage =
  AdminProductVariant['images'][number];

interface SortableExistingVariantImageProps {
  image: ExistingVariantImage;
  index: number;
  variantName: string;
  isReordering: boolean;
  isSaving: boolean;
  onDelete: (image: ExistingVariantImage) => void;
}

function SortableExistingVariantImage({
  image,
  index,
  variantName,
  isReordering,
  isSaving,
  onDelete,
}: SortableExistingVariantImageProps) {
  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id: image.id,
    index,
    disabled: !isReordering || isSaving,
  });

  return (
    <figure
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border bg-[#151515] transition-[border-color,opacity,transform] duration-200 ${
        isDragSource
          ? 'z-20 border-white/30 opacity-70'
          : 'border-white/[0.08]'
      }`}
    >
      <img
        src={image.imageUrl}
        alt={image.altRu ?? variantName}
        draggable={false}
        className="aspect-[4/3] w-full object-cover"
      />

      {index === 0 && (
        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[0.65rem] text-white/70 backdrop-blur-md">
          Обложка
        </span>
      )}

      {isReordering ? (
        <>
          <button
            ref={handleRef}
            type="button"
            disabled={isSaving}
            aria-label="Переместить изображение"
            title="Зажмите и перетащите"
            className="absolute right-2.5 top-2.5 flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full border border-white/15 bg-black/75 text-white/75 shadow-lg backdrop-blur-md transition-colors hover:bg-white hover:text-black active:cursor-grabbing disabled:cursor-wait disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <circle
                cx="8"
                cy="7"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="16"
                cy="7"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="8"
                cy="12"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="16"
                cy="12"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="8"
                cy="17"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="16"
                cy="17"
                r="1"
                fill="currentColor"
              />
            </svg>
          </button>

          <span className="absolute bottom-2.5 right-2.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[0.65rem] text-white/70 backdrop-blur-md">
            Позиция {index + 1}
          </span>
        </>
      ) : (
        <button
          type="button"
          aria-label="Удалить изображение"
          title="Удалить изображение"
          onClick={() => onDelete(image)}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/60 backdrop-blur-md transition-colors hover:bg-[#d99595] hover:text-[#1a0e0e]"
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
      )}
    </figure>
  );
}

type ExistingVariantFile =
  AdminProductVariant['files'][number];

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(
      1,
      Math.round(sizeBytes / 1024),
    )} КБ`;
  }

  return `${(
    sizeBytes /
    1024 /
    1024
  ).toFixed(1)} МБ`;
}

interface SortableExistingVariantFileProps {
  file: ExistingVariantFile;
  index: number;
  isReordering: boolean;
  isSaving: boolean;
  onEdit: (file: ExistingVariantFile) => void;
  onDelete: (file: ExistingVariantFile) => void;
}

function SortableExistingVariantFile({
  file,
  index,
  isReordering,
  isSaving,
  onEdit,
  onDelete,
}: SortableExistingVariantFileProps) {
  const {
    ref,
    handleRef,
    isDragSource,
  } = useSortable({
    id: file.id,
    index,
    disabled: !isReordering || isSaving,
  });

  return (
    <article
      ref={ref}
      className={`relative rounded-2xl border bg-white/[0.025] transition-[border-color,background-color,opacity,transform] duration-200 ${
        isDragSource
          ? 'z-20 border-white/30 bg-white/[0.05] opacity-70'
          : 'border-white/[0.07]'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {isReordering && (
          <button
            ref={handleRef}
            type="button"
            disabled={isSaving}
            aria-label={`Переместить файл ${file.originalName}`}
            title="Зажмите и перетащите"
            className="flex h-10 w-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl border border-white/10 bg-black/25 text-white/50 transition-colors hover:bg-white hover:text-black active:cursor-grabbing disabled:cursor-wait disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <circle
                cx="8"
                cy="7"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="16"
                cy="7"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="8"
                cy="12"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="16"
                cy="12"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="8"
                cy="17"
                r="1"
                fill="currentColor"
              />
              <circle
                cx="16"
                cy="17"
                r="1"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-black/20 text-[0.7rem] font-medium text-white/45">
          {file.type === 'PDF' ? 'PDF' : '3D'}
        </div>

        <div className="min-w-0 flex-1">
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noreferrer"
            title="Открыть файл"
            className="block truncate text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            {file.labelRu ?? file.originalName}
          </a>

          <p className="mt-1 truncate text-xs text-white/25">
            {file.originalName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.68rem] text-white/20">
            <span>
              {formatFileSize(file.sizeBytes)}
            </span>

            <span>·</span>

            <span>
              Позиция {index + 1}
            </span>

            {file.labelEn && (
              <>
                <span>·</span>

                <span className="max-w-48 truncate">
                  {file.labelEn}
                </span>
              </>
            )}
          </div>
        </div>

        {!isReordering && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={`Изменить подписи файла ${file.originalName}`}
              title="Изменить подписи"
              onClick={() => onEdit(file)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition-colors hover:bg-white hover:text-black"
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
              aria-label={`Удалить файл ${file.originalName}`}
              title="Удалить файл"
              onClick={() => onDelete(file)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/35 transition-colors hover:border-[#d99595]/25 hover:bg-[#d99595]/15 hover:text-[#e4aaaa]"
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
      </div>
    </article>
  );
}

export function AdminCreateProductVariantPage() {
  const { productId, variantId } = useParams<{
    productId: string;
    variantId: string;
  }>();

  const isEditing = variantId !== undefined;

  const navigate = useNavigate();

  const [form, setForm] = useState<VariantForm>(initialForm);

  const [nameMode, setNameMode] =
    useState<VariantNameMode>("same");

  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingVariant, setExistingVariant] =
    useState<AdminProductVariant | null>(null);

  const [isLoadingVariant, setIsLoadingVariant] = useState(isEditing);

  const [loadVariantError, setLoadVariantError] = useState<string | null>(null);

  const [isReorderingImages, setIsReorderingImages] =
    useState(false);
  
  const [isSavingImageOrder, setIsSavingImageOrder] =
    useState(false);
  
  const [imageOrderSnapshot, setImageOrderSnapshot] =
    useState<ExistingVariantImage[] | null>(null);
  
  const [imageToDelete, setImageToDelete] =
    useState<ExistingVariantImage | null>(null);
  
  const [deletingImageId, setDeletingImageId] =
    useState<string | null>(null);
  
  const [imageActionError, setImageActionError] =
    useState<string | null>(null);

  const [isReorderingFiles, setIsReorderingFiles] =
    useState(false);
  
  const [isSavingFileOrder, setIsSavingFileOrder] =
    useState(false);
  
  const [fileOrderSnapshot, setFileOrderSnapshot] =
    useState<ExistingVariantFile[] | null>(null);
  
  const [editingFile, setEditingFile] =
    useState<ExistingVariantFile | null>(null);
  
  const [fileLabelRu, setFileLabelRu] =
    useState('');
  
  const [fileLabelEn, setFileLabelEn] =
    useState('');
  
  const [isSavingFileLabels, setIsSavingFileLabels] =
    useState(false);
  
  const [fileToDelete, setFileToDelete] =
    useState<ExistingVariantFile | null>(null);
  
  const [deletingFileId, setDeletingFileId] =
    useState<string | null>(null);
  
  const [fileActionError, setFileActionError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!productId || !variantId) {
      setExistingVariant(null);
      setIsLoadingVariant(false);
      setLoadVariantError(null);
      return;
    }

    let isActive = true;

    const loadVariant = async () => {
      setIsLoadingVariant(true);
      setLoadVariantError(null);

      try {
        const loadedVariant = await getAdminProductVariant(
          productId,
          variantId,
        );

        if (!isActive) {
          return;
        }

        setExistingVariant(loadedVariant);
        setNameMode(
          loadedVariant.nameRu ===
            loadedVariant.nameEn
            ? "same"
            : "localized",
        );
        setIsReorderingFiles(false);
        setFileOrderSnapshot(null);
        setEditingFile(null);
        setFileToDelete(null);
        setFileActionError(null);
        setIsReorderingImages(false);
        setImageOrderSnapshot(null);
        setImageToDelete(null);
        setImageActionError(null);

        setForm({
          slug: loadedVariant.slug,
          nameRu: loadedVariant.nameRu,
          nameEn: loadedVariant.nameEn,

          descriptionRu: loadedVariant.descriptionRu ?? "",

          descriptionEn: loadedVariant.descriptionEn ?? "",

          materialsRu: loadedVariant.materialsRu ?? "",

          materialsEn: loadedVariant.materialsEn ?? "",

          heightMm: loadedVariant.heightMm?.toString() ?? "",

          widthMm: loadedVariant.widthMm?.toString() ?? "",

          depthMm: loadedVariant.depthMm?.toString() ?? "",

          priceMode: loadedVariant.priceType ?? "INHERIT",

          priceAmount: loadedVariant.priceAmount ?? "",

          priceCurrency: loadedVariant.priceCurrency ?? "RUB",

          sortOrder: loadedVariant.sortOrder.toString(),

          isPublished: loadedVariant.isPublished,

          // Сюда кладём только новые файлы.
          images: [],
          files: [],
        });
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        if (
          error instanceof AdminProductVariantsApiError &&
          error.status === 401
        ) {
          navigate("/admin/login", {
            replace: true,
          });
          return;
        }

        setLoadVariantError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить исполнение",
        );
      } finally {
        if (isActive) {
          setIsLoadingVariant(false);
        }
      }
    };

    void loadVariant();

    return () => {
      isActive = false;
    };
  }, [navigate, productId, variantId]);

  if (!productId) {
    return <Navigate to="/admin/products" replace />;
  }

  const existingImagesCount = existingVariant?.images.length ?? 0;

  const existingFilesCount = existingVariant?.files.length ?? 0;

  const totalImagesCount = existingImagesCount + form.images.length;

  const totalFilesCount = existingFilesCount + form.files.length;

  const updateField = <Key extends keyof VariantForm>(
    key: Key,
    value: VariantForm[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setFormError(null);
  };

  const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImages = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (selectedImages.length === 0) {
      return;
    }

    const invalidImage = selectedImages.find(
      (image) => image.size > MAX_IMAGE_SIZE,
    );

    if (invalidImage) {
      setFormError(`Изображение «${invalidImage.name}» превышает 20 МБ`);
      return;
    }

    if (
      existingImagesCount + form.images.length + selectedImages.length >
      MAX_IMAGES
    ) {
      setFormError(
        `У исполнения может быть не больше ${MAX_IMAGES} собственных изображений`,
      );
      return;
    }

    updateField("images", [...form.images, ...selectedImages]);
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);

    if (invalidFile) {
      setFormError(`Файл «${invalidFile.name}» превышает 50 МБ`);
      return;
    }

    if (
      existingFilesCount + form.files.length + selectedFiles.length >
      MAX_FILES
    ) {
      setFormError(`У исполнения может быть не больше ${MAX_FILES} файлов`);
      return;
    }

    updateField("files", [...form.files, ...selectedFiles]);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= form.images.length) {
      return;
    }

    const reorderedImages = [...form.images];

    const [image] = reorderedImages.splice(index, 1);

    if (!image) {
      return;
    }

    reorderedImages.splice(targetIndex, 0, image);

    updateField("images", reorderedImages);
  };

  const startImageReordering = () => {
    if (
      !existingVariant ||
      existingVariant.images.length < 2
    ) {
      return;
    }
  
    setImageOrderSnapshot([
      ...existingVariant.images,
    ]);
  
    setImageActionError(null);
    setIsReorderingImages(true);
  };
  
  const cancelImageReordering = () => {
    if (isSavingImageOrder) {
      return;
    }
  
    if (imageOrderSnapshot) {
      setExistingVariant((current) =>
        current
          ? {
              ...current,
              images: imageOrderSnapshot,
            }
          : current,
      );
    }
  
    setImageOrderSnapshot(null);
    setImageActionError(null);
    setIsReorderingImages(false);
  };
  
  const saveImageOrder = async () => {
    if (
      !variantId ||
      !existingVariant
    ) {
      return;
    }
  
    setIsSavingImageOrder(true);
    setImageActionError(null);
  
    try {
      const images =
        await reorderAdminProductVariantImages(
          productId,
          variantId,
          existingVariant.images.map(
            (image) => image.id,
          ),
        );
  
      setExistingVariant((current) =>
        current
          ? {
              ...current,
              images,
            }
          : current,
      );
  
      setImageOrderSnapshot(null);
      setIsReorderingImages(false);
    } catch (error: unknown) {
      if (
        error instanceof
          AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });
  
        return;
      }
  
      setImageActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить порядок изображений',
      );
    } finally {
      setIsSavingImageOrder(false);
    }
  };
  
  const removeExistingImage = async () => {
    if (
      !variantId ||
      !imageToDelete
    ) {
      return;
    }
  
    setDeletingImageId(imageToDelete.id);
    setImageActionError(null);
  
    try {
      await deleteAdminProductVariantImage(
        productId,
        variantId,
        imageToDelete.id,
      );
  
      setExistingVariant((current) => {
        if (!current) {
          return current;
        }
  
        const images = current.images.filter(
          (image) =>
            image.id !== imageToDelete.id,
        );
  
        return {
          ...current,
          images,
          usesProductImages:
            images.length === 0,
        };
      });
  
      setImageToDelete(null);
      setImageOrderSnapshot(null);
      setIsReorderingImages(false);
    } catch (error: unknown) {
      if (
        error instanceof
          AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });
  
        return;
      }
  
      setImageActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить изображение',
      );
  
      setImageToDelete(null);
    } finally {
      setDeletingImageId(null);
    }
  };

  const startFileReordering = () => {
    if (
      !existingVariant ||
      existingVariant.files.length < 2
    ) {
      return;
    }
  
    setFileOrderSnapshot([
      ...existingVariant.files,
    ]);
  
    setFileActionError(null);
    setIsReorderingFiles(true);
  };
  
  const cancelFileReordering = () => {
    if (isSavingFileOrder) {
      return;
    }
  
    if (fileOrderSnapshot) {
      setExistingVariant((current) =>
        current
          ? {
              ...current,
              files: fileOrderSnapshot,
            }
          : current,
      );
    }
  
    setFileOrderSnapshot(null);
    setFileActionError(null);
    setIsReorderingFiles(false);
  };
  
  const saveFileOrder = async () => {
    if (
      !variantId ||
      !existingVariant
    ) {
      return;
    }
  
    setIsSavingFileOrder(true);
    setFileActionError(null);
  
    try {
      const files =
        await reorderAdminProductVariantFiles(
          productId,
          variantId,
          existingVariant.files.map(
            (file) => file.id,
          ),
        );
  
      setExistingVariant((current) =>
        current
          ? {
              ...current,
              files,
            }
          : current,
      );
  
      setFileOrderSnapshot(null);
      setIsReorderingFiles(false);
    } catch (error: unknown) {
      if (
        error instanceof
          AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });
  
        return;
      }
  
      setFileActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить порядок файлов',
      );
    } finally {
      setIsSavingFileOrder(false);
    }
  };
  
  const openFileEditor = (
    file: ExistingVariantFile,
  ) => {
    setEditingFile(file);
    setFileLabelRu(file.labelRu ?? '');
    setFileLabelEn(file.labelEn ?? '');
    setFileActionError(null);
  };
  
  const saveFileLabels = async () => {
    if (
      !variantId ||
      !editingFile
    ) {
      return;
    }
  
    setIsSavingFileLabels(true);
    setFileActionError(null);
  
    try {
      const updatedFile =
        await updateAdminProductVariantFile(
          productId,
          variantId,
          editingFile.id,
          {
            labelRu:
              fileLabelRu.trim() || null,
  
            labelEn:
              fileLabelEn.trim() || null,
          },
        );
  
      setExistingVariant((current) =>
        current
          ? {
              ...current,
              files: current.files.map(
                (file) =>
                  file.id === updatedFile.id
                    ? updatedFile
                    : file,
              ),
            }
          : current,
      );
  
      setEditingFile(null);
    } catch (error: unknown) {
      if (
        error instanceof
          AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });
  
        return;
      }
  
      setFileActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось изменить подписи файла',
      );
    } finally {
      setIsSavingFileLabels(false);
    }
  };
  
  const removeExistingFile = async () => {
    if (
      !variantId ||
      !fileToDelete
    ) {
      return;
    }
  
    setDeletingFileId(fileToDelete.id);
    setFileActionError(null);
  
    try {
      await deleteAdminProductVariantFile(
        productId,
        variantId,
        fileToDelete.id,
      );
  
      setExistingVariant((current) =>
        current
          ? {
              ...current,
              files: current.files.filter(
                (file) =>
                  file.id !== fileToDelete.id,
              ),
            }
          : current,
      );
  
      setFileToDelete(null);
      setFileOrderSnapshot(null);
      setIsReorderingFiles(false);
    } catch (error: unknown) {
      if (
        error instanceof
          AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate('/admin/login', {
          replace: true,
        });
  
        return;
      }
  
      setFileActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить файл',
      );
  
      setFileToDelete(null);
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedNameRu =
      form.nameRu.trim();

    const normalizedNameEn =
      nameMode === "same"
        ? normalizedNameRu
        : form.nameEn.trim();

    if (
      !form.slug.trim() ||
      !normalizedNameRu ||
      !normalizedNameEn
    ) {
      setFormError(
        nameMode === "same"
          ? "Заполните slug и название исполнения"
          : "Заполните slug и названия на двух языках",
      );

      return;
    }

    if (
      form.priceMode === "FIXED" &&
      (!form.priceAmount.trim() || !form.priceCurrency.trim())
    ) {
      setFormError("Для фиксированной стоимости укажите сумму и валюту");
      return;
    }

    if (form.priceMode === "FIXED" && form.priceCurrency.trim().length !== 3) {
      setFormError("Код валюты должен состоять из трёх символов, например RUB");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedVariant =
        isEditing && variantId
          ? await updateAdminProductVariant(productId, variantId, {
              slug: form.slug,
              nameRu: normalizedNameRu,
              nameEn: normalizedNameEn,

              descriptionRu: form.descriptionRu.trim() || null,

              descriptionEn: form.descriptionEn.trim() || null,

              materialsRu: form.materialsRu.trim() || null,

              materialsEn: form.materialsEn.trim() || null,

              heightMm:
                form.heightMm.trim() !== "" ? Number(form.heightMm) : null,

              widthMm: form.widthMm.trim() !== "" ? Number(form.widthMm) : null,

              depthMm: form.depthMm.trim() !== "" ? Number(form.depthMm) : null,

              priceType: form.priceMode === "INHERIT" ? null : form.priceMode,

              priceAmount:
                form.priceMode === "FIXED" ? Number(form.priceAmount) : null,

              priceCurrency:
                form.priceMode === "FIXED" ? form.priceCurrency : null,

              sortOrder: Number(form.sortOrder),

              isPublished: form.isPublished,

              images: form.images,
              files: form.files,
            })
          : await createAdminProductVariant(productId, {
              slug: form.slug,
              nameRu: normalizedNameRu,
              nameEn: normalizedNameEn,

              descriptionRu: form.descriptionRu,
              descriptionEn: form.descriptionEn,
              materialsRu: form.materialsRu,
              materialsEn: form.materialsEn,

              heightMm: form.heightMm,
              widthMm: form.widthMm,
              depthMm: form.depthMm,

              priceType:
                form.priceMode === "INHERIT" ? undefined : form.priceMode,

              priceAmount:
                form.priceMode === "FIXED" ? form.priceAmount : undefined,

              priceCurrency:
                form.priceMode === "FIXED" ? form.priceCurrency : undefined,

              sortOrder: form.sortOrder,
              isPublished: form.isPublished,

              images: form.images,
              files: form.files,
            });

      navigate(`/admin/products/${productId}/variants/${savedVariant.id}`, {
        replace: true,
      });
    } catch (error: unknown) {
      if (
        error instanceof AdminProductVariantsApiError &&
        error.status === 401
      ) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      setFormError(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Не удалось изменить исполнение"
            : "Не удалось создать исполнение",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVariant) {
    return (
      <div className="mx-auto w-full max-w-[92rem] animate-pulse px-5 pb-20 pt-8 sm:px-8 lg:px-10">
        <div className="h-4 w-40 rounded bg-white/[0.06]" />

        <div className="mt-8 h-16 max-w-xl rounded-2xl bg-white/[0.06]" />

        <div className="mt-10 space-y-6">
          <div className="h-56 rounded-[1.75rem] bg-white/[0.04]" />
          <div className="h-72 rounded-[1.75rem] bg-white/[0.04]" />
          <div className="h-56 rounded-[1.75rem] bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (isEditing && (loadVariantError || !existingVariant)) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[92rem] items-center justify-center px-5">
        <div className="max-w-lg rounded-[1.75rem] border border-[#d99595]/20 bg-[#211515] p-7 text-center">
          <p className="text-sm text-[#e4aaaa]">
            {loadVariantError ?? "Исполнение не найдено"}
          </p>

          <Link
            to={`/admin/products/${productId}`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black"
          >
            Вернуться к товару
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[92rem] px-5 pb-20 pt-8 sm:px-8 lg:px-10">
      <header className="mb-10">
        <Link
          to={
            isEditing && variantId
              ? `/admin/products/${productId}/variants/${variantId}`
              : `/admin/products/${productId}`
          }
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span>

          {isEditing ? "Вернуться к исполнению" : "Вернуться к товару"}
        </Link>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
          Дополнительное исполнение
        </p>

        <h1 className="max-w-[55rem] text-[clamp(2.4rem,5vw,4.4rem)] font-medium leading-[0.94] tracking-[-0.05em]">
          {isEditing ? "Изменение исполнения" : "Новое исполнение"}
        </h1>

        <p className="mt-5 max-w-[44rem] text-sm leading-relaxed text-white/35">
          {isEditing
            ? "Измените характеристики исполнения или добавьте новые изображения и файлы. Пустое наследуемое поле вернёт значение основного товара."
            : "Заполните только отличия от основного товара. Описание, материалы, размеры, цена и изображения могут наследоваться."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Основная информация
            </p>

            <h2 className="mt-2 text-xl font-medium">Название исполнения</h2>
          </div>

          <div className="mb-5">
            <span className="mb-2 block text-sm text-white/65">
              Как заполнить название
            </span>
                  
            <div
              role="group"
              aria-label="Способ заполнения названия исполнения"
              className="grid w-full max-w-[34rem] grid-cols-2 rounded-xl border border-white/10 bg-black/20 p-1"
            >
              <button
                type="button"
                aria-pressed={
                  nameMode === "same"
                }
                disabled={isSubmitting}
                onClick={() => {
                  setNameMode("same");
                  setFormError(null);
                }}
                className={`min-h-10 rounded-lg px-3 text-sm transition-[background-color,color,box-shadow] duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                  nameMode === "same"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Одно название
              </button>
              
              <button
                type="button"
                aria-pressed={
                  nameMode === "localized"
                }
                disabled={isSubmitting}
                onClick={() => {
                  setNameMode("localized");
                  setFormError(null);
                }}
                className={`min-h-10 rounded-lg px-3 text-sm transition-[background-color,color,box-shadow] duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
                  nameMode === "localized"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Русский + English
              </button>
            </div>
              
            <p className="mt-2 text-xs leading-relaxed text-white/25">
              {nameMode === "same"
                ? "Название исполнения будет одинаковым в обеих версиях сайта."
                : "Укажите отдельное название для каждой версии сайта."}
            </p>
          </div>
              
          <div
            className={`grid gap-5 ${
              nameMode === "same"
                ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                : "lg:grid-cols-3"
            }`}
          >
            <TextField
              label="Slug"
              required
              value={form.slug}
              placeholder="dark-oak"
              onChange={(event) =>
                updateField(
                  "slug",
                  event.target.value,
                )
              }
              hint="Уникальный адрес внутри товара"
            />
          
            {nameMode === "same" ? (
              <TextField
                label="Название исполнения"
                required
                value={form.nameRu}
                placeholder="Например, Dark oak"
                onChange={(event) =>
                  updateField(
                    "nameRu",
                    event.target.value,
                  )
                }
                hint="Будет использовано в русской и английской версиях"
              />
            ) : (
              <>
                <TextField
                  label="Название на русском"
                  required
                  value={form.nameRu}
                  placeholder="Тёмный дуб"
                  onChange={(event) =>
                    updateField(
                      "nameRu",
                      event.target.value,
                    )
                  }
                />
          
                <TextField
                  label="Название на английском"
                  required
                  value={form.nameEn}
                  placeholder="Dark oak"
                  onChange={(event) =>
                    updateField(
                      "nameEn",
                      event.target.value,
                    )
                  }
                />
              </>
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Локализация
            </p>

            <h2 className="mt-2 text-xl font-medium">Описание и материалы</h2>

            <p className="mt-2 text-sm text-white/30">
              Пустые поля будут взяты из основного товара.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TextAreaField
              label="Описание на русском"
              value={form.descriptionRu}
              placeholder="Оставьте пустым для наследования"
              onChange={(event) =>
                updateField("descriptionRu", event.target.value)
              }
            />

            <TextAreaField
              label="Описание на английском"
              value={form.descriptionEn}
              placeholder="Оставьте пустым для наследования"
              onChange={(event) =>
                updateField("descriptionEn", event.target.value)
              }
            />

            <TextAreaField
              label="Материалы на русском"
              value={form.materialsRu}
              placeholder="Оставьте пустым для наследования"
              onChange={(event) =>
                updateField("materialsRu", event.target.value)
              }
            />

            <TextAreaField
              label="Материалы на английском"
              value={form.materialsEn}
              placeholder="Оставьте пустым для наследования"
              onChange={(event) =>
                updateField("materialsEn", event.target.value)
              }
            />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Характеристики
            </p>

            <h2 className="mt-2 text-xl font-medium">Размеры</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <TextField
              label="Высота, мм"
              type="number"
              min="1"
              step="1"
              value={form.heightMm}
              placeholder="Наследовать"
              onChange={(event) => updateField("heightMm", event.target.value)}
            />

            <TextField
              label="Ширина, мм"
              type="number"
              min="1"
              step="1"
              value={form.widthMm}
              placeholder="Наследовать"
              onChange={(event) => updateField("widthMm", event.target.value)}
            />

            <TextField
              label="Глубина, мм"
              type="number"
              min="1"
              step="1"
              value={form.depthMm}
              placeholder="Наследовать"
              onChange={(event) => updateField("depthMm", event.target.value)}
            />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              Стоимость
            </p>

            <h2 className="mt-2 text-xl font-medium">Цена исполнения</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm text-white/65">
                Тип стоимости
              </span>

              <select
                value={form.priceMode}
                onChange={(event) =>
                  updateField("priceMode", event.target.value as PriceMode)
                }
                className={fieldClassName}
              >
                <option value="INHERIT">Как у основного товара</option>

                <option value="FIXED">Фиксированная стоимость</option>

                <option value="ON_REQUEST">По запросу</option>
              </select>
            </label>

            {form.priceMode === "FIXED" && (
              <>
                <TextField
                  label="Стоимость"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.priceAmount}
                  placeholder="150000"
                  onChange={(event) =>
                    updateField("priceAmount", event.target.value)
                  }
                />

                <TextField
                  label="Валюта"
                  required
                  minLength={3}
                  maxLength={3}
                  value={form.priceCurrency}
                  placeholder="RUB"
                  onChange={(event) =>
                    updateField(
                      "priceCurrency",
                      event.target.value.toUpperCase(),
                    )
                  }
                />
              </>
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/25">
                Галерея
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Собственные изображения
              </h2>

              <p className="mt-2 max-w-[38rem] text-sm leading-relaxed text-white/30">
                Если ничего не загружать, исполнение будет использовать
                изображения основного товара.
              </p>
            </div>

            <label className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]">
              Добавить изображения
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleImagesChange}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs text-white/35">
            <span>JPG, JPEG, PNG или WEBP</span>

            <span>
              {totalImagesCount}/{MAX_IMAGES}
            </span>
          </div>

          {isEditing &&
            existingVariant &&
            existingVariant.images.length > 0 && (
              <div className="mt-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                      Уже загружены
                    </p>
          
                    <p className="mt-1 text-xs text-white/20">
                      Первая фотография используется как
                      обложка исполнения
                    </p>
                  </div>
          
                  <div className="flex flex-wrap items-center gap-2">
                    {isReorderingImages ? (
                      <>
                        <button
                          type="button"
                          disabled={isSavingImageOrder}
                          onClick={cancelImageReordering}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-4 text-xs text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Отмена
                        </button>
                  
                        <button
                          type="button"
                          disabled={isSavingImageOrder}
                          onClick={() =>
                            void saveImageOrder()
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black transition-colors hover:bg-[#d6d6d6] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {isSavingImageOrder && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                          )}
          
                          {isSavingImageOrder
                            ? 'Сохранение...'
                            : 'Сохранить порядок'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          existingVariant.images.length < 2
                        }
                        onClick={startImageReordering}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-xs text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.7"
                          />
                        </svg>
                    
                        Изменить порядок
                      </button>
                    )}
                  </div>
                </div>
                
                {isReorderingImages && (
                  <div className="mb-4 rounded-xl border border-[#d7bd82]/15 bg-[#d7bd82]/[0.05] px-4 py-3 text-xs leading-relaxed text-[#d7bd82]/75">
                    Зажмите кнопку из точек и перетащите
                    изображение на нужную позицию. После этого
                    нажмите «Сохранить порядок».
                  </div>
                )}
          
                {imageActionError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-[#d99595]/20 bg-[#211515] px-4 py-3 text-sm text-[#e4aaaa]"
                  >
                    {imageActionError}
                  </div>
                )}
          
                <DragDropProvider
                  onDragEnd={(event) => {
                    if (
                      event.canceled ||
                      !isReorderingImages ||
                      isSavingImageOrder
                    ) {
                      return;
                    }
                
                    const { source } =
                      event.operation;
                
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
                
                    setExistingVariant((current) => {
                      if (!current) {
                        return current;
                      }
                  
                      const images = [
                        ...current.images,
                      ];
                  
                      const [movedImage] =
                        images.splice(
                          initialIndex,
                          1,
                        );
                    
                      if (!movedImage) {
                        return current;
                      }
                  
                      images.splice(
                        index,
                        0,
                        movedImage,
                      );
                  
                      return {
                        ...current,
                        images,
                      };
                    });
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {existingVariant.images.map(
                      (image, index) => (
                        <SortableExistingVariantImage
                          key={image.id}
                          image={image}
                          index={index}
                          variantName={
                            existingVariant.nameRu
                          }
                          isReordering={
                            isReorderingImages
                          }
                          isSaving={
                            isSavingImageOrder
                          }
                          onDelete={
                            setImageToDelete
                          }
                        />
                      ),
                    )}
                  </div>
                </DragDropProvider>
              </div>
            )}

          {isEditing &&
            existingVariant?.usesProductImages &&
            form.images.length > 0 && (
              <div className="mt-5 rounded-xl border border-[#d7bd82]/15 bg-[#d7bd82]/[0.05] px-4 py-3 text-xs leading-relaxed text-[#d7bd82]/75">
                После сохранения исполнение перестанет использовать галерею
                основного товара и будет показывать загруженные ниже
                изображения.
              </div>
            )}

          {form.images.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <p className="sm:col-span-2 xl:col-span-3 text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Новые изображения
              </p>

              {form.images.map((image, index) => (
                <ImagePreview
                  key={`${image.name}-${image.size}-${image.lastModified}-${index}`}
                  file={image}
                  index={index}
                  total={form.images.length}
                  isFirstOverall={existingImagesCount === 0 && index === 0}
                  onMove={moveImage}
                  onRemove={(imageIndex) =>
                    updateField(
                      "images",
                      form.images.filter((_, index) => index !== imageIndex),
                    )
                  }
                />
              ))}
            </div>
          )}

          {totalImagesCount === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
              <p className="text-sm text-white/35">
                Будут использованы фотографии основного товара
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/25">
                Документы
              </p>

              <h2 className="mt-2 text-xl font-medium">PDF и 3D-файлы</h2>

              <p className="mt-2 text-sm text-white/30">
                Эти файлы будут относиться только к данному исполнению.
              </p>
            </div>

            <label className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm text-white/65 transition-colors hover:bg-white hover:text-black">
              Добавить файлы
              <input
                type="file"
                multiple
                accept=".pdf,.glb,.gltf,application/pdf,model/gltf-binary,model/gltf+json"
                className="sr-only"
                onChange={handleFilesChange}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs text-white/35">
            <span>PDF, GLB или GLTF</span>

            <span>
              {totalFilesCount}/{MAX_FILES}
            </span>
          </div>

          {isEditing &&
            existingVariant &&
            existingVariant.files.length > 0 && (
              <div className="mt-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                      Уже загружены
                    </p>
          
                    <p className="mt-1 text-xs text-white/20">
                      Подписи используются на странице товара
                    </p>
                  </div>
          
                  <div className="flex flex-wrap items-center gap-2">
                    {isReorderingFiles ? (
                      <>
                        <button
                          type="button"
                          disabled={isSavingFileOrder}
                          onClick={cancelFileReordering}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-4 text-xs text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-40"
                        >
                          Отмена
                        </button>
                  
                        <button
                          type="button"
                          disabled={isSavingFileOrder}
                          onClick={() =>
                            void saveFileOrder()
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black transition-colors hover:bg-[#d6d6d6] disabled:opacity-45"
                        >
                          {isSavingFileOrder && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                          )}
          
                          {isSavingFileOrder
                            ? 'Сохранение...'
                            : 'Сохранить порядок'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          existingVariant.files.length < 2
                        }
                        onClick={startFileReordering}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-xs text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.7"
                          />
                        </svg>
                    
                        Изменить порядок
                      </button>
                    )}
                  </div>
                </div>
                
                {isReorderingFiles && (
                  <div className="mb-4 rounded-xl border border-[#d7bd82]/15 bg-[#d7bd82]/[0.05] px-4 py-3 text-xs leading-relaxed text-[#d7bd82]/75">
                    Зажмите кнопку из точек и перетащите
                    файл. После перестановки нажмите
                    «Сохранить порядок».
                  </div>
                )}
          
                {fileActionError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-[#d99595]/20 bg-[#211515] px-4 py-3 text-sm text-[#e4aaaa]"
                  >
                    {fileActionError}
                  </div>
                )}
          
                <DragDropProvider
                  onDragEnd={(event) => {
                    if (
                      event.canceled ||
                      !isReorderingFiles ||
                      isSavingFileOrder
                    ) {
                      return;
                    }
                
                    const { source } =
                      event.operation;
                
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
                
                    setExistingVariant((current) => {
                      if (!current) {
                        return current;
                      }
                  
                      const files = [
                        ...current.files,
                      ];
                  
                      const [movedFile] =
                        files.splice(
                          initialIndex,
                          1,
                        );
                    
                      if (!movedFile) {
                        return current;
                      }
                  
                      files.splice(
                        index,
                        0,
                        movedFile,
                      );
                  
                      return {
                        ...current,
                        files,
                      };
                    });
                  }}
                >
                  <div className="space-y-2">
                    {existingVariant.files.map(
                      (file, index) => (
                        <SortableExistingVariantFile
                          key={file.id}
                          file={file}
                          index={index}
                          isReordering={
                            isReorderingFiles
                          }
                          isSaving={
                            isSavingFileOrder
                          }
                          onEdit={openFileEditor}
                          onDelete={setFileToDelete}
                        />
                      ),
                    )}
                  </div>
                </DragDropProvider>
              </div>
            )}

          {form.files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Новые файлы
              </p>

              {form.files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/65">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      {(file.size / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "files",
                        form.files.filter(
                          (_, fileIndex) => fileIndex !== index,
                        ),
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-white/35 transition-colors hover:bg-[#d99595]/15 hover:text-[#e4aaaa]"
                    aria-label={`Удалить файл ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              label="Позиция"
              type="number"
              min="0"
              step="1"
              value={form.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
            />

            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.035] px-4">
              <div>
                <p className="text-sm text-white/65">Опубликовать исполнение</p>

                <p className="mt-1 text-xs text-white/25">
                  Оно появится на странице товара
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  updateField("isPublished", event.target.checked)
                }
                className="h-5 w-5 accent-white"
              />
            </label>
          </div>
        </section>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-[#d99595]/20 bg-[#211515] px-4 py-3 text-sm text-[#e4aaaa]"
          >
            {formError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to={
              isEditing && variantId
                ? `/admin/products/${productId}/variants/${variantId}`
                : `/admin/products/${productId}`
            }
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 px-6 text-sm text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Отмена
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting
              ? isEditing
                ? "Сохранение..."
                : "Создание..."
              : isEditing
                ? "Сохранить изменения"
                : "Создать исполнение"}
          </button>
        </div>
      </form>

      {imageToDelete && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !deletingImageId
            ) {
              setImageToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-variant-image-title"
            className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#151515] p-6 shadow-[0_2rem_6rem_rgba(0,0,0,0.55)]"
          >
            <div className="overflow-hidden rounded-2xl bg-black">
              <img
                src={imageToDelete.imageUrl}
                alt={
                  imageToDelete.altRu ??
                  existingVariant?.nameRu ??
                  ''
                }
                draggable={false}
                className="aspect-[16/9] w-full object-cover opacity-75"
              />
            </div>
              
            <h2
              id="delete-variant-image-title"
              className="mt-5 text-xl font-medium"
            >
              Удалить изображение?
            </h2>
              
            <p className="mt-2 text-sm leading-relaxed text-white/35">
              Изображение будет удалено из исполнения и
              хранилища. Это действие нельзя отменить.
            </p>
              
            {existingVariant?.images.length === 1 && (
              <p className="mt-3 rounded-xl border border-[#d7bd82]/15 bg-[#d7bd82]/[0.05] px-4 py-3 text-xs leading-relaxed text-[#d7bd82]/75">
                Это последняя собственная фотография.
                После удаления исполнение начнёт
                использовать изображения основного товара.
              </p>
            )}
      
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingImageId !== null}
                onClick={() =>
                  setImageToDelete(null)
                }
                className="h-11 rounded-xl border border-white/10 px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                Отмена
              </button>
              
              <button
                type="button"
                disabled={deletingImageId !== null}
                onClick={() =>
                  void removeExistingImage()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d99595] px-5 text-sm font-medium text-[#1a0e0e] transition-colors hover:bg-[#e4aaaa] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {deletingImageId && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                )}
      
                {deletingImageId
                  ? 'Удаление...'
                  : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isSavingFileLabels
            ) {
              setEditingFile(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-file-title"
            className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-[#151515] p-6 shadow-[0_2rem_6rem_rgba(0,0,0,0.55)]"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-white/25">
              {editingFile.type === 'PDF'
                ? 'PDF-документ'
                : '3D-модель'}
            </p>
              
            <h2
              id="edit-file-title"
              className="mt-2 text-xl font-medium"
            >
              Изменить подписи
            </h2>
              
            <p className="mt-2 truncate text-sm text-white/30">
              {editingFile.originalName}
            </p>
              
            <div className="mt-6 space-y-5">
              <TextField
                label="Название на русском"
                value={fileLabelRu}
                maxLength={160}
                placeholder={editingFile.originalName}
                onChange={(event) =>
                  setFileLabelRu(event.target.value)
                }
              />
      
              <TextField
                label="Название на английском"
                value={fileLabelEn}
                maxLength={160}
                placeholder={editingFile.originalName}
                onChange={(event) =>
                  setFileLabelEn(event.target.value)
                }
              />
            </div>
              
            <p className="mt-4 text-xs leading-relaxed text-white/25">
              Если оставить поле пустым, посетителю будет
              показано исходное имя файла.
            </p>
              
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSavingFileLabels}
                onClick={() => setEditingFile(null)}
                className="h-11 rounded-xl border border-white/10 px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                Отмена
              </button>
              
              <button
                type="button"
                disabled={isSavingFileLabels}
                onClick={() =>
                  void saveFileLabels()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6] disabled:opacity-45"
              >
                {isSavingFileLabels && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                )}
      
                {isSavingFileLabels
                  ? 'Сохранение...'
                  : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {fileToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deletingFileId
            ) {
              setFileToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-variant-file-title"
            className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#151515] p-6 shadow-[0_2rem_6rem_rgba(0,0,0,0.55)]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d99595]/15 bg-[#d99595]/10 text-sm font-medium text-[#e4aaaa]">
              {fileToDelete.type === 'PDF'
                ? 'PDF'
                : '3D'}
            </div>
              
            <h2
              id="delete-variant-file-title"
              className="mt-5 text-xl font-medium"
            >
              Удалить файл?
            </h2>
              
            <p className="mt-2 break-words text-sm leading-relaxed text-white/35">
              Файл «
              {fileToDelete.labelRu ??
                fileToDelete.originalName}
              » будет удалён из исполнения и хранилища.
              Это действие нельзя отменить.
            </p>
              
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={deletingFileId !== null}
                onClick={() => setFileToDelete(null)}
                className="h-11 rounded-xl border border-white/10 px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                Отмена
              </button>
              
              <button
                type="button"
                disabled={deletingFileId !== null}
                onClick={() =>
                  void removeExistingFile()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#d99595] px-5 text-sm font-medium text-[#1a0e0e] transition-colors hover:bg-[#e4aaaa] disabled:opacity-45"
              >
                {deletingFileId && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
                )}
      
                {deletingFileId
                  ? 'Удаление...'
                  : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
