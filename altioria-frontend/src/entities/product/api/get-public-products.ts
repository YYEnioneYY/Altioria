import type {
  Locale,
} from '../../../shared/lib/i18n';

export type PublicProductPriceType =
  | 'FIXED'
  | 'ON_REQUEST';

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  coverImageUrl: string;

  priceType: PublicProductPriceType;
  priceAmount: string | null;
  priceCurrency: string | null;

  category: {
    slug: string;
    name: string;
  };
}

export class PublicProductsApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = 'PublicProductsApiError';
    this.status = status;
  }
}

export async function getPublicProducts(
  locale: Locale,
  category: string,
  signal?: AbortSignal,
): Promise<PublicProduct[]> {
  const searchParams = new URLSearchParams({
    locale,
    category,
  });

  const response = await fetch(
    `/api/products?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    },
  );

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as {
      message?: string | string[];
    } | null;

    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ??
        'Не удалось загрузить товары';

    throw new PublicProductsApiError(
      message,
      response.status,
    );
  }

  return (await response.json()) as PublicProduct[];
}