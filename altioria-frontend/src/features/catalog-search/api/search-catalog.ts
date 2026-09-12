export type SearchResultType =
  | 'CATEGORY'
  | 'PRODUCT'
  | 'PRODUCT_VARIANT';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  name: string;
  slug: string;
  categorySlug: string | null;
  variantSlug: string | null;
  parentProductName: string | null;
  imageUrl: string | null;
}

interface ApiErrorResponse {
  message?: string | string[];
}

export class CatalogSearchApiError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'CatalogSearchApiError';
    this.status = status;
  }
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

export async function searchCatalog(
  query: string,
  locale: 'ru' | 'en',
  limit = 10,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const searchParams =
    new URLSearchParams({
      q: query.trim(),
      locale,
      limit: String(limit),
    });

  let response: Response;

  try {
    response = await fetch(
      `/api/search?${searchParams.toString()}`,
      {
        method: 'GET',
        signal,
      },
    );
  } catch (error: unknown) {
    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw error;
    }

    throw new CatalogSearchApiError(
      'Не удалось подключиться к серверу',
      0,
    );
  }

  if (!response.ok) {
    const serverMessage =
      await getErrorMessage(response);

    throw new CatalogSearchApiError(
      serverMessage ??
        'Не удалось выполнить поиск',
      response.status,
    );
  }

  return response.json() as Promise<
    SearchResult[]
  >;
}