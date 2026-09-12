import type {
  Locale,
} from '../../../shared/lib/i18n';

import {
  PublicProductsApiError,
  type PublicProductPriceType,
} from './get-public-products';

export type PublicProductFileType =
  | 'PDF'
  | 'MODEL_3D';

export interface PublicProductImage {
  id: string;
  imageUrl: string;
  alt: string | null;
  sortOrder: number;
}

export interface PublicProductFile {
  id: string;
  type: PublicProductFileType;
  fileUrl: string;
  originalName: string;
  label: string | null;
  sortOrder: number;
}

export interface PublicProductVariant {
  id: string;
  slug: string;
  name: string;
  description: string;
  materials: string | null;

  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;

  priceType: PublicProductPriceType;
  priceAmount: string | null;
  priceCurrency: string | null;

  usesProductImages: boolean;

  images: PublicProductImage[];
  files: PublicProductFile[];
}

export interface PublicProductDetails {
  id: string;
  slug: string;
  name: string;
  description: string;
  materials: string | null;

  heightMm: number | null;
  widthMm: number | null;
  depthMm: number | null;

  priceType: PublicProductPriceType;
  priceAmount: string | null;
  priceCurrency: string | null;

  category: {
    slug: string;
    name: string;
  };

  images: PublicProductImage[];
  files: PublicProductFile[];
  variants: PublicProductVariant[];
}

export async function getPublicProduct(
  slug: string,
  locale: Locale,
  category?: string,
  signal?: AbortSignal,
): Promise<PublicProductDetails> {
  const searchParams = new URLSearchParams({
    locale,
  });

  if (category) {
    searchParams.set(
      'category',
      category,
    );
  }

  const response = await fetch(
    `/api/products/${encodeURIComponent(
      slug,
    )}?${searchParams.toString()}`,
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
        'Не удалось загрузить товар';

    throw new PublicProductsApiError(
      message,
      response.status,
    );
  }

  return (await response.json()) as PublicProductDetails;
}