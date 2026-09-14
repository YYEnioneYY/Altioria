import { Outlet } from 'react-router';

import { NoIndex } from '../../shared/ui/seo';

export function AdminNoIndexLayout() {
  return (
    <>
      <NoIndex
        title="Панель управления | Altioria"
        follow={false}
      />

      <Outlet />
    </>
  );
}