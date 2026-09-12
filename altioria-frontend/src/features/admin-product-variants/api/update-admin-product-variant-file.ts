import {
  AdminProductVariantsApiError,
  type AdminProductVariant,
} from './get-admin-product-variants';

type VariantFile =
  AdminProductVariant['files'][number];

interface UpdateAdminProductVariantFileInput {
  labelRu: string | null;
  labelEn: string | null;
}

export async function updateAdminProductVariantFile(
  productId: string,
  variantId: string,
  fileId: string,
  input: UpdateAdminProductVariantFileInput,
): Promise<VariantFile> {
  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(
      productId,
    )}/variants/${encodeURIComponent(
      variantId,
    )}/files/${encodeURIComponent(fileId)}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
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
        'Не удалось изменить подписи файла';

    throw new AdminProductVariantsApiError(
      message,
      response.status,
    );
  }

  return (await response.json()) as VariantFile;
}