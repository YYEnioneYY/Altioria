import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router';

import {
  getCurrentAdmin,
  loginAdmin,
} from '../../../features/admin-auth';

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isCheckingSession, setIsCheckingSession] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    document.title = 'Вход в панель управления — Altioria';

    return () => {
      document.title = 'Altioria';
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
  
    async function checkExistingSession(): Promise<void> {
      try {
        await getCurrentAdmin();
      
        if (!isCancelled) {
          navigate('/admin-dashboard', {
            replace: true,
          });
        }
      } catch {

      } finally {
        if (!isCancelled) {
          setIsCheckingSession(false);
        }
      }
    }
  
     void checkExistingSession();
  
    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError('Введите имя пользователя и пароль');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await loginAdmin({
        username: normalizedUsername,
        password,
      });

      navigate('/admin-dashboard', {
        replace: true,
      });
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не удалось выполнить вход',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0c0c0c] text-white">
        <div
          role="status"
          aria-label="Проверка сессии"
          className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white"
        />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh select-none items-center justify-center overflow-hidden bg-[#0c0c0c] px-5 py-10 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.075),transparent_38%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[12%] w-px bg-white/[0.035]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[12%] w-px bg-white/[0.035]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%] text-[clamp(7rem,24vw,22rem)] font-medium leading-none tracking-[-0.07em] text-white/[0.018]"
      >
        Admin
      </div>

      <section className="relative z-10 w-full max-w-[27rem]">
        <Link
          to="/"
          aria-label="Вернуться на главную страницу"
          draggable={false}
          className="mx-auto mb-12 block w-[clamp(7rem,24vw,10rem)] opacity-90 transition-opacity duration-300 hover:opacity-60"
        >
          <img
            src="/images/altioria-logo.svg"
            alt="Altioria"
            draggable={false}
            className="pointer-events-none block w-full"
          />
        </Link>

        <div className="rounded-[1.75rem] border border-white/[0.09] bg-white/[0.035] p-6 shadow-[0_2rem_6rem_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <header className="mb-8">
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white/35">
              Administration
            </p>

            <h1 className="text-[clamp(1.8rem,5vw,2.4rem)] font-medium leading-tight tracking-[-0.04em]">
              Вход в систему
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Панель управления каталогом Altioria
            </p>
          </header>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/45">
                Username
              </span>

              <input
                type="text"
                name="username"
                value={username}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                disabled={isSubmitting}
                placeholder="Введите имя пользователя"
                onChange={(event) => {
                  setUsername(event.target.value);

                  if (error) {
                    setError(null);
                  }
                }}
                className="h-13 w-full select-text rounded-xl border border-white/10 bg-white/[0.055] px-4 text-base text-white outline-none transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-white/20 hover:bg-white/[0.07] focus:border-white/30 focus:bg-white/[0.075] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/45">
                Password
              </span>

              <span className="relative block">
                <input
                  type={
                    isPasswordVisible
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  value={password}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  placeholder="Введите пароль"
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                  className="h-13 w-full select-text rounded-xl border border-white/10 bg-white/[0.055] py-0 pl-4 pr-12 text-base text-white outline-none transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-white/20 hover:bg-white/[0.07] focus:border-white/30 focus:bg-white/[0.075] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="button"
                  aria-label={
                    isPasswordVisible
                      ? 'Скрыть пароль'
                      : 'Показать пароль'
                  }
                  disabled={isSubmitting}
                  onClick={() =>
                    setIsPasswordVisible(
                      (current) => !current,
                    )
                  }
                  className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/35 transition-colors duration-300 hover:text-white/75 disabled:cursor-not-allowed"
                >
                  {isPasswordVisible ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-[1.15rem] w-[1.15rem]"
                    >
                      <path
                        d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.6 10.6 0 0112 4c5.5 0 9 6 9 6a16.5 16.5 0 01-2.2 2.9M6.2 6.2C4.1 7.7 3 10 3 10s3.5 6 9 6a9 9 0 003.8-.8"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-[1.15rem] w-[1.15rem]"
                    >
                      <path
                        d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"
                        fill="none"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  )}
                </button>
              </span>
            </label>

            <div
              aria-live="polite"
              className="min-h-5"
            >
              {error && (
                <p className="text-sm text-[#d99595]">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-13 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-medium tracking-[0.03em] text-black transition-[background-color,transform,opacity] duration-300 hover:bg-[#d5d5d5] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                  Выполняется вход
                </span>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-white/25">
          Доступ только для администратора
        </p>
      </section>
    </main>
  );
}