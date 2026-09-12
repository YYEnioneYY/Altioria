import {
  AdminProductVariantsApiError,
  type AdminProductVariant,
} from './get-admin-product-variants';

type VariantFile =
  AdminProductVariant['files'][number];

export async function reorderAdminProductVariantFiles(
  productId: string,
  variantId: string,
  fileIds: string[],
): Promise<VariantFile[]> {
  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(
      productId,
    )}/variants/${encodeURIComponent(
      variantId,
    )}/files/reorder`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileIds,
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
        'Не удалось сохранить порядок файлов';

    throw new AdminProductVariantsApiError(
      message,
      response.status,
    );
  }

  return (await response.json()) as VariantFile[];
}