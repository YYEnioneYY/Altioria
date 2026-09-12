import {
  AdminProductVariantsApiError,
  type AdminProductVariant,
} from './get-admin-product-variants';

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

  return 'Не удалось сохранить порядок исполнений';
}

export async function reorderAdminProductVariants(
  productId: string,
  variantIds: string[],
): Promise<AdminProductVariant[]> {
  const response = await fetch(
    `/api/admin/products/${encodeURIComponent(productId)}/variants/reorder`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variantIds }),
    },
  );

  if (!response.ok) {
    throw new AdminProductVariantsApiError(
      await getErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as AdminProductVariant[];
}
