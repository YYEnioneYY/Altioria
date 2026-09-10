import {
  AdminCategoriesApiError,
  type AdminCategory,
} from './get-admin-categories';

export interface UpdateAdminCategoryInput {
  slug?: string;
  nameRu?: string;
  nameEn?: string;
  sortOrder?: number;
  isPublished?: boolean;
  removeImage?: boolean;
  image?: File;
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
      return body.message[0] ?? null;
    }

    return body.message ?? null;
  } catch {
    return null;
  }
}

export async function updateAdminCategory(
  categoryId: string,
  input: UpdateAdminCategoryInput,
): Promise<AdminCategory> {
  const formData = new FormData();

  if (input.slug !== undefined) {
    formData.append('slug', input.slug);
  }

  if (input.nameRu !== undefined) {
    formData.append('nameRu', input.nameRu);
  }

  if (input.nameEn !== undefined) {
    formData.append('nameEn', input.nameEn);
  }

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

  if (input.removeImage !== undefined) {
    formData.append(
      'removeImage',
      String(input.removeImage),
    );
  }

  if (input.image) {
    formData.append('image', input.image);
  }

  let response: Response;

  try {
    response = await fetch(
      `/api/admin/categories/${encodeURIComponent(categoryId)}`,
      {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
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
        'Не удалось обновить категорию',
      response.status,
    );
  }

  return response.json() as Promise<AdminCategory>;
}