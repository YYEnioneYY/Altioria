import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { Header } from '../../widgets/header';

export function SiteLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />

      <Outlet />
    </>
  );
}