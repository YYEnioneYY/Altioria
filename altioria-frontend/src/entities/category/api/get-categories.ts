import type { Locale } from '../../../shared/lib/i18n';

import type { PublicCategory } from '../model/types';

export async function getCategories(
  locale: Locale,
  signal?: AbortSignal,
): Promise<PublicCategory[]> {
  const searchParams = new URLSearchParams({
    locale,
  });

  let response: Response;

  try {
    response = await fetch(
      `/api/categories?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      },
    );
  } catch (error: unknown) {
    if (signal?.aborted) {
      throw error;
    }

    throw new Error(
      'Не удалось подключиться к серверу',
    );
  }

  if (!response.ok) {
    throw new Error(
      'Не удалось получить категории',
    );
  }

  const result: unknown = await response.json();

  if (!Array.isArray(result)) {
    throw new Error(
      'Сервер вернул неправильный формат категорий',
    );
  }

  return result as PublicCategory[];
}