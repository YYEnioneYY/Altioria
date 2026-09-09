import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { headerNavigation } from '../config/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <header className="header-enter fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-[15px] text-white min-[1201px]:px-[60px] min-[1201px]:py-[25px] min-[1201px]:backdrop-blur-[6px]">
        <Link
          to="/"
          className="relative z-50 block"
          aria-label="Altioria — главная страница"
          onClick={closeMenu}
        >
          <img
            src="/images/altioria-logo.svg"
            alt="Altioria"
            className="block w-[100px]"
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
              className="text-[17px] transition-colors duration-300 hover:text-[#8f8f8f]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          role="search"
          className="hidden items-center rounded-[20px] bg-white/10 px-[15px] py-[5px] transition-transform duration-300 hover:scale-[1.02] min-[1201px]:flex"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search..."
            aria-label="Поиск по сайту"
            className="w-40 border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
          />

          <button
            type="submit"
            className="ml-2 mt-1 border-0 bg-transparent"
            aria-label="Найти"
          >
            <img
              src="/images/search-icon.svg"
              alt=""
              className="h-[15px] w-[15px] opacity-70"
            />
          </button>
        </form>

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
        className={`fixed inset-0 z-40 flex flex-col bg-[#0c0c0c] px-5 pb-8 pt-20 transition-transform duration-[400ms] min-[1201px]:hidden ${
          isMenuOpen
            ? 'pointer-events-auto translate-y-0'
            : 'pointer-events-none -translate-y-full'
        }`}
      >
        <form
          role="search"
          className="mb-[30px] flex items-center rounded-[20px] bg-white/10 px-[15px] py-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search..."
            aria-label="Поиск по сайту"
            tabIndex={isMenuOpen ? 0 : -1}
            className="w-full border-0 bg-transparent text-base text-white outline-none placeholder:text-white/50"
          />
        </form>

        <nav
          className="flex flex-col gap-[5px]"
          aria-label="Мобильная навигация"
        >
          {headerNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              tabIndex={isMenuOpen ? 0 : -1}
              className="py-[10px] text-center text-xl transition-colors duration-300 hover:text-[#8f8f8f]"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}