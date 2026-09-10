import { AdminCategoriesApiError } from './get-admin-categories';

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
      return body.message[0] ?? null;
    }

    return body.message ?? null;
  } catch {
    return null;
  }
}

export async function reorderAdminCategories(
  categoryIds: string[],
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(
      '/api/admin/categories/reorder',
      {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
        },

        credentials: 'include',

        body: JSON.stringify({
          categoryIds,
        }),
      },
    );
  } catch {
    throw new AdminCategoriesApiError(
      'Не удалось подключиться к серверу',
      0,
    );
  }

  if (response.status === 401) {
    throw new AdminCategoriesApiError(
      'Сессия отсутствует или истекла',
      401,
    );
  }

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new AdminCategoriesApiError(
      serverMessage ??
        'Не удалось сохранить порядок категорий',
      response.status,
    );
  }
}