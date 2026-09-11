import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import {
  AdminProductVariantsApiError,
  createAdminProductVariant,
  getAdminProductVariant,
  updateAdminProductVariant,
  type AdminProductVariant,
} from "../../../features/admin-product-variants";

const MAX_IMAGES = 15;
const MAX_FILES = 10;

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type PriceMode = "INHERIT" | "FIXED" | "ON_REQUEST";

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

export function AdminCreateProductVariantPage() {
  const { productId, variantId } = useParams<{
    productId: string;
    variantId: string;
  }>();

  const isEditing = variantId !== undefined;

  const navigate = useNavigate();

  const [form, setForm] = useState<VariantForm>(initialForm);

  const [formError, setFormError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingVariant, setExistingVariant] =
    useState<AdminProductVariant | null>(null);

  const [isLoadingVariant, setIsLoadingVariant] = useState(isEditing);

  const [loadVariantError, setLoadVariantError] = useState<string | null>(null);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.slug.trim() || !form.nameRu.trim() || !form.nameEn.trim()) {
      setFormError("Заполните slug и названия на двух языках");
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
              nameRu: form.nameRu,
              nameEn: form.nameEn,

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
              nameRu: form.nameRu,
              nameEn: form.nameEn,

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

          <div className="grid gap-5 lg:grid-cols-3">
            <TextField
              label="Slug"
              required
              value={form.slug}
              placeholder="dark-oak"
              onChange={(event) => updateField("slug", event.target.value)}
              hint="Уникальный адрес внутри товара"
            />

            <TextField
              label="Название на русском"
              required
              value={form.nameRu}
              placeholder="Тёмный дуб"
              onChange={(event) => updateField("nameRu", event.target.value)}
            />

            <TextField
              label="Название на английском"
              required
              value={form.nameEn}
              placeholder="Dark oak"
              onChange={(event) => updateField("nameEn", event.target.value)}
            />
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
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                    Уже загружены
                  </p>

                  <span className="text-xs text-white/25">
                    {existingVariant.images.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {existingVariant.images.map((image, index) => (
                    <figure
                      key={image.id}
                      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151515]"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.altRu ?? existingVariant.nameRu}
                        draggable={false}
                        className="aspect-[4/3] w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[0.65rem] text-white/70 backdrop-blur-md">
                          Обложка
                        </span>
                      )}
                    </figure>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-white/25">
                  Здесь показаны сохранённые изображения. Управление их порядком
                  и удаление выполняется на странице исполнения.
                </p>
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

          {isEditing && existingVariant && existingVariant.files.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Уже загружены
              </p>

              {existingVariant.files.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/65">
                      {file.labelRu ?? file.originalName}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/25">
                      {file.originalName}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-white/30">
                    {file.type === "PDF" ? "PDF" : "3D"}
                  </span>
                </a>
              ))}
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
    </div>
  );
}
