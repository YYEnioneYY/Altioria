import {
  AdminProductsApiError,
  type AdminProductFile,
} from './get-admin-products';

export interface UpdateAdminProductFileInput {
  labelRu: string | null;
  labelEn: string | null;
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

export async function updateAdminProductFile(
  productId: string,
  fileId: string,
  input: UpdateAdminProductFileInput,
): Promise<AdminProductFile> {
  let response: Response;

  try {
    response = await fetch(
      `/api/admin/products/${encodeURIComponent(productId)}/files/${encodeURIComponent(fileId)}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
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
      'Файл товара не найден',
      404,
    );
  }

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new AdminProductsApiError(
      serverMessage ??
        'Не удалось изменить подписи файла',
      response.status,
    );
  }

  return response.json() as Promise<
    AdminProductFile
  >;
}