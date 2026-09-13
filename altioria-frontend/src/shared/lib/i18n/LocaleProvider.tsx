import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

const LOCALE_FADE_OUT_MS = 180;

function getSavedLocale(): Locale {
  const savedLocale = localStorage.getItem(
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

  const [
    isLocaleChanging,
    setIsLocaleChanging,
  ] = useState(false);

  const transitionTimeoutRef =
    useRef<number | null>(null);

  const transitionFrameRef =
    useRef<number | null>(null);

  const pathLocale = getLocaleFromPath(
    location.pathname,
  );

  const locale =
    pathLocale ?? fallbackLocale;

  useEffect(() => {
    localStorage.setItem(
      'altioria-locale',
      locale,
    );

    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(
    () => () => {
      if (
        transitionTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          transitionTimeoutRef.current,
        );
      }

      if (
        transitionFrameRef.current !== null
      ) {
        window.cancelAnimationFrame(
          transitionFrameRef.current,
        );
      }
    },
    [],
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (
        nextLocale === locale ||
        isLocaleChanging
      ) {
        return;
      }

      const currentLocale =
        getLocaleFromPath(
          location.pathname,
        );

      const applyLocale = () => {
        setFallbackLocale(nextLocale);

        // Админские URL не локализуем.
        if (!currentLocale) {
          return;
        }

        const segments =
          location.pathname.split('/');

        segments[1] = nextLocale;

        navigate(
          {
            pathname: segments.join('/'),
            search: location.search,
            hash: location.hash,
          },
          {
            replace: true,
          },
        );
      };

      const prefersReducedMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

      if (prefersReducedMotion) {
        applyLocale();
        return;
      }

      // Сначала плавно скрываем страницу.
      setIsLocaleChanging(true);

      transitionTimeoutRef.current =
        window.setTimeout(() => {
          // Затем меняем язык.
          applyLocale();

          // Ждём отрисовку нового текста
          // и плавно показываем страницу.
          transitionFrameRef.current =
            window.requestAnimationFrame(() => {
              transitionFrameRef.current =
                window.requestAnimationFrame(
                  () => {
                    setIsLocaleChanging(false);

                    transitionFrameRef.current =
                      null;
                  },
                );
            });

          transitionTimeoutRef.current = null;
        }, LOCALE_FADE_OUT_MS);
    },
    [
      locale,
      isLocaleChanging,
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
      isLocaleChanging,
    }),
    [
      locale,
      setLocale,
      isLocaleChanging,
    ],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}