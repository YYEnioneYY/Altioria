import {
  Fragment,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
} from 'react-router';

import {
  headerNavigation,
} from '../config/navigation';

import {
  LanguageSwitcher,
} from '../../../features/language-switcher';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  CatalogSearch,
} from '../../../features/catalog-search';

export function Header() {
  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  const {
    locale,
  } = useLocale();

  const {
    pathname,
  } = useLocation();

  const isHomePage =
    /^\/(?:ru|en)?\/?$/.test(pathname);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const scrollPosition =
      window.scrollY;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousBodyPosition =
      document.body.style.position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyRight =
      document.body.style.right;

    const previousBodyWidth =
      document.body.style.width;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.documentElement.style.overflow =
      'hidden';

    document.body.style.overflow =
      'hidden';

    document.body.style.position =
      'fixed';

    document.body.style.top =
      `-${scrollPosition}px`;

    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.overflow =
        previousBodyOverflow;

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top =
        previousBodyTop;

      document.body.style.left =
        previousBodyLeft;

      document.body.style.right =
        previousBodyRight;

      document.body.style.width =
        previousBodyWidth;

      window.scrollTo(
        0,
        scrollPosition,
      );
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header-enter site-mono fixed inset-x-0 top-0 z-50 select-none bg-transparent text-white">
        {/* Desktop navbar */}
        <div
          className="hidden h-[82px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-[60px] will-change-transform min-[1201px]:grid"
          style={
            isHomePage
              ? {
                  transform:
                    'translate3d(0, var(--home-nav-offset, 0px), 0)',
                }
              : undefined
          }
        >
          <nav
            aria-label="Основная навигация"
            className="flex min-w-0 items-center"
          >
            {headerNavigation.map(
              (item, index) => (
                <Fragment key={item.path}>
                  <Link
                    to={item.path}
                    draggable={false}
                    className="whitespace-nowrap text-[17px] font-normal lowercase leading-none text-white transition-colors duration-300 hover:text-white/55 focus-visible:outline-none focus-visible:text-white/60"
                  >
                    {item.label[locale]}
                  </Link>

                  {index <
                    headerNavigation.length -
                      1 && (
                    <span
                      aria-hidden="true"
                      className="mx-[30px] h-7 w-px shrink-0 bg-white/35"
                    />
                  )}
                </Fragment>
              ),
            )}
          </nav>

          <Link
            to="/"
            aria-label="Altioria — главная страница"
            draggable={false}
            className="mx-10 block transition-opacity duration-200"
            style={
              isHomePage
                ? {
                    opacity:
                      'var(--home-header-logo-opacity, 0)',
                  }
                : {
                    opacity: 1,
                  }
            }
          >
            <img
              src="/images/altioria-logo.svg"
              alt="Altioria"
              draggable={false}
              className="block w-[210px]"
            />
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-5">
            <div className="w-[300px]">
              <CatalogSearch
                mode="desktop"
                onNavigate={closeMenu}
              />
            </div>

            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile navbar */}
        <div
          className="grid h-20 grid-cols-[1fr_auto_1fr] items-center px-5 will-change-transform min-[1201px]:hidden"
          style={
            isHomePage
              ? {
                  transform: isMenuOpen
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(0, var(--home-nav-offset, 0px), 0)',
                }
              : undefined
          }
        >
          <div className="justify-self-start">
            <LanguageSwitcher />
          </div>
        
          <span
            aria-hidden="true"
            className="block w-px"
          />

          <button
            type="button"
            aria-label={
              isMenuOpen
                ? 'Закрыть меню'
                : 'Открыть меню'
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() =>
              setIsMenuOpen(
                (current) => !current,
              )
            }
            className="relative z-50 flex h-11 w-11 items-center justify-center justify-self-end focus-visible:outline-none"
          >
            <span className="sr-only">
              Меню
            </span>
          
            <span
              className={`absolute h-px w-8 bg-white transition-transform duration-300 ${
                isMenuOpen
                  ? 'rotate-45'
                  : '-translate-y-[8px]'
              }`}
            />

            <span
              className={`absolute h-px w-8 bg-white transition-opacity duration-300 ${
                isMenuOpen
                  ? 'opacity-0'
                  : 'opacity-100'
              }`}
            />

            <span
              className={`absolute h-px w-8 bg-white transition-transform duration-300 ${
                isMenuOpen
                  ? '-rotate-45'
                  : 'translate-y-[8px]'
              }`}
            />
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        className={`site-mono fixed inset-0 z-40 flex flex-col bg-black px-5 pb-8 pt-[104px] text-white transition-[transform,opacity] duration-500 min-[1201px]:hidden ${
          isMenuOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0'
        }`}
      >
        <Link
          to="/"
          tabIndex={
            isMenuOpen ? 0 : -1
          }
          aria-label="Altioria — главная страница"
          draggable={false}
          onClick={closeMenu}
          className={`mx-auto mb-10 block transition-[opacity,transform] duration-500 ${
            isMenuOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-3 opacity-0'
          }`}
        >
          <img
            src="/images/altioria-logo.svg"
            alt="Altioria"
            draggable={false}
            className="block w-[160px]"
          />
        </Link>

        <div className="mb-10">
          <CatalogSearch
            mode="mobile"
            tabIndex={
              isMenuOpen ? 0 : -1
            }
            onNavigate={closeMenu}
          />
        </div>

        <nav
          aria-label="Мобильная навигация"
          className="flex flex-col border-t border-white/20"
        >
          {headerNavigation.map(
            (item) => (
              <Link
                key={item.path}
                to={item.path}
                tabIndex={
                  isMenuOpen ? 0 : -1
                }
                draggable={false}
                onClick={closeMenu}
                className="border-b border-white/20 py-5 text-[22px] font-normal lowercase transition-colors duration-300 hover:text-white/50"
              >
                {item.label[locale]}
              </Link>
            ),
          )}
        </nav>
      </div>
    </>
  );
}