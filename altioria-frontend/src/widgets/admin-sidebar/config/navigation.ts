export type AdminNavigationIcon =
  | 'dashboard'
  | 'categories'
  | 'products';

export interface AdminNavigationItem {
  label: string;
  path: string;
  icon: AdminNavigationIcon;
  end?: boolean;
}

export const adminNavigation: AdminNavigationItem[] = [
  {
    label: 'Обзор',
    path: '/admin-dashboard',
    icon: 'dashboard',
    end: true,
  },
  {
    label: 'Категории',
    path: '/admin/categories',
    icon: 'categories',
  },
  {
    label: 'Товары',
    path: '/admin/products',
    icon: 'products',
  },
];