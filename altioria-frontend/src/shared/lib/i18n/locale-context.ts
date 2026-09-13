import { createContext } from 'react';

export type Locale = 'ru' | 'en';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLocaleChanging: boolean;
}

export const LocaleContext =
  createContext<LocaleContextValue | null>(null);