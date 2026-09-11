import {
  AdminProductVariantsApiError,
  type AdminProductVariant,
  type AdminProductVariantPriceType,
} from './get-admin-product-variants';

export interface CreateAdminProductVariantInput {
  slug: string;
  nameRu: string;
  nameEn: string;

  descriptionRu?: string;
  descriptionEn?: string;
  materialsRu?: string;
  materialsEn?: string;

  heightMm?: string;
  widthMm?: string;
  depthMm?: string;

  priceType?: AdminProductVariantPriceType;
  priceAmount?: string;
  priceCurrency?: string;

  sortOrder: string;
  isPublished: boolean;

  images: File[];
  files: File[];
}

function appendOptional(
  formData: FormData,
  key: string,
  value: string | undefined,
) {
  const normalizedValue = value?.trim();

  if (normalizedValue) {
    formData.append(key, normalizedValue);
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

  return 'Не удалось создать исполнение';
}

export async function createAdminProductVariant(
  productId: string,
  input: CreateAdminProductVariantInput,
): Promise<AdminProductVariant> {
  const formData = new FormData();

  formData.append('slug', input.slug.trim());
  formData.append('nameRu', input.nameRu.trim());
  formData.append('nameEn', input.nameEn.trim());

  appendOptional(
    formData,
    'descriptionRu',
    input.descriptionRu,
  );

  appendOptional(
    formData,
    'descriptionEn',
    input.descriptionEn,
  );

  appendOptional(
    formData,
    'materialsRu',
    input.materialsRu,
  );

  appendOptional(
    formData,
    'materialsEn',
    input.materialsEn,
  );

  appendOptional(
    formData,
    'heightMm',
    input.heightMm,
  );

  appendOptional(
    formData,
    'widthMm',
    input.widthMm,
  );

  appendOptional(
    formData,
    'depthMm',
    input.depthMm,
  );

  if (input.priceType) {
    formData.append(
      'priceType',
      input.priceType,
    );

    if (input.priceType === 'FIXED') {
      appendOptional(
        formData,
        'priceAmount',
        input.priceAmount,
      );

      const currency = input.priceCurrency
        ?.trim()
        .toUpperCase();

      appendOptional(
        formData,
        'priceCurrency',
        currency,
      );
    }
  }

  formData.append(
    'sortOrder',
    input.sortOrder,
  );

  formData.append(
    'isPublished',
    String(input.isPublished),
  );

  input.images.forEach((image) => {
    formData.append('images', image);
  });

  input.files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(productId)}/variants`,
    {
      method: 'POST',
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