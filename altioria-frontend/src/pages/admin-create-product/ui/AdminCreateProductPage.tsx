import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import {
  AdminCategoriesApiError,
  getAdminCategories,
  type AdminCategory,
} from '../../../features/admin-categories';

import {
  AdminProductsApiError,
  ProductFilesManager,
  ProductImagesManager,
  createAdminProduct,
  getAdminProduct,
  updateAdminProduct,
  type AdminProduct,
  type ProductPriceType,
} from '../../../features/admin-products';

const MAX_IMAGES = 15;
const MAX_FILES = 10;

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const inputClass =
  'h-12 w-full select-text rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.05] focus:border-white/25 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-40';

const textareaClass =
  'min-h-36 w-full resize-y select-text rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/20 hover:bg-white/[0.05] focus:border-white/25 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-40';

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} КБ`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
    return items;
  }

  const result = [...items];
  const [item] = result.splice(fromIndex, 1);

  if (item === undefined) {
    return items;
  }

  result.splice(toIndex, 0, item);

  return result;
}

function parseOptionalInteger(
  value: string,
  fieldName: string,
  minimum: number,
): number | undefined {
  const normalizedValue = value.trim();

  if (normalizedValue === '') {
    return undefined;
  }

  const number = Number(normalizedValue);

  if (!Number.isInteger(number) || number < minimum) {
    throw new Error(`${fieldName}: укажите целое число не меньше ${minimum}`);
  }

  return number;
}

export function AdminCreateProductPage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const isEditing = id !== undefined;

  const [existingProduct, setExistingProduct] = useState<AdminProduct | null>(
    null,
  );

  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);

  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState('');
  const [slug, setSlug] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [materialsRu, setMaterialsRu] = useState('');
  const [materialsEn, setMaterialsEn] = useState('');

  const [heightMm, setHeightMm] = useState('');
  const [widthMm, setWidthMm] = useState('');
  const [depthMm, setDepthMm] = useState('');

  const [priceType, setPriceType] = useState<ProductPriceType>('ON_REQUEST');

  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('RUB');

  const [sortOrder, setSortOrder] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [images, setImages] = useState<File[]>([]);

  const [files, setFiles] = useState<File[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const imagePreviews = useMemo(
    () =>
      images.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [images],
  );

  useEffect(() => {
    document.title = isEditing
      ? 'Редактирование товара — Altioria'
      : 'Добавление товара — Altioria';

    let isActive = true;

    getAdminCategories()
      .then((result) => {
        if (!isActive) {
          return;
        }

        setCategories(result);

        setCategoryId((current) => {
          if (current) {
            return current;
          }

          return result[0]?.id ?? '';
        });
      })
      .catch((requestError: unknown) => {
        if (!isActive) {
          return;
        }

        if (
          requestError instanceof AdminCategoriesApiError &&
          requestError.status === 401
        ) {
          navigate('/admin/login', {
            replace: true,
          });

          return;
        }

        setCategoryError(
          requestError instanceof Error
            ? requestError.message
            : 'Не удалось получить категории',
        );
      });

    return () => {
      isActive = false;
    };
  }, [isEditing, navigate]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isActive = true;

    setIsLoadingProduct(true);
    setProductLoadError(null);

    getAdminProduct(id)
      .then((product) => {
        if (!isActive) {
          return;
        }

        setExistingProduct(product);

        setCategoryId(product.categoryId);
        setSlug(product.slug);
        setNameRu(product.nameRu);
        setNameEn(product.nameEn);

        setDescriptionRu(product.descriptionRu);

        setDescriptionEn(product.descriptionEn);

        setMaterialsRu(product.materialsRu ?? '');

        setMaterialsEn(product.materialsEn ?? '');

        setHeightMm(product.heightMm?.toString() ?? '');

        setWidthMm(product.widthMm?.toString() ?? '');

        setDepthMm(product.depthMm?.toString() ?? '');

        setPriceType(product.priceType);

        setPriceAmount(product.priceAmount ?? '');

        setPriceCurrency(product.priceCurrency ?? 'RUB');

        setSortOrder(product.sortOrder.toString());

        setIsPublished(product.isPublished);
      })
      .catch((requestError: unknown) => {
        if (!isActive) {
          return;
        }

        if (
          requestError instanceof AdminProductsApiError &&
          requestError.status === 401
        ) {
          navigate('/admin/login', {
            replace: true,
          });

          return;
        }

        setProductLoadError(
          requestError instanceof Error
            ? requestError.message
            : 'Не удалось получить товар',
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProduct(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  const existingImagesCount = existingProduct?.images.length ?? 0;

  const existingFilesCount = existingProduct?.files.length ?? 0;

  const totalImagesCount = existingImagesCount + images.length;

  const totalFilesCount = existingFilesCount + files.length;

  function addImages(selectedFiles: File[]): void {
    setError(null);

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidType = selectedFiles.find(
      (file) => !allowedImageTypes.has(file.type),
    );

    if (invalidType) {
      setError(`Файл «${invalidType.name}» не является JPG, PNG или WEBP`);

      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE,
    );

    if (oversizedFile) {
      setError(`Изображение «${oversizedFile.name}» превышает 20 МБ`);

      return;
    }

    if (totalImagesCount + selectedFiles.length > MAX_IMAGES) {
      setError(`У товара может быть не больше ${MAX_IMAGES} изображений`);

      return;
    }

    setImages((current) => [...current, ...selectedFiles]);
  }

  function addFiles(selectedFiles: File[]): void {
    setError(null);

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

      return !['pdf', 'glb', 'gltf'].includes(extension);
    });

    if (invalidFile) {
      setError(`Файл «${invalidFile.name}» имеет неподдерживаемый формат`);

      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE,
    );

    if (oversizedFile) {
      setError(`Файл «${oversizedFile.name}» превышает 50 МБ`);

      return;
    }

    if (totalFilesCount + selectedFiles.length > MAX_FILES) {
      setError(`У товара может быть не больше ${MAX_FILES} файлов`);

      return;
    }

    setFiles((current) => [...current, ...selectedFiles]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);

    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedNameRu = nameRu.trim();
    const normalizedNameEn = nameEn.trim();
    const normalizedDescriptionRu = descriptionRu.trim();
    const normalizedDescriptionEn = descriptionEn.trim();

    if (!categoryId) {
      setError('Выберите категорию товара');
      return;
    }

    if (
      !normalizedSlug ||
      !normalizedNameRu ||
      !normalizedNameEn ||
      !normalizedDescriptionRu ||
      !normalizedDescriptionEn
    ) {
      setError('Заполните все обязательные текстовые поля');

      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setError('Slug может содержать только латинские буквы, цифры и дефисы');

      return;
    }

    if (totalImagesCount === 0) {
      setError('У товара должно быть хотя бы одно изображение');

      return;
    }

    if (
      priceType === 'FIXED' &&
      !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(priceAmount.trim())
    ) {
      setError('Укажите корректную стоимость, например 125000.00');

      return;
    }

    if (priceType === 'FIXED' && !/^[A-Z]{3}$/.test(priceCurrency.trim())) {
      setError('Валюта должна состоять из трёх латинских букв');

      return;
    }

    let parsedHeight: number | undefined;
    let parsedWidth: number | undefined;
    let parsedDepth: number | undefined;
    let parsedSortOrder: number | undefined;

    try {
      parsedHeight = parseOptionalInteger(heightMm, 'Высота', 1);

      parsedWidth = parseOptionalInteger(widthMm, 'Ширина', 1);

      parsedDepth = parseOptionalInteger(depthMm, 'Глубина', 1);

      parsedSortOrder = parseOptionalInteger(
        sortOrder,
        'Порядок отображения',
        0,
      );
    } catch (validationError: unknown) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : 'Проверьте числовые значения',
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        categoryId,
        slug: normalizedSlug,
        nameRu: normalizedNameRu,
        nameEn: normalizedNameEn,
        descriptionRu: normalizedDescriptionRu,
        descriptionEn: normalizedDescriptionEn,
        materialsRu: materialsRu.trim() || undefined,
        materialsEn: materialsEn.trim() || undefined,
        heightMm: parsedHeight,
        widthMm: parsedWidth,
        depthMm: parsedDepth,
        priceType,
        priceAmount: priceType === 'FIXED' ? priceAmount.trim() : undefined,
        priceCurrency: priceType === 'FIXED' ? priceCurrency.trim() : undefined,
        sortOrder: parsedSortOrder,
        isPublished,
        images,
        files,
      };

      const product =
        isEditing && id
          ? await updateAdminProduct(id, input)
          : await createAdminProduct(input);

      navigate(
        isEditing ? `/admin/products/${product.id}` : '/admin/products',
        {
          replace: true,
          state: {
            updatedProductId: isEditing ? product.id : undefined,
            createdProductId: !isEditing ? product.id : undefined,
          },
        },
      );
    } catch (requestError: unknown) {
      if (
        requestError instanceof AdminProductsApiError &&
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
          : isEditing
            ? 'Не удалось изменить товар'
            : 'Не удалось создать товар',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCategory = categories?.find(
    (category) => category.id === categoryId,
  );

  if (isEditing && isLoadingProduct) {
    return (
      <div className="mx-auto w-full max-w-[100rem] animate-pulse">
        <div className="mb-8 h-24 rounded-3xl bg-white/[0.04]" />

        <div className="space-y-6">
          <div className="h-72 rounded-3xl bg-white/[0.04]" />
          <div className="h-96 rounded-3xl bg-white/[0.04]" />
          <div className="h-72 rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (isEditing && productLoadError) {
    return (
      <section className="flex min-h-[60dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-8 text-center">
          <h1 className="text-2xl font-medium">Не удалось открыть товар</h1>

          <p className="mt-3 text-sm text-white/35">{productLoadError}</p>

          <Link
            to="/admin/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-medium text-black"
          >
            К списку товаров
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[100rem]">
      <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to={isEditing && id ? `/admin/products/${id}` : '/admin/products'}
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/35 transition-colors hover:text-white"
          >
            <span aria-hidden="true">←</span>

            {isEditing ? 'Вернуться к товару' : 'Все товары'}
          </Link>

          <p className="mb-2 text-[0.65rem] uppercase tracking-[0.2em] text-white/25">
            Каталог
          </p>

          <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
            {isEditing ? 'Изменение товара' : 'Новый товар'}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/35">
            {isEditing
              ? 'Измените информацию о товаре или добавьте новые фотографии и файлы.'
              : 'Заполните основную информацию, загрузите фотографии и при необходимости добавьте PDF или 3D-модель.'}
          </p>
        </div>
      </header>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              01
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">
              Основная информация
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Категория *
              </span>

              <select
                value={categoryId}
                disabled={isSubmitting || categories === null}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setError(null);
                }}
                className={inputClass}
              >
                {categories === null && (
                  <option value="">Загрузка категорий...</option>
                )}

                {categories?.length === 0 && (
                  <option value="">Категории отсутствуют</option>
                )}

                {categories?.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-[#171717]"
                  >
                    {category.nameRu}
                    {!category.isPublished ? ' — черновик' : ''}
                  </option>
                ))}
              </select>

              {categoryError && (
                <span className="mt-2 block text-xs text-[#e4aaaa]">
                  {categoryError}
                </span>
              )}

              {selectedCategory && !selectedCategory.isPublished && (
                <span className="mt-2 block text-xs text-[#d8bd8d]">
                  Категория не опубликована. Товар не появится на сайте, пока
                  категория остаётся черновиком.
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Slug *
              </span>

              <input
                type="text"
                value={slug}
                disabled={isSubmitting}
                placeholder="altair-i"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(event) => {
                  setSlug(event.target.value.toLowerCase());
                  setError(null);
                }}
                className={inputClass}
              />

              <span className="mt-2 block text-xs text-white/20">
                Адрес товара: /products/altair-i
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Название на русском *
              </span>

              <input
                type="text"
                value={nameRu}
                disabled={isSubmitting}
                placeholder="Альтаир I"
                onChange={(event) => {
                  setNameRu(event.target.value);
                  setError(null);
                }}
                className={inputClass}
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
                placeholder="Altair I"
                onChange={(event) => {
                  setNameEn(event.target.value);
                  setError(null);
                }}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              02
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">
              Описание
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Описание на русском *
              </span>

              <textarea
                value={descriptionRu}
                disabled={isSubmitting}
                placeholder="Расскажите о товаре..."
                onChange={(event) => {
                  setDescriptionRu(event.target.value);
                  setError(null);
                }}
                className={textareaClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Описание на английском *
              </span>

              <textarea
                value={descriptionEn}
                disabled={isSubmitting}
                placeholder="Describe the product..."
                onChange={(event) => {
                  setDescriptionEn(event.target.value);
                  setError(null);
                }}
                className={textareaClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Материалы на русском
              </span>

              <textarea
                value={materialsRu}
                disabled={isSubmitting}
                placeholder="Мрамор, латунь..."
                onChange={(event) => {
                  setMaterialsRu(event.target.value);
                  setError(null);
                }}
                className={textareaClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Материалы на английском
              </span>

              <textarea
                value={materialsEn}
                disabled={isSubmitting}
                placeholder="Marble, brass..."
                onChange={(event) => {
                  setMaterialsEn(event.target.value);
                  setError(null);
                }}
                className={textareaClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
              03
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">
              Размеры и стоимость
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ['Высота, мм', heightMm, setHeightMm],
              ['Ширина, мм', widthMm, setWidthMm],
              ['Глубина, мм', depthMm, setDepthMm],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                  {label as string}
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={value as string}
                  disabled={isSubmitting}
                  placeholder="Не указано"
                  onChange={(event) => {
                    (setter as (value: string) => void)(event.target.value);

                    setError(null);
                  }}
                  className={inputClass}
                />
              </label>
            ))}
          </div>

          <div className="mt-7 border-t border-white/[0.07] pt-7">
            <span className="mb-3 block text-xs uppercase tracking-[0.12em] text-white/40">
              Стоимость
            </span>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setPriceType('ON_REQUEST');
                  setError(null);
                }}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  priceType === 'ON_REQUEST'
                    ? 'border-white/25 bg-white/[0.08]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <span className="block text-sm font-medium">По запросу</span>

                <span className="mt-1 block text-xs text-white/30">
                  Цена не показывается на сайте
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setPriceType('FIXED');
                  setError(null);
                }}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  priceType === 'FIXED'
                    ? 'border-white/25 bg-white/[0.08]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <span className="block text-sm font-medium">
                  Фиксированная цена
                </span>

                <span className="mt-1 block text-xs text-white/30">
                  Стоимость будет видна посетителям
                </span>
              </button>
            </div>

            {priceType === 'FIXED' && (
              <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_10rem]">
                <label>
                  <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                    Стоимость *
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={priceAmount}
                    disabled={isSubmitting}
                    placeholder="125000.00"
                    onChange={(event) => {
                      setPriceAmount(event.target.value.replace(',', '.'));
                      setError(null);
                    }}
                    className={inputClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                    Валюта *
                  </span>

                  <input
                    type="text"
                    value={priceCurrency}
                    disabled={isSubmitting}
                    maxLength={3}
                    placeholder="RUB"
                    onChange={(event) => {
                      setPriceCurrency(event.target.value.toUpperCase());
                      setError(null);
                    }}
                    className={inputClass}
                  />
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
                04
              </p>

              <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">
                Фотографии *
              </h2>
            </div>

            <span className="text-xs text-white/30">
              {totalImagesCount}/{MAX_IMAGES}
            </span>
          </div>

          {isEditing && existingProduct && (
            <ProductImagesManager
              productId={existingProduct.id}
              productName={existingProduct.nameRu}
              images={existingProduct.images}
              isPublished={existingProduct.isPublished}
              onImagesChange={(updatedImages) => {
                setExistingProduct(
                  (currentProduct) => {
                    if (!currentProduct) {
                      return currentProduct;
                    }
                
                    return {
                      ...currentProduct,
                      images: updatedImages,
                    };
                  },
                );
              }}
            />
          )}

          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();

              addImages(Array.from(event.dataTransfer.files));
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-9 text-center transition-colors hover:border-white/30 hover:bg-white/[0.04]"
          >
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={isSubmitting}
              onChange={(event) => {
                addImages(Array.from(event.target.files ?? []));

                event.target.value = '';
              }}
              className="sr-only"
            />

            <span className="text-sm text-white/65">
              Перетащите изображения сюда
            </span>

            <span className="mt-2 text-xs text-white/25">
              или нажмите для выбора · JPG, PNG, WEBP · до 20 МБ каждое
            </span>
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-5">
              {isEditing && (
                <p className="mb-3 text-xs uppercase tracking-[0.12em] text-white/30">
                  Новые фотографии
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {imagePreviews.map(({ file, url }, index) => (
                  <article
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-black">
                      <img
                        src={url}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                      />

                      {index === 0 && existingImagesCount === 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[0.65rem] font-medium text-black">
                          Обложка
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isSubmitting}
                        aria-label="Удалить изображение"
                        onClick={() => {
                          setImages((current) =>
                            current.filter(
                              (_, imageIndex) => imageIndex !== index,
                            ),
                          );
                        }}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/65 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
                      >
                        ×
                      </button>
                    </div>

                    <div className="p-3">
                      <p className="truncate text-xs text-white/45">
                        {file.name}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting || index === 0}
                          onClick={() =>
                            setImages((current) =>
                              moveItem(current, index, index - 1),
                            )
                          }
                          className="h-8 flex-1 rounded-lg border border-white/[0.08] text-xs text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting || index === images.length - 1}
                          onClick={() =>
                            setImages((current) =>
                              moveItem(current, index, index + 1),
                            )
                          }
                          className="h-8 flex-1 rounded-lg border border-white/[0.08] text-xs text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-white/25">
            {isEditing
              ? existingImagesCount > 0
                ? 'Новые фотографии будут добавлены после существующих. Текущая обложка не изменится.'
                : 'Первая новая фотография станет обложкой товара.'
              : 'Первая фотография станет обложкой товара. Используйте стрелки, чтобы поменять порядок.'}
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/25">
                05
              </p>

              <h2 className="mt-2 text-xl font-medium tracking-[-0.025em]">
                Документы и 3D
              </h2>
            </div>

            <span className="text-xs text-white/30">
              {totalFilesCount}/{MAX_FILES}
            </span>
          </div>

          {isEditing && existingProduct && (
            <ProductFilesManager
              productId={existingProduct.id}
              files={existingProduct.files}
              onFilesChange={(updatedFiles) => {
                setExistingProduct(
                  (currentProduct) => {
                    if (!currentProduct) {
                      return currentProduct;
                    }
                  
                    return {
                      ...currentProduct,
                      files: updatedFiles,
                    };
                  },
                );
              }}
            />
          )}

          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();

              addFiles(Array.from(event.dataTransfer.files));
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center transition-colors hover:border-white/30 hover:bg-white/[0.04]"
          >
            <input
              type="file"
              multiple
              accept=".pdf,.glb,.gltf,application/pdf,model/gltf-binary,model/gltf+json"
              disabled={isSubmitting}
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []));

                event.target.value = '';
              }}
              className="sr-only"
            />

            <span className="text-sm text-white/65">
              Добавить PDF или 3D-модель
            </span>

            <span className="mt-2 text-xs text-white/25">
              PDF, GLB или GLTF · до 50 МБ каждый
            </span>
          </label>

          {files.length > 0 && (
            <div className="mt-5 space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[0.65rem] font-medium uppercase text-white/45">
                    {file.name.split('.').pop()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/65">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      {formatBytes(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index),
                      );
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white"
                    aria-label={`Удалить файл ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[14rem_1fr]">
            <label>
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/40">
                Порядок отображения
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={sortOrder}
                disabled={isSubmitting}
                placeholder="0"
                onChange={(event) => {
                  setSortOrder(event.target.value);
                  setError(null);
                }}
                className={inputClass}
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
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
                  Опубликовать товар
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-white/25">
                  {isEditing
                    ? 'Опубликованный товар будет доступен посетителям, если выбранная категория тоже опубликована.'
                    : 'После создания товар сразу будет доступен посетителям, если выбранная категория тоже опубликована.'}
                </span>
              </span>
            </label>
          </div>
        </section>

        <div className="sticky bottom-4 z-20 rounded-2xl border border-white/10 bg-[#151515]/95 p-4 shadow-[0_1.5rem_5rem_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" className="min-h-5">
              {error ? (
                <p className="text-sm text-[#e4aaaa]">{error}</p>
              ) : (
                <p className="text-xs text-white/25">
                  Поля со звёздочкой обязательны
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                to={
                  isEditing && id ? `/admin/products/${id}` : '/admin/products'
                }
                className="flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Отмена
              </Link>

              <button
                type="submit"
                disabled={
                  isSubmitting || categories === null || categories.length === 0
                }
                className="flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d5d5d5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                )}

                {isSubmitting
                  ? isEditing
                    ? 'Сохранение...'
                    : 'Создание...'
                  : isEditing
                    ? 'Сохранить изменения'
                    : 'Создать товар'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}