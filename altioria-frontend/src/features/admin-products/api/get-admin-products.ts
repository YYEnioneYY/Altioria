export type ProductPriceType =
  | 'FIXED'
  | 'ON_REQUEST';

export type ProductFileType =
  | 'PDF'
  | 'MODEL_3D';

export interface AdminProductCategory {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
}

export interface AdminProductImage {
  id: string;
  imageUrl: string;
  altRu: string | null;
  altEn: string | null;
  sortOrder: number;
}

export interface AdminProductFile {
  id: string;
  type: ProductFileType;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  labelRu: string | null;
  labelEn: string | null;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  categoryId: string;
  category: AdminProductCategory;

  slug: string;

  nameRu: string;
  nameEn: string;

  descriptionRu: string;
  descriptionEn: string;

  materialsRu: string | null;
  materialsEn: string | null;

  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;

  priceType: ProductPriceType;
  priceAmount: string | null;
  priceCurrency: string | null;

  sortOrder: number;
  isPublished: boolean;

  images: AdminProductImage[];
  files: AdminProductFile[];

  variantsCount: number;

  createdAt: string;
  updatedAt: string;
}

export class AdminProductsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'AdminProductsApiError';
    this.status = status;
  }
}

export async function getAdminProducts(): Promise<
  AdminProduct[]
> {
  let response: Response;

  try {
    response = await fetch(
      '/api/admin/products',
      {
        method: 'GET',
        credentials: 'include',

        headers: {
          Accept: 'application/json',
        },
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

  if (!response.ok) {
    throw new AdminProductsApiError(
      'Не удалось получить товары',
      response.status,
    );
  }

  const result: unknown =
    await response.json();

  if (!Array.isArray(result)) {
    throw new AdminProductsApiError(
      'Сервер вернул неправильный формат товаров',
      response.status,
    );
  }

  return result as AdminProduct[];
}