import {
  AdminProductVariantsApiError,
  type AdminProductVariant,
} from './get-admin-product-variants';

type VariantImage =
  AdminProductVariant['images'][number];

export async function reorderAdminProductVariantImages(
  productId: string,
  variantId: string,
  imageIds: string[],
): Promise<VariantImage[]> {
  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(
      productId,
    )}/variants/${encodeURIComponent(
      variantId,
    )}/images/reorder`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageIds,
      }),
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
        'Не удалось сохранить порядок изображений';

    throw new AdminProductVariantsApiError(
      message,
      response.status,
    );
  }

  return (await response.json()) as VariantImage[];
}