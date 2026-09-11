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

  const [
    isPasswordVisible,
    setIsPasswordVisible,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    document.title =
      'Вход в панель управления — Altioria';

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.title = 'Altioria';

      document.body.style.overflow =
        previousOverflow;
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
        // Пользователь ещё не авторизован.
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

    const normalizedUsername =
      username.trim();

    if (!normalizedUsername || !password) {
      setError(
        'Введите имя пользователя и пароль',
      );

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
      <main className="relative flex h-dvh items-center justify-center overflow-hidden bg-[#080808] text-white">
        <div className="admin-login-grid pointer-events-none absolute inset-0" />

        <div
          role="status"
          aria-label="Проверка сессии"
          className="relative flex flex-col items-center gap-4"
        >
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white" />

          <span className="text-xs uppercase tracking-[0.18em] text-white/25">
            Проверка сессии
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#080808] text-white">
      {/* Фоновая сетка */}

      <div
        aria-hidden="true"
        className="admin-login-grid pointer-events-none absolute inset-0"
      />

      {/* Анимированные световые пятна */}

      <div
        aria-hidden="true"
        className="admin-login-orb-one pointer-events-none absolute left-[5%] top-[8%] h-[30rem] w-[30rem] rounded-full bg-white/[0.045] blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="admin-login-orb-two pointer-events-none absolute bottom-[-12rem] right-[-6rem] h-[35rem] w-[35rem] rounded-full bg-[#8f7d69]/[0.08] blur-[120px]"
      />

      <div className="relative z-10 grid h-dvh lg:grid-cols-[minmax(0,1.08fr)_minmax(32rem,0.92fr)]">
        {/* Левая выезжающая панель */}

        <aside className="admin-login-brand-enter relative hidden h-dvh overflow-hidden border-r border-white/[0.07] bg-[#0d0d0d]/80 px-[clamp(3rem,6vw,7rem)] py-12 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="admin-login-ring pointer-events-none absolute -bottom-[18rem] -left-[15rem] h-[42rem] w-[42rem] rounded-full border border-white/[0.055]"
          />

          <div
            aria-hidden="true"
            className="admin-login-ring-reverse pointer-events-none absolute -bottom-[12rem] -left-[9rem] h-[30rem] w-[30rem] rounded-full border border-white/[0.035]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent"
          />

          <div
            aria-hidden="true"
            className="admin-login-light-sweep pointer-events-none absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-transparent via-white/[0.025] to-transparent"
          />

          <Link
            to="/"
            aria-label="Вернуться на сайт Altioria"
            draggable={false}
            className="admin-login-copy-enter relative z-10 block w-[9rem] opacity-90 transition-opacity duration-500 hover:opacity-55"
          >
            <img
              src="/images/altioria-logo.svg"
              alt="Altioria"
              draggable={false}
              className="pointer-events-none block w-full"
            />
          </Link>

          <div className="admin-login-copy-enter relative z-10 max-w-[39rem]">
            <p className="mb-6 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white/30">
              Private workspace
            </p>

            <h1 className="text-[clamp(4.4rem,7.2vw,8rem)] font-medium leading-[0.82] tracking-[-0.065em]">
              Управление

              <span className="block text-white/20">
                каталогом.
              </span>
            </h1>

            <p className="mt-9 max-w-[28rem] text-[clamp(1rem,1.3vw,1.2rem)] font-light leading-[1.6] text-white/35">
              Закрытое пространство для управления
              предметами, категориями и коллекцией
              Altioria.
            </p>
          </div>

          <div className="admin-login-copy-enter relative z-10 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.2em] text-white/20">
            <span>Administration</span>

            <span>01 / 01</span>
          </div>
        </aside>

        {/* Правая часть */}

        <section className="relative flex h-dvh items-center justify-center overflow-hidden px-5 py-5 sm:px-10 lg:px-[clamp(3rem,7vw,7rem)]">
          <div className="admin-login-form-enter w-full max-w-[27rem]">
            {/* Логотип на мобильных устройствах */}
        
            <Link
              to="/"
              aria-label="Вернуться на сайт Altioria"
              draggable={false}
              className="mx-auto mb-8 block w-[7.5rem] opacity-90 transition-opacity duration-500 hover:opacity-55 lg:hidden"
            >
              <img
                src="/images/altioria-logo.svg"
                alt="Altioria"
                draggable={false}
                className="pointer-events-none block w-full"
              />
            </Link>
        
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-black/30 p-5 shadow-[0_2.5rem_8rem_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
        
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/[0.035] blur-3xl"
              />
        
              <header className="relative mb-7">
                <h2 className="text-[clamp(2rem,5vw,2.75rem)] font-medium leading-none tracking-[-0.05em]">
                  Вход
                </h2>
        
                <p className="mt-3 text-sm text-white/35">
                  Панель управления Altioria
                </p>
              </header>
        
              <form
                className="relative space-y-4"
                onSubmit={handleSubmit}
              >
                {/* Username */}
        
                <label className="group block">
                  <span className="mb-2 block text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/35 transition-colors duration-300 group-focus-within:text-white/65">
                    Username
                  </span>
        
                  <span className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-300 group-focus-within:text-white/60">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-[1.05rem] w-[1.05rem]"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
        
                        <path
                          d="M5.5 19c.7-3.6 3-5.5 6.5-5.5s5.8 1.9 6.5 5.5"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
        
                    <input
                      type="text"
                      name="username"
                      value={username}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={isSubmitting}
                      placeholder="Имя пользователя"
                      onChange={(event) => {
                        setUsername(event.target.value);
                    
                        if (error) {
                          setError(null);
                        }
                      }}
                      className="h-13 w-full select-text rounded-2xl border border-white/[0.09] bg-white/[0.04] pl-12 pr-4 text-base text-white outline-none transition-[border-color,background-color,box-shadow] duration-500 placeholder:text-white/18 hover:bg-white/[0.055] focus:border-white/25 focus:bg-white/[0.065] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.025)] disabled:cursor-not-allowed disabled:opacity-45"
                    />
                  </span>
                </label>
                  
                {/* Password */}
                  
                <label className="group block">
                  <span className="mb-2 block text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/35 transition-colors duration-300 group-focus-within:text-white/65">
                    Password
                  </span>
                  
                  <span className="relative block">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-300 group-focus-within:text-white/60">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-[1.05rem] w-[1.05rem]"
                      >
                        <rect
                          x="5.5"
                          y="10"
                          width="13"
                          height="9"
                          rx="2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
        
                        <path
                          d="M8.5 10V7.5a3.5 3.5 0 017 0V10"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                  
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
                      placeholder="Пароль"
                      onChange={(event) => {
                        setPassword(event.target.value);
                    
                        if (error) {
                          setError(null);
                        }
                      }}
                      className="h-13 w-full select-text rounded-2xl border border-white/[0.09] bg-white/[0.04] pl-12 pr-12 text-base text-white outline-none transition-[border-color,background-color,box-shadow] duration-500 placeholder:text-white/18 hover:bg-white/[0.055] focus:border-white/25 focus:bg-white/[0.065] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.025)] disabled:cursor-not-allowed disabled:opacity-45"
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
                      className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/30 transition-colors duration-300 hover:text-white/75 disabled:cursor-not-allowed"
                    >
                      {isPasswordVisible ? (
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-[1.1rem] w-[1.1rem]"
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
                          className="h-[1.1rem] w-[1.1rem]"
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
                  
                {/* Ошибка */}
                  
                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="flex items-center gap-3 rounded-xl border border-[#d99595]/15 bg-[#d99595]/[0.055] px-4 py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d99595]"
                    />
        
                    <p className="text-sm leading-snug text-[#e4aaaa]">
                      {error}
                    </p>
                  </div>
                )}
        
                {/* Кнопка входа */}
            
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group/button flex h-13 w-full items-center justify-between rounded-2xl bg-white px-5 text-sm font-medium tracking-[0.02em] text-black transition-[background-color,transform,opacity] duration-500 hover:bg-[#d5d5d5] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSubmitting ? (
                    <span className="flex w-full items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" />
                
                      Выполняется вход
                    </span>
                  ) : (
                    <>
                      <span>Войти</span>
                
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform duration-500 group-hover/button:translate-x-1"
                      >
                        <path
                          d="M5 12h14M14 7l5 5-5 5"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}