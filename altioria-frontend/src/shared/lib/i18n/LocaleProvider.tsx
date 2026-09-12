import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router';

import {
  LocaleContext,
  type Locale,
} from './locale-context';

interface LocaleProviderProps {
  children: ReactNode;
}

function getSavedLocale(): Locale {
  const savedLocale =
    localStorage.getItem(
      'altioria-locale',
    );

  return savedLocale === 'en'
    ? 'en'
    : 'ru';
}

function getLocaleFromPath(
  pathname: string,
): Locale | null {
  const firstSegment =
    pathname.split('/')[1];

  if (
    firstSegment === 'ru' ||
    firstSegment === 'en'
  ) {
    return firstSegment;
  }

  return null;
}

export function LocaleProvider({
  children,
}: LocaleProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [fallbackLocale, setFallbackLocale] =
    useState<Locale>(getSavedLocale);

  const pathLocale =
    getLocaleFromPath(
      location.pathname,
    );

  const locale =
    pathLocale ?? fallbackLocale;

  useEffect(() => {
    localStorage.setItem(
      'altioria-locale',
      locale,
    );

    document.documentElement.lang =
      locale;
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setFallbackLocale(nextLocale);

      const currentLocale =
        getLocaleFromPath(
          location.pathname,
        );

      // Admin URL не локализуем.
      if (!currentLocale) {
        return;
      }

      const segments =
        location.pathname.split('/');

      segments[1] = nextLocale;

      navigate(
        {
          pathname:
            segments.join('/'),
          search:
            location.search,
          hash:
            location.hash,
        },
      );
    },
    [
      location.pathname,
      location.search,
      location.hash,
      navigate,
    ],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [
      locale,
      setLocale,
    ],
  );

  return (
    <LocaleContext.Provider
      value={value}
    >
      {children}
    </LocaleContext.Provider>
  );
}