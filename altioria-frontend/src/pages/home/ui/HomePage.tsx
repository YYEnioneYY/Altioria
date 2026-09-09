import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { useLocale } from '../../../shared/lib/i18n';

import { homeContent } from '../config/home-content';

export function HomePage() {
  const { locale } = useLocale();
  const content = homeContent[locale];

  const aboutSectionRef = useRef<HTMLElement>(null);

  const [isRevealed, setIsRevealed] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (isRevealed) {
      return;
    }

    const section = aboutSectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsRevealed(true);
        observer.disconnect();
      },
      {
        threshold: 0.05,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [isRevealed]);

  const wordState = isRevealed
    ? 'translate-y-0 opacity-100 blur-0 [clip-path:inset(-0.2em_-0.4em_-0.2em_-0.12em)]'
    : 'translate-y-[1.05em] opacity-0 blur-[10px] [clip-path:inset(100%_-0.4em_0_-0.12em)]';

  const contentState = isRevealed
    ? 'translate-y-0 opacity-100'
    : 'translate-y-5 opacity-0';

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

        <section
          ref={aboutSectionRef}
          className="px-[clamp(1.15rem,5vw,4rem)] pb-10 pt-[clamp(4rem,8vw,6.5rem)] text-[#e8e8e8]"
        >
          <div
            key={locale}
            className="language-content-in mx-auto max-w-[58rem]"
          >
            <header className="mb-[clamp(3rem,6vw,5rem)]">
              <h1 className="mb-[clamp(2rem,4.5vw,3.25rem)] text-[2.75rem] font-medium leading-[0.99] tracking-[-0.055em] lowercase sm:text-[4rem] md:text-[6rem] lg:w-[calc(100vw-8rem)] lg:max-w-[90rem] lg:text-[9rem]">
                {content.headline.map((word, index) => (
                  <span
                    key={word}
                    className={`block ${
                      index === content.headline.length - 1
                        ? 'text-white'
                        : 'text-[#4d4d4d]'
                    }`}
                  >
                    <span
                      className={`inline-block transition-[opacity,transform,filter,clip-path] duration-[1200ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${wordState}`}
                      style={{
                        transitionDelay: `${index * 160}ms`,
                      }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              <p
                className={`text-[1.3rem] leading-[1.55] tracking-[-0.01em] transition-[opacity,transform] duration-[400ms] [transition-delay:520ms] sm:text-[clamp(0.98rem,1.65vw,1.4rem)] ${contentState}`}
              >
                {content.lead}
              </p>
            </header>

            <section
              className="mb-[clamp(2.5rem,5.5vw,3rem)] grid items-start gap-[clamp(1.5rem,3.5vw,2.75rem)] min-[901px]:grid-cols-[minmax(14rem,0.88fr)_minmax(16rem,1.12fr)]"
              aria-labelledby="oleg-klodt-heading"
            >
              <figure
                className={`m-0 w-full max-w-[26rem] transition-[opacity,transform] duration-[400ms] [transition-delay:580ms] min-[901px]:max-w-none ${contentState}`}
              >
                <img
                  src="/images/oleg-klodt.webp"
                  alt={content.personImageAlt}
                  draggable={false}
                  loading="lazy"
                  className="pointer-events-none block aspect-[3/4] w-full rounded-[clamp(1.15rem,2vw,1.5rem)] object-cover object-top grayscale"
                />
              </figure>

              <article
                className={`transition-[opacity,transform] duration-[400ms] [transition-delay:640ms] ${contentState}`}
              >
                <h2
                  id="oleg-klodt-heading"
                  className="mb-[1.1rem] text-[clamp(1.35rem,2.1vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.03em] text-white"
                >
                  {content.personName}
                </h2>

                <div className="space-y-[1.15em] text-[clamp(1.1rem,1.4vw,1.15rem)] leading-[1.55] tracking-[-0.01em] text-[#b4b4b4]">
                  {content.biography.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </section>

            <section
              className="text-[clamp(1.3rem,1.6vw,1.4rem)] leading-[1.55] tracking-[-0.01em]"
              aria-label={content.aboutLabel}
            >
              {content.story.map((paragraph, index) => (
                <p
                  key={paragraph.afterBrand}
                  className={`mb-[0.8em] transition-[opacity,transform] duration-[400ms] ${contentState}`}
                  style={{
                    transitionDelay: `${700 + index * 60}ms`,
                  }}
                >
                  {paragraph.beforeBrand}

                  <strong className="font-bold text-white">
                    Altioria
                  </strong>

                  {paragraph.afterBrand}
                </p>
              ))}

              <p
                className={`mt-[1.75em] transition-[opacity,transform] duration-[400ms] [transition-delay:880ms] ${contentState}`}
              >
                <strong className="font-bold text-white">
                  {content.closing}
                </strong>
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}