import type { Locale } from './locale-context';

export function getLocalizedPath(
  locale: Locale,
  path = '/',
): string {
  if (!path || path === '/') {
    return `/${locale}`;
  }

  return `/${locale}${
    path.startsWith('/')
      ? path
      : `/${path}`
  }`;
}