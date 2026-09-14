import {
  useEffect,
  useState,
} from 'react';

import {
  getSystemHealth,
  type HealthServiceStatus,
  type SystemHealth,
} from '../../../entities/system-health';

const HEALTH_CHECK_INTERVAL_MS =
  30_000;

function formatCheckTime(
  timestamp: string | undefined,
): string {
  if (!timestamp) {
    return 'нет данных';
  }

  const date = new Date(timestamp);

  if (
    Number.isNaN(date.getTime())
  ) {
    return 'нет данных';
  }

  return new Intl.DateTimeFormat(
    'ru-RU',
    {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  ).format(date);
}

function ServiceStatus({
  label,
  status,
}: {
  label: string;
  status:
    | HealthServiceStatus
    | null;
}) {
  const isUp = status === 'up';

  return (
    <span className="flex items-center justify-between gap-6">
      <span className="text-white/45">
        {label}
      </span>

      <span
        className={`inline-flex items-center gap-1.5 ${
          isUp
            ? 'text-[#a7d6ae]'
            : status === 'down'
              ? 'text-[#e4aaaa]'
              : 'text-white/25'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isUp
              ? 'bg-[#91c89a]'
              : status === 'down'
                ? 'bg-[#d99595]'
                : 'bg-white/20'
          }`}
        />

        {isUp
          ? 'работает'
          : status === 'down'
            ? 'ошибка'
            : 'нет связи'}
      </span>
    </span>
  );
}

export function SystemHealthIndicator() {
  const [health, setHealth] =
    useState<SystemHealth | null>(
      null,
    );

  const [
    isChecking,
    setIsChecking,
  ] = useState(true);

  useEffect(() => {
    let isDisposed = false;

    let currentController:
      | AbortController
      | null = null;

    function checkHealth(): void {
      currentController?.abort();

      currentController =
        new AbortController();

      void getSystemHealth(
        currentController.signal,
      )
        .then((response) => {
          if (isDisposed) {
            return;
          }

          setHealth(response);
          setIsChecking(false);
        })
        .catch(
          (error: unknown) => {
            if (
              isDisposed ||
              (error instanceof
                DOMException &&
                error.name ===
                  'AbortError')
            ) {
              return;
            }

            setHealth(null);
            setIsChecking(false);
          },
        );
    }

    checkHealth();

    const intervalId =
      window.setInterval(
        checkHealth,
        HEALTH_CHECK_INTERVAL_MS,
      );

    return () => {
      isDisposed = true;

      currentController?.abort();

      window.clearInterval(
        intervalId,
      );
    };
  }, []);

  const isHealthy =
    health?.status === 'ok';

  const statusLabel = isChecking
    ? 'Проверяем состояние системы'
    : isHealthy
      ? 'Все системы работают'
      : health
        ? 'Обнаружена проблема'
        : 'API недоступен';

  const apiStatus:
    | HealthServiceStatus
    | null = health
    ? 'up'
    : isChecking
      ? null
      : 'down';

  return (
    <div
      tabIndex={0}
      role="status"
      aria-label={statusLabel}
      className="group relative flex h-12 w-12 items-center justify-center rounded-xl outline-none transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:ring-1 focus-visible:ring-white/25"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-5 w-5 transition-colors duration-300 ${
          isChecking
            ? 'animate-pulse text-white/30'
            : isHealthy
              ? 'text-[#91c89a]'
              : 'text-[#d99595]'
        }`}
      >
        <path
          d="M3.5 12h3l1.8-4.2 3.1 8.5 2.2-5.1 1.4 2.3h5.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />

        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.35"
        />
      </svg>

      <span
        aria-hidden="true"
        className={`absolute bottom-2 right-2 h-2 w-2 rounded-full border-2 border-[#101010] ${
          isChecking
            ? 'animate-pulse bg-white/35'
            : isHealthy
              ? 'bg-[#91c89a]'
              : 'bg-[#d99595]'
        }`}
      />

      <span className="pointer-events-none absolute bottom-0 left-[calc(100%+0.75rem)] z-[70] w-64 translate-x-1 rounded-xl border border-white/10 bg-[#191919] p-4 text-xs font-normal tracking-normal text-white/70 opacity-0 shadow-[0_0.75rem_2rem_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        <span className="mb-3 flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
          <span className="font-medium text-white/80">
            Состояние системы
          </span>

          <span
            className={`rounded-full px-2 py-1 text-[0.62rem] font-medium uppercase tracking-[0.08em] ${
              isChecking
                ? 'bg-white/[0.06] text-white/35'
                : isHealthy
                  ? 'bg-[#91c89a]/10 text-[#a7d6ae]'
                  : 'bg-[#d99595]/10 text-[#e4aaaa]'
            }`}
          >
            {isChecking
              ? 'проверка'
              : isHealthy
                ? 'работает'
                : 'ошибка'}
          </span>
        </span>

        <span className="flex flex-col gap-2.5">
          <ServiceStatus
            label="API"
            status={apiStatus}
          />

          <ServiceStatus
            label="PostgreSQL"
            status={
              health?.services
                .database ?? null
            }
          />

          <ServiceStatus
            label="MinIO"
            status={
              health?.services
                .storage ?? null
            }
          />
        </span>

        <span className="mt-3 block border-t border-white/[0.07] pt-3 text-[0.67rem] text-white/25">
          Последняя проверка:{' '}
          {formatCheckTime(
            health?.timestamp,
          )}
        </span>
      </span>
    </div>
  );
}