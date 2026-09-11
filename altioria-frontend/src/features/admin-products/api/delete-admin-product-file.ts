import {
  AdminProductsApiError,
} from './get-admin-products';

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

export async function deleteAdminProductFile(
  productId: string,
  fileId: string,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(
      `/api/admin/products/${encodeURIComponent(productId)}/files/${encodeURIComponent(fileId)}`,
      {
        method: 'DELETE',
        credentials: 'include',
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
      serverMessage ?? 'Не удалось удалить файл',
      response.status,
    );
  }
}