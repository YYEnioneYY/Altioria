import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { headerNavigation } from '../config/navigation';

import { LanguageSwitcher } from '../../../features/language-switcher';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  CatalogSearch,
} from '../../../features/catalog-search';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { locale } = useLocale();

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header-enter fixed select-none inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-[15px] text-white min-[1201px]:px-[60px] min-[1201px]:py-[25px] min-[1201px]:backdrop-blur-[6px]">
        <Link
          to="/"
          className="relative z-50 block"
          aria-label="Altioria — главная страница"
          draggable={false}
          onClick={closeMenu}
        >
          <img
            src="/images/altioria-logo.svg"
            alt="Altioria"
            className="block w-[100px]"
            draggable={false}
          />
        </Link>

        <nav
          className="hidden items-center gap-10 min-[1201px]:flex"
          aria-label="Основная навигация"
        >
          {headerNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              draggable={false}
              className="text-[17px] transition-colors duration-300 hover:text-[#8f8f8f]"
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 min-[1201px]:flex">
          <LanguageSwitcher />

          <div className="hidden items-center gap-3 min-[1201px]:flex">
            <CatalogSearch
              mode="desktop"
              onNavigate={closeMenu}
            />
          </div>
        </div>

        <button
          type="button"
          className="relative z-50 flex h-10 w-10 items-center justify-center min-[1201px]:hidden"
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <svg
            viewBox="0 0 100 100"
            className="h-10 w-10"
            aria-hidden="true"
          >
            <path
              className="fill-none stroke-white stroke-[5] [stroke-linecap:round] transition-[stroke-dashoffset] duration-[400ms]"
              style={{
                strokeDasharray: '40 172',
                strokeDashoffset: isMenuOpen ? -132 : 0,
              }}
              d="m 30,33 h 40 c 13.100415,0 14.380204,31.80258 6.899646,33.421777 -24.612039,5.327373 9.016154,-52.337577 -12.75751,-30.563913 l -28.284272,28.284272"
            />

            <path
              className="fill-none stroke-white stroke-[5] [stroke-linecap:round] transition-[stroke-dashoffset] duration-[400ms]"
              style={{
                strokeDasharray: '40 111',
                strokeDashoffset: isMenuOpen ? -71 : 0,
              }}
              d="m 70,50 c 0,0 -32.213436,0 -40,0 -7.786564,0 -6.428571,-4.640244 -6.428571,-8.571429 0,-5.895471 6.073743,-11.783399 12.286435,-5.570707 6.212692,6.212692 28.284272,28.284272 28.284272,28.284272"
            />

            <path
              className="fill-none stroke-white stroke-[5] [stroke-linecap:round] transition-[stroke-dashoffset] duration-[400ms]"
              style={{
                strokeDasharray: '40 172',
                strokeDashoffset: isMenuOpen ? -132 : 0,
              }}
              d="m 69.575405,67.073826 h -40 c -13.100415,0 -14.380204,-31.80258 -6.899646,-33.421777 24.612039,5.327373 -9.016154,52.337577 12.75751,30.563913 l 28.284272,-28.284272"
            />
          </svg>
        </button>
      </header>

      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        className={`fixed inset-0 select-none z-40 flex flex-col bg-[#0c0c0c] px-5 pb-8 pt-20 transition-transform duration-[400ms] min-[1201px]:hidden ${
          isMenuOpen
            ? 'pointer-events-auto translate-y-0'
            : 'pointer-events-none -translate-y-full'
        }`}
      >
        <div className="mb-[30px] flex items-center gap-3">
          <LanguageSwitcher
            tabIndex={isMenuOpen ? 0 : -1}
          />
        
          <div className="relative z-20 mb-[30px]">
            <CatalogSearch
              mode="mobile"
              tabIndex={isMenuOpen ? 0 : -1}
              onNavigate={closeMenu}
            />
          </div>
        </div>

        <nav
          className="flex flex-col gap-[5px]"
          aria-label="Мобильная навигация"
        >
          {headerNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              tabIndex={isMenuOpen ? 0 : -1}
              draggable={false}
              className="py-[10px] text-center text-white text-xl transition-colors duration-300 hover:text-[#8f8f8f]"
              onClick={closeMenu}
            >
              {item.label[locale]}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}