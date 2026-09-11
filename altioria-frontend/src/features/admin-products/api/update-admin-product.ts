import {
  AdminProductsApiError,
  type AdminProduct,
} from './get-admin-products';

import type {
  CreateAdminProductInput,
} from './create-admin-product';

export type UpdateAdminProductInput = Omit<
  CreateAdminProductInput,
  'images' | 'files'
> & {
  images?: File[];
  files?: File[];
};

interface ApiErrorResponse {
  message?: string | string[];
}

async function getErrorMessage(
  response: Response,
): Promise<string | null> {
  try {
    const body =
      (await response.json()) as ApiErrorResponse;

    if (Array.isArray(body.message)) {
      return body.message.join('. ');
    }

    return body.message ?? null;
  } catch {
    return null;
  }
}

function appendOptional(
  formData: FormData,
  name: string,
  value: string | number | undefined,
): void {
  if (value === undefined) {
    return;
  }

  formData.append(name, String(value));
}

export async function updateAdminProduct(
  id: string,
  input: UpdateAdminProductInput,
): Promise<AdminProduct> {
  const formData = new FormData();

  formData.append('categoryId', input.categoryId);
  formData.append('slug', input.slug);
  formData.append('nameRu', input.nameRu);
  formData.append('nameEn', input.nameEn);
  formData.append(
    'descriptionRu',
    input.descriptionRu,
  );
  formData.append(
    'descriptionEn',
    input.descriptionEn,
  );
  formData.append('priceType', input.priceType);
  formData.append(
    'isPublished',
    String(input.isPublished),
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

  appendOptional(
    formData,
    'sortOrder',
    input.sortOrder,
  );

  if (input.priceType === 'FIXED') {
    appendOptional(
      formData,
      'priceAmount',
      input.priceAmount,
    );

    appendOptional(
      formData,
      'priceCurrency',
      input.priceCurrency,
    );
  }

  input.images?.forEach((image) => {
    formData.append('images', image);
  });

  input.files?.forEach((file) => {
    formData.append('files', file);
  });

  let response: Response;

  try {
    response = await fetch(
      `/api/admin/products/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      },
    );
  } catch {
    throw new AdminProductsApiError(
      'Не удалось подключиться к серверу',
      0,
    );
  }

  if (response.status === 401) {
    throw new AdminProductsApiError(
      'Сессия отсутствует или истекла',
      401,
    );
  }

  if (response.status === 404) {
    throw new AdminProductsApiError(
      'Товар или категория не найдены',
      404,
    );
  }

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new AdminProductsApiError(
      serverMessage ?? 'Не удалось изменить товар',
      response.status,
    );
  }

  return response.json() as Promise<AdminProduct>;
}