import {
  AdminProductVariantsApiError,
  type AdminProductVariant,
  type AdminProductVariantPriceType,
} from './get-admin-product-variants';

export interface UpdateAdminProductVariantInput {
  slug?: string;
  nameRu?: string;
  nameEn?: string;

  descriptionRu?: string | null;
  descriptionEn?: string | null;
  materialsRu?: string | null;
  materialsEn?: string | null;

  heightMm?: number | null;
  widthMm?: number | null;
  depthMm?: number | null;

  priceType?: AdminProductVariantPriceType | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;

  sortOrder?: number;
  isPublished?: boolean;

  images?: File[];
  files?: File[];
}

function appendOptionalString(
  formData: FormData,
  key: string,
  value: string | undefined,
): void {
  if (value !== undefined) {
    formData.append(key, value.trim());
  }
}

function appendNullableString(
  formData: FormData,
  key: string,
  value: string | null | undefined,
): void {
  if (value !== undefined) {
    formData.append(
      key,
      value === null ? '' : value.trim(),
    );
  }
}

function appendNullableNumber(
  formData: FormData,
  key: string,
  value: number | null | undefined,
): void {
  if (value !== undefined) {
    formData.append(
      key,
      value === null ? '' : String(value),
    );
  }
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  const body = (await response
    .json()
    .catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(body?.message)) {
    return body.message.join(', ');
  }

  if (typeof body?.message === 'string') {
    return body.message;
  }

  return 'Не удалось изменить исполнение';
}

export async function updateAdminProductVariant(
  productId: string,
  variantId: string,
  input: UpdateAdminProductVariantInput,
): Promise<AdminProductVariant> {
  const formData = new FormData();

  appendOptionalString(formData, 'slug', input.slug);
  appendOptionalString(formData, 'nameRu', input.nameRu);
  appendOptionalString(formData, 'nameEn', input.nameEn);

  appendNullableString(
    formData,
    'descriptionRu',
    input.descriptionRu,
  );

  appendNullableString(
    formData,
    'descriptionEn',
    input.descriptionEn,
  );

  appendNullableString(
    formData,
    'materialsRu',
    input.materialsRu,
  );

  appendNullableString(
    formData,
    'materialsEn',
    input.materialsEn,
  );

  appendNullableNumber(
    formData,
    'heightMm',
    input.heightMm,
  );

  appendNullableNumber(
    formData,
    'widthMm',
    input.widthMm,
  );

  appendNullableNumber(
    formData,
    'depthMm',
    input.depthMm,
  );

  if (input.priceType !== undefined) {
    formData.append(
      'priceType',
      input.priceType ?? '',
    );
  }

  appendNullableNumber(
    formData,
    'priceAmount',
    input.priceAmount,
  );

  appendNullableString(
    formData,
    'priceCurrency',
    input.priceCurrency?.toUpperCase() ??
      input.priceCurrency,
  );

  if (input.sortOrder !== undefined) {
    formData.append(
      'sortOrder',
      String(input.sortOrder),
    );
  }

  if (input.isPublished !== undefined) {
    formData.append(
      'isPublished',
      String(input.isPublished),
    );
  }

  input.images?.forEach((image) => {
    formData.append('images', image);
  });

  input.files?.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    },
  );

  if (!response.ok) {
    throw new AdminProductVariantsApiError(
      await getErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as AdminProductVariant;
}
