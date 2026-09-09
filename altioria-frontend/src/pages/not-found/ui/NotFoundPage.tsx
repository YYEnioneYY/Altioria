import { useEffect } from 'react';
import { Link } from 'react-router';

import { useLocale } from '../../../shared/lib/i18n';

import { notFoundContent } from '../config/not-found-content';

export function NotFoundPage() {
  const { locale } = useLocale();
  const content = notFoundContent[locale];

  useEffect(() => {
    document.title = content.documentTitle;

    return () => {
      document.title = 'Altioria';
    };
  }, [content.documentTitle]);

  return (
    <main className="fixed inset-0 isolate select-none overflow-hidden overscroll-none bg-[#080808] text-white">
      <img
        src="/images/home-background.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 -z-30 h-full w-full scale-105 object-cover object-center opacity-[0.12]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_65%_35%,rgba(255,255,255,0.09),transparent_38%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-black/20 via-[#080808]/40 to-[#080808]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[8vw] -z-10 border-l border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[8vw] -z-10 border-r border-white/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <span className="translate-y-[8%] text-[clamp(15rem,45vw,44rem)] font-medium leading-none tracking-[-0.1em] text-white/[0.025] [-webkit-text-stroke:1px_rgba(255,255,255,0.08)]">
          404
        </span>
      </div>

      <section className="flex h-full items-center px-6 py-16 sm:px-10 lg:px-16">
        <div
          key={locale}
          className="language-content-in mx-auto w-full max-w-[90rem]"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.24em] text-white/40 sm:mb-7 sm:text-sm">
            {content.eyebrow}
          </p>

          <h1 className="text-[clamp(3.5rem,11vw,10rem)] font-medium leading-[0.86] tracking-[-0.06em] lowercase">
            <span className="block text-[#4d4d4d]">
              {content.titleMuted}
            </span>

            <span className="block text-white">
              {content.titleAccent}
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-relaxed text-white/50 sm:mt-10 sm:text-lg">
            {content.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
            <Link
              to="/"
              aria-label={content.homeButtonLabel}
              className="group inline-flex min-h-12 items-center gap-5 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#0c0c0c] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#dddddd]"
            >
              {content.homeButton}

              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <Link
              to="/products"
              aria-label={content.productsButtonLabel}
              className="group inline-flex min-h-12 items-center gap-5 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/70 backdrop-blur-sm transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
            >
              {content.productsButton}

              <span
                aria-hidden="true"
                className="text-white/40 transition-transform duration-300 group-hover:translate-x-1"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 py-5 text-[10px] uppercase tracking-[0.16em] text-white/25 sm:px-10 sm:text-xs lg:px-16">
        <span>Altioria</span>

        <span className="hidden sm:block">
          {content.footer}
        </span>
      </footer>
    </main>
  );
}