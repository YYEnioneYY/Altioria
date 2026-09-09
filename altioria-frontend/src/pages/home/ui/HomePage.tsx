import { Link } from 'react-router';

import { siteContent } from '../../../shared/config/site-content';
import { useLocale } from '../../../shared/lib/i18n';
import { AboutSection } from '../../../widgets/about-section';

export function HomePage() {
  const { locale } = useLocale();
  const content = siteContent[locale];

  return (
    <div className="relative isolate select-none overflow-hidden bg-black text-white">
      <img
        src="/images/home-background.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
      />

      <main className="relative z-10">
        <section className="flex min-h-screen items-center justify-center text-center [height:100dvh]">
          <Link
            to="/products"
            className="flex h-full w-full items-center justify-center"
            draggable={false}
            aria-label={content.productsLinkLabel}
          >
            <div
              key={locale}
              className="language-content-in flex w-full flex-col items-center justify-center"
            >
              <img
                src="/images/altioria-logo.svg"
                alt={content.logoAlt}
                draggable={false}
                className="pointer-events-none block w-[min(86vw,1100px)] opacity-90 min-[1201px]:w-[70vw] min-[1201px]:max-w-[70vw]"
              />

              <p className="mt-[clamp(0.8rem,2vw,1.6rem)] text-[clamp(0.9rem,1.7vw,1.75rem)] font-light tracking-[-0.02em] text-[#4e4e4e]">
                {content.heroTagline}
              </p>
            </div>
          </Link>
        </section>

        <AboutSection variant="home" />
      </main>
    </div>
  );
}