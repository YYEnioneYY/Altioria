import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  LocaleContext,
  type Locale,
} from './locale-context';

interface LocaleProviderProps {
  children: ReactNode;
}

function getInitialLocale(): Locale {
  const savedLocale = localStorage.getItem('altioria-locale');

  return savedLocale === 'en' ? 'en' : 'ru';
}

export function LocaleProvider({
  children,
}: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem('altioria-locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}