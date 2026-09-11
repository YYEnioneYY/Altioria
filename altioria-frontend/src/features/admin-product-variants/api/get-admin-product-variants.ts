export type AdminProductVariantPriceType =
  | 'FIXED'
  | 'ON_REQUEST';

export type AdminProductVariantFileType =
  | 'PDF'
  | 'MODEL_3D';

export interface AdminProductVariantImage {
  id: string;
  imageUrl: string;
  altRu: string | null;
  altEn: string | null;
  sortOrder: number;
}

export interface AdminProductVariantFile {
  id: string;
  type: AdminProductVariantFileType;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  labelRu: string | null;
  labelEn: string | null;
  sortOrder: number;
}

export interface AdminProductVariant {
  id: string;
  productId: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string | null;
  descriptionEn: string | null;
  materialsRu: string | null;
  materialsEn: string | null;
  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;
  priceType: AdminProductVariantPriceType | null;
  priceAmount: string | null;
  priceCurrency: string | null;
  sortOrder: number;
  isPublished: boolean;
  usesProductImages: boolean;
  images: AdminProductVariantImage[];
  files: AdminProductVariantFile[];
  createdAt: string;
  updatedAt: string;
}

export class AdminProductVariantsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'AdminProductVariantsApiError';
    this.status = status;
  }
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

export async function getAdminProductVariants(
  productId: string,
): Promise<AdminProductVariant[]> {
  let response: Response;

  try {
    response = await fetch(
      `/api/admin/products/${encodeURIComponent(productId)}/variants`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      },
    );
  } catch {
    throw new AdminProductVariantsApiError(
      'Не удалось подключиться к серверу',
      0,
    );
  }

  if (response.status === 401) {
    throw new AdminProductVariantsApiError(
      'Сессия отсутствует или истекла',
      401,
    );
  }

  if (response.status === 404) {
    throw new AdminProductVariantsApiError(
      'Товар не найден',
      404,
    );
  }

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new AdminProductVariantsApiError(
      serverMessage ??
        'Не удалось получить исполнения товара',
      response.status,
    );
  }

  return response.json() as Promise<
    AdminProductVariant[]
  >;
}