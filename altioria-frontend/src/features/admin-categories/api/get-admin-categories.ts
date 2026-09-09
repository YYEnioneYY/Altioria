export interface AdminCategory {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AdminCategoriesApiError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'AdminCategoriesApiError';
    this.status = status;
  }
}

export async function getAdminCategories(): Promise<
  AdminCategory[]
> {
  let response: Response;

  try {
    response = await fetch('/api/admin/categories', {
      method: 'GET',
      credentials: 'include',
    });
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
    throw new AdminCategoriesApiError(
      'Не удалось получить категории',
      response.status,
    );
  }

  return response.json() as Promise<AdminCategory[]>;
}