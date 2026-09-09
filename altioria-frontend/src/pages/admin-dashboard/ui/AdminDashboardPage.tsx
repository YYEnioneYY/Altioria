import { useEffect } from 'react';
import { useOutletContext } from 'react-router';

import type { AdminLoginResult } from '../../../features/admin-auth';

interface AdminLayoutContext {
  admin: AdminLoginResult['admin'];
}

export function AdminDashboardPage() {
  const { admin } =
    useOutletContext<AdminLayoutContext>();

  useEffect(() => {
    document.title = 'Панель управления — Altioria';

    return () => {
      document.title = 'Altioria';
    };
  }, []);

  return (
    <section>
      <header className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/25">
          Administration
        </p>

        <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.055em]">
          Страница
          <span className="block text-white/20">
            администратора
          </span>
        </h1>

        <p className="mt-5 max-w-[35rem] text-base leading-relaxed text-white/40">
          Добро пожаловать,{' '}
          <strong className="font-medium text-white/75">
            {admin.username}
          </strong>
          . Здесь будет управление категориями,
          товарами и содержимым сайта.
        </p>
      </header>

      <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#91c89a] shadow-[0_0_0.8rem_rgba(145,200,154,0.7)]" />

          <p className="text-sm text-white/65">
            Панель управления работает
          </p>
        </div>
      </div>
    </section>
  );
}