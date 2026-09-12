import { AdminProductVariantsApiError } from './get-admin-product-variants';

async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(body?.message)) {
    return body.message.join(', ');
  }

  if (typeof body?.message === 'string') {
    return body.message;
  }

  if (response.status === 404) {
    return 'Исполнение товара не найдено';
  }

  return 'Не удалось удалить исполнение';
}

export async function deleteAdminProductVariant(
  productId: string,
  variantId: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new AdminProductVariantsApiError(
      await getErrorMessage(response),
      response.status,
    );
  }
}
