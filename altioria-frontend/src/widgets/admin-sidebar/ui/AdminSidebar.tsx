import type { ReactNode } from 'react';
import {
  Link,
  NavLink,
} from 'react-router';

import {
  adminNavigation,
  type AdminNavigationIcon,
} from '../config/navigation';

interface AdminSidebarProps {
  username: string;
  isOpen: boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  onClose: () => void;
  onLogout: () => void;
}

interface SidebarTooltipProps {
  children: ReactNode;
}

function SidebarTooltip({
  children,
}: SidebarTooltipProps) {
  return (
    <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-[70] -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#191919] px-3 py-2 text-xs font-medium text-white/75 opacity-0 shadow-[0_0.75rem_2rem_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

function NavigationIcon({
  icon,
}: {
  icon: AdminNavigationIcon;
}) {
  if (icon === 'categories') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          d="M4 7.5L12 3l8 4.5-8 4.5-8-4.5zM4 12l8 4.5 8-4.5M4 16.5L12 21l8-4.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (icon === 'products') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          d="M5 7.5L12 4l7 3.5v9L12 20l-7-3.5v-9zM5 7.5l7 3.5 7-3.5M12 11v9"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M10 5H6.5A1.5 1.5 0 005 6.5v11A1.5 1.5 0 006.5 19H10M14 8l4 4-4 4M18 12H9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function AdminSidebar({
  username,
  isOpen,
  isLoggingOut,
  logoutError,
  onClose,
  onLogout,
}: AdminSidebarProps) {
  const usernameInitial =
    username.charAt(0).toUpperCase();

  return (
    <>
      <aside
        aria-label="Навигация панели управления"
        className={`fixed inset-y-0 left-0 z-50 flex w-20 flex-col border-r border-white/[0.08] bg-[#101010] shadow-[1rem_0_4rem_rgba(0,0,0,0.3)] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? 'pointer-events-auto translate-x-0'
            : 'pointer-events-none -translate-x-full'
        } min-[900px]:pointer-events-auto min-[900px]:translate-x-0`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.045] blur-3xl" />
        </div>

        <div className="relative flex h-full flex-col">
          <header className="flex h-20 shrink-0 items-center justify-center border-b border-white/[0.07]">
            <Link
              to="/admin-dashboard"
              aria-label="Панель управления"
              draggable={false}
              onClick={onClose}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white text-xl font-semibold tracking-[-0.06em] text-black transition-transform duration-300 hover:scale-105 focus-visible:outline-none"
            >
              A

              <SidebarTooltip>
                Панель управления
              </SidebarTooltip>
            </Link>
          </header>

          <nav
            aria-label="Разделы панели управления"
            className="flex flex-1 flex-col items-center gap-3 pt-5"
          >
            {adminNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                aria-label={item.label}
                title={item.label}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex h-12 w-12 items-center justify-center rounded-xl transition-[background-color,color,transform] duration-250 focus-visible:outline-none ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/35 hover:scale-105 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                <NavigationIcon icon={item.icon} />

                <SidebarTooltip>
                  {item.label}
                </SidebarTooltip>
              </NavLink>
            ))}
          </nav>

          <footer className="flex shrink-0 flex-col items-center gap-3 border-t border-white/[0.07] py-4">
            <div
              tabIndex={0}
              aria-label={`Администратор ${username}`}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium uppercase text-white/50 outline-none transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:bg-white/[0.07] focus-visible:text-white"
            >
              {usernameInitial}

              <SidebarTooltip>
                {username}
              </SidebarTooltip>
            </div>

            <button
              type="button"
              aria-label="Выйти"
              title="Выйти"
              disabled={isLoggingOut}
              onClick={onLogout}
              className="group relative flex h-12 w-12 items-center justify-center rounded-xl text-white/30 transition-[background-color,color,transform] duration-250 hover:scale-105 hover:bg-[#d99595]/10 hover:text-[#e4aaaa] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isLoggingOut ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-current" />
              ) : (
                <LogoutIcon />
              )}

              <SidebarTooltip>
                {isLoggingOut
                  ? 'Завершение сессии'
                  : 'Выйти'}
              </SidebarTooltip>
            </button>
          </footer>
        </div>
      </aside>

      {logoutError && (
        <div
          role="alert"
          className="fixed bottom-5 left-5 z-[80] max-w-[18rem] rounded-xl border border-[#d99595]/20 bg-[#211515] px-4 py-3 text-sm text-[#e4aaaa] shadow-2xl min-[900px]:left-[5.75rem]"
        >
          {logoutError}
        </div>
      )}
    </>
  );
}