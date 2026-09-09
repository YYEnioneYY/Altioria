import { Outlet } from 'react-router';

import { Header } from '../../widgets/header';

export function SiteLayout() {
  return (
    <>
      <Header />

      <Outlet />
    </>
  );
}