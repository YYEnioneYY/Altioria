import {
  AdminProductVariantsApiError,
} from './get-admin-product-variants';

export async function deleteAdminProductVariantImage(
  productId: string,
  variantId: string,
  imageId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(
      productId,
    )}/variants/${encodeURIComponent(
      variantId,
    )}/images/${encodeURIComponent(imageId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
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
        'Не удалось удалить изображение';

    throw new AdminProductVariantsApiError(
      message,
      response.status,
    );
  }
}