import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  siteContent,
} from '../../../shared/config/site-content';

import {
  useLocale,
} from '../../../shared/lib/i18n';

interface AboutSectionProps {
  variant: 'home' | 'page';
}

export function AboutSection({
  variant,
}: AboutSectionProps) {
  const {
    locale,
  } = useLocale();

  const content =
    siteContent[locale];

  const sectionRef =
    useRef<HTMLElement>(null);

  const [isRevealed, setIsRevealed] =
    useState(() => {
      const prefersReducedMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

      return (
        variant === 'page' ||
        prefersReducedMotion
      );
    });

  useEffect(() => {
    if (
      variant === 'page' ||
      isRevealed
    ) {
      return;
    }

    const section =
      sectionRef.current;

    if (!section) {
      return;
    }

    const observer =
      new IntersectionObserver(
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
  }, [isRevealed, variant]);

  const wordState =
    isRevealed
      ? 'translate-y-0 opacity-100 blur-0'
      : 'translate-y-[0.8em] opacity-0 blur-[8px]';

  const contentState =
    isRevealed
      ? 'translate-y-0 opacity-100'
      : 'translate-y-5 opacity-0';

  const spacing =
    variant === 'home'
      ? 'pb-12 pt-3 min-[901px]:pb-16 min-[901px]:pt-4'
      : 'pb-12 pt-[6.5rem] min-[901px]:pb-16 min-[901px]:pt-[7rem]';

  const lastStory =
    content.story[
      content.story.length - 1
    ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className={`overflow-x-clip bg-black px-[15px] text-white min-[901px]:px-[29px] ${spacing}`}
    >
      <div
        key={locale}
        className="language-content-in mx-auto w-full max-w-[1600px]"
      >
        <header className="mb-9 min-[901px]:mb-[clamp(6rem,10vw,8rem)]">
          <h1 className="site-display w-full max-w-[1000px] overflow-visible text-[35px] font-normal uppercase leading-[0.88] tracking-[-0.035em] min-[901px]:text-[90px]">
            {content.headline.map(
              (word, index) => {
                const position =
                  locale === 'ru'
                    ? index === 0
                      ? 'ml-0'
                      : index === 1
                        ? 'ml-[42%] min-[901px]:ml-[43%]'
                        : 'ml-[58%] min-[901px]:ml-[60%]'
                    : index === 0
                      ? 'ml-0'
                      : index === 1
                        ? 'ml-[25%] min-[901px]:ml-[27%]'
                        : 'ml-[48%] min-[901px]:ml-[50%]';
              
                const color =
                  index ===
                  content.headline.length - 1
                    ? 'text-white'
                    : 'text-[#626266]';
              
                return (
                  <span
                    key={word}
                    className={`block w-max whitespace-nowrap ${position} ${color}`}
                  >
                    <span
                      className={`inline-block transition-[opacity,transform,filter] duration-[1100ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${wordState}`}
                      style={{
                        transitionDelay:
                          `${index * 140}ms`,
                      }}
                    >
                      {word.replace(
                        /\.$/,
                        '',
                      )}
                    </span>
                  </span>
                );
              },
            )}
          </h1>
        </header>

        <div className="about-editorial-grid">
          <p
            className={`about-editorial-lead site-mono max-w-[36rem] whitespace-pre-line text-[11px] font-normal leading-[1.12] tracking-[-0.025em] text-white transition-[opacity,transform] duration-700 min-[901px]:text-[clamp(11px,1.05vw,15px)] ${contentState}`}
          >
            {content.lead}
          </p>

          <figure
            className={`about-editorial-image m-0 transition-[opacity,transform] duration-700 [transition-delay:100ms] ${contentState}`}
          >
            <img
              src="/images/oleg-klodt.webp"
              alt={content.personImageAlt}
              draggable={false}
              loading="lazy"
              className="pointer-events-none block w-full object-cover object-top"
            />
          </figure>

          <article
            className={`about-editorial-biography transition-[opacity,transform] duration-700 [transition-delay:180ms] ${contentState}`}
            aria-labelledby="oleg-klodt-heading"
          >
            <div className="site-mono flex items-center justify-between gap-4 border-b border-white/20 pb-3 text-[10px] min-[901px]:text-[12px]">
              <h2
                id="oleg-klodt-heading"
                className="font-normal tracking-[-0.02em]"
              >
                {content.personName}
              </h2>

              <div className="flex shrink-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-white/35"
                />

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="font-normal lowercase text-white/60 transition-colors duration-300 hover:text-white"
                >
                  {locale === 'ru'
                    ? 'наверх'
                    : 'up'}
                </button>

                <span
                  aria-hidden="true"
                  className="h-4 w-px bg-white/35"
                />
              </div>
            </div>

            <div className="about-biography-copy mt-3 border-l border-white/35 pl-2 text-[12px] leading-[1.18] tracking-[-0.02em] text-white min-[901px]:max-w-[31rem] min-[901px]:text-[clamp(12px,1.05vw,16px)]">
              {content.biography.map(
                (paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-[1em] last:mb-0"
                  >
                    {paragraph}
                  </p>
                ),
              )}
            </div>
          </article>

          {lastStory && (
            <div
              className={`about-editorial-story site-mono max-w-[40rem] text-[10px] leading-[1.13] tracking-[-0.025em] text-white transition-[opacity,transform] duration-700 [transition-delay:260ms] min-[901px]:text-[clamp(10px,1vw,14px)] ${contentState}`}
              aria-label={
                content.aboutLabel
              }
            >
              <p>
                {lastStory.beforeBrand}

                <span>
                  Altioria
                </span>

                {lastStory.afterBrand}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}