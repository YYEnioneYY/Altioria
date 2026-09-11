import {
  AdminProductsApiError,
  type AdminProduct,
  type ProductPriceType,
} from './get-admin-products';

export interface CreateAdminProductInput {
  categoryId: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  materialsRu?: string;
  materialsEn?: string;
  heightMm?: number;
  widthMm?: number;
  depthMm?: number;
  priceType: ProductPriceType;
  priceAmount?: string;
  priceCurrency?: string;
  sortOrder?: number;
  isPublished: boolean;
  images: File[];
  files: File[];
}

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

export async function createAdminProduct(
  input: CreateAdminProductInput,
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

  if (input.materialsRu) {
    formData.append(
      'materialsRu',
      input.materialsRu,
    );
  }

  if (input.materialsEn) {
    formData.append(
      'materialsEn',
      input.materialsEn,
    );
  }

  if (input.heightMm !== undefined) {
    formData.append(
      'heightMm',
      String(input.heightMm),
    );
  }

  if (input.widthMm !== undefined) {
    formData.append(
      'widthMm',
      String(input.widthMm),
    );
  }

  if (input.depthMm !== undefined) {
    formData.append(
      'depthMm',
      String(input.depthMm),
    );
  }

  if (input.priceType === 'FIXED') {
    if (input.priceAmount) {
      formData.append(
        'priceAmount',
        input.priceAmount,
      );
    }

    if (input.priceCurrency) {
      formData.append(
        'priceCurrency',
        input.priceCurrency,
      );
    }
  }

  if (input.sortOrder !== undefined) {
    formData.append(
      'sortOrder',
      String(input.sortOrder),
    );
  }

  input.images.forEach((image) => {
    formData.append('images', image);
  });

  input.files.forEach((file) => {
    formData.append('files', file);
  });

  let response: Response;

  try {
    response = await fetch('/api/admin/products', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
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

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new AdminProductsApiError(
      serverMessage ?? 'Не удалось создать товар',
      response.status,
    );
  }

  return response.json() as Promise<AdminProduct>;
}