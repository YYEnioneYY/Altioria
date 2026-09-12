import {
  useEffect,
  useState,
} from 'react';
import {
  Outlet,
  useNavigate,
} from 'react-router';

import { NoIndex } from '../../shared/ui/seo';

import {
  getCurrentAdmin,
  logoutAdmin,
  type AdminLoginResult,
} from '../../features/admin-auth';
import { AdminSidebar } from '../../widgets/admin-sidebar';

export function AdminLayout() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState<
    AdminLoginResult['admin'] | null
  >(null);

  const [isCheckingSession, setIsCheckingSession] =
    useState(true);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [logoutError, setLogoutError] = useState<
    string | null
  >(null);

  useEffect(() => {
    let isCancelled = false;

    async function checkSession(): Promise<void> {
      try {
        const result = await getCurrentAdmin();

        if (!isCancelled) {
          setAdmin(result.admin);
        }
      } catch {
        if (!isCancelled) {
          navigate('/admin/login', {
            replace: true,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isSidebarOpen]);

  async function handleLogout(): Promise<void> {
    if (isLoggingOut) {
      return;
    }

    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logoutAdmin();

      navigate('/admin/login', {
        replace: true,
      });
    } catch (error: unknown) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : 'Не удалось выйти из системы',
      );

      setIsLoggingOut(false);
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

  if (!admin) {
    return null;
  }

  return (
    <>
      <NoIndex
        title="Altioria Admin"
        follow={false}
      />
      <div className="min-h-dvh bg-[#0c0c0c] text-white">
        <button
          type="button"
          aria-label="Закрыть меню"
          tabIndex={isSidebarOpen ? 0 : -1}
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity duration-300 min-[900px]:hidden ${
            isSidebarOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        />
  
        <AdminSidebar
          username={admin.username}
          isOpen={isSidebarOpen}
          isLoggingOut={isLoggingOut}
          logoutError={logoutError}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={() => void handleLogout()}
        />
  
        <header className="fixed inset-x-0 top-0 z-30 flex h-[4.5rem] items-center justify-between border-b border-white/[0.07] bg-[#0c0c0c]/90 px-5 backdrop-blur-xl min-[900px]:hidden">
          <img
            src="/images/altioria-logo.svg"
            alt="Altioria"
            draggable={false}
            className="pointer-events-none w-[7.5rem]"
          />
  
          <button
            type="button"
            aria-label="Открыть меню администратора"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path
                d="M5 8h14M5 12h14M5 16h14"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </header>
      
        <main className="min-h-dvh pt-[4.5rem] min-[900px]:pl-20 min-[900px]:pt-0">
          <div className="mx-auto w-full max-w-[110rem] px-5 py-8 sm:px-8 min-[900px]:px-10 min-[900px]:py-10">
            <Outlet
              context={{
                admin,
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}