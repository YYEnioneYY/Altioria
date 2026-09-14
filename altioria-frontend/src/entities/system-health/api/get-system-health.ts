export type HealthServiceStatus =
  | 'up'
  | 'down';

export interface SystemHealth {
  status: 'ok' | 'error';
  timestamp: string;

  services: {
    database: HealthServiceStatus;
    storage: HealthServiceStatus;
  };
}

interface HealthErrorResponse {
  message?: unknown;
}

function isSystemHealth(
  value: unknown,
): value is SystemHealth {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<SystemHealth>;

  return (
    (candidate.status === 'ok' ||
      candidate.status === 'error') &&
    typeof candidate.timestamp ===
      'string' &&
    typeof candidate.services ===
      'object' &&
    candidate.services !== null &&
    (candidate.services.database ===
      'up' ||
      candidate.services.database ===
        'down') &&
    (candidate.services.storage ===
      'up' ||
      candidate.services.storage ===
        'down')
  );
}

export async function getSystemHealth(
  signal?: AbortSignal,
): Promise<SystemHealth> {
  const response = await fetch(
    '/api/health',
    {
      method: 'GET',
      cache: 'no-store',
      signal,
    },
  );

  const body: unknown =
    await response
      .json()
      .catch(() => null);

  if (isSystemHealth(body)) {
    return body;
  }

  const errorBody =
    body as HealthErrorResponse | null;
    
  if (
    isSystemHealth(errorBody?.message)
  ) {
    return errorBody.message;
  }

  throw new Error(
    response.ok
      ? 'Некорректный ответ сервера'
      : 'Сервис недоступен',
  );
}