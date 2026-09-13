import { useEffect } from 'react';
import {
  Outlet,
  useLocation,
} from 'react-router';

import {
  useLocale,
} from '../../shared/lib/i18n';

import { Header } from '../../widgets/header';

export function SiteLayout() {
  const { pathname } = useLocation();

  const {
    isLocaleChanging,
  } = useLocale();

  /*
   * Убираем локаль из пути.
   * Благодаря этому переключение /ru на /en
   * не сбрасывает прокрутку страницы наверх.
   */
  const contentPath =
    pathname.replace(
      /^\/(?:ru|en)(?=\/|$)/,
      '',
    ) || '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [contentPath]);

  return (
    <>
      <Header />

      <div
        aria-busy={isLocaleChanging}
        className={`locale-page-transition ${
          isLocaleChanging
            ? 'locale-page-transition-out'
            : ''
        }`}
      >
        <Outlet />
      </div>
    </>
  );
}