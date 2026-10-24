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
      if (variant === 'page') {
        return true;
      }

      if (typeof window === 'undefined') {
        return false;
      }

      return window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
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
  }, [
    isRevealed,
    variant,
  ]);

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
      ? 'relative z-10 -mt-[65dvh] pb-12 pt-0 min-[901px]:-mt-[50dvh] min-[901px]:pb-16'
      : 'pb-12 pt-[6.5rem] min-[901px]:pb-16 min-[901px]:pt-[7rem]';

  const lastStory =
    content.story[
      content.story.length - 1
    ];

  const conclusionContent =
    locale === 'ru'
      ? {
          tagline:
            'продолжение архитектуры в масштабе предмета',

          paragraphs: [
            'Со временем эта практика получила собственное имя. Так появилась Altioria — предметный дизайн, рождённый из архитектурного опыта и основанный на его принципах: точность пропорций, работа с материалами, внимание к деталям.',

            'Изделия Altioria формируются из архитектурного мышления и проходят долгий путь — от идеи и чертежа до ручной работы в мастерских. Этот процесс позволяет сохранить авторскую интонацию в каждой детали.',
          ],
        }
      : {
          tagline:
            'architecture continued at the scale of an object',

          paragraphs: [
            'Over time, this practice acquired a name of its own. This is how Altioria emerged — object design born from architectural experience and founded on its principles: precision of proportions, work with materials and attention to detail.',

            'Altioria pieces are shaped by architectural thinking and undergo a long journey — from an idea and drawing to handcrafting in the workshops. This process preserves the author’s intonation in every detail.',
          ],
        };

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
                    key={`${word}-${index}`}
                    className={`block w-max whitespace-nowrap ${position} ${color}`}
                  >
                    <span
                      className={`inline-block transition-[opacity,transform,filter] duration-[1100ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${wordState}`}
                      style={{
                        transitionDelay:
                          `${index * 140}ms`,
                      }}
                    >
                      {word.replace(/\.$/, '')}
                    </span>
                  </span>
                );
              },
            )}
          </h1>
        </header>

        <div className="about-editorial-grid">
          <p
            className={`about-editorial-lead text-[12px] font-normal leading-[1.35] text-white/80 transition-[opacity,transform] duration-700 min-[901px]:text-[14px] min-[901px]:leading-[1.3] ${contentState}`}
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
              className="pointer-events-none block h-auto w-full object-cover object-top"
            />
          </figure>

          <article
            className={`about-editorial-biography transition-[opacity,transform] duration-700 [transition-delay:160ms] ${contentState}`}
            aria-labelledby="oleg-klodt-heading"
          >
            <div className="mb-5 flex items-center justify-between min-[901px]:mb-7">
              <h2
                id="oleg-klodt-heading"
                className="site-mono text-[12px] font-normal leading-none tracking-[-0.02em] text-white min-[901px]:text-[13px]"
              >
                {content.personName}
              </h2>

              <div className="flex items-center gap-4 min-[901px]:hidden">
                <span
                  aria-hidden="true"
                  className="h-4 w-px shrink-0 bg-white/35"
                />

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="site-mono whitespace-nowrap text-[10px] font-normal lowercase text-white/60 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:text-white"
                >
                  {locale === 'ru'
                    ? 'наверх'
                    : 'up'}
                </button>

                <span
                  aria-hidden="true"
                  className="h-4 w-px shrink-0 bg-white/35"
                />
              </div>
            </div>

            <div className="about-biography-copy border-l border-white/35 pl-4 text-[13px] font-normal leading-[1.32] tracking-[-0.015em] text-white/75 min-[901px]:border-l-0 min-[901px]:border-r min-[901px]:pl-0 min-[901px]:pr-6 min-[901px]:text-[15px] min-[901px]:leading-[1.22]">
              {content.biography.map(
                (paragraph, index) => (
                  <p
                    key={`${paragraph}-${index}`}
                    className="mb-[1.15em] last:mb-0"
                  >
                    {paragraph}
                  </p>
                ),
              )}
            </div>
          </article>

          {lastStory && (
            <div
              className={`about-editorial-story text-[13px] font-normal leading-[1.32] tracking-[-0.015em] text-white/75 transition-[opacity,transform] duration-700 [transition-delay:200ms] min-[901px]:text-[15px] min-[901px]:leading-[1.22] ${contentState}`}
              aria-label={content.aboutLabel}
            >
              <p>
                {`${lastStory.beforeBrand}Altioria${lastStory.afterBrand}`}
              </p>
            </div>
          )}

          <aside
            className={`about-editorial-rail transition-opacity duration-700 [transition-delay:220ms] ${contentState}`}
            aria-label={
              locale === 'ru'
                ? 'Навигация по странице'
                : 'Page navigation'
            }
          >
            <div className="sticky top-[31dvh] flex items-center justify-center gap-5">
              <span
                aria-hidden="true"
                className="h-7 w-px shrink-0 bg-white/45"
              />

              <button
                type="button"
                onClick={scrollToTop}
                className="site-mono whitespace-nowrap px-1 text-[12px] font-normal lowercase text-white/70 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                {locale === 'ru'
                  ? 'наверх'
                  : 'up'}
              </button>

              <span
                aria-hidden="true"
                className="h-7 w-px shrink-0 bg-white/45"
              />
            </div>
          </aside>

        </div>

                <section
          className={`about-conclusion transition-[opacity,transform] duration-700 [transition-delay:260ms] ${contentState}`}
          aria-label={
            locale === 'ru'
              ? 'Философия Altioria'
              : 'Altioria philosophy'
          }
        >
          <div className="about-conclusion-brand">
            <img
              src="/images/altioria-logo.svg"
              alt="Altioria"
              draggable={false}
              loading="lazy"
              className="about-conclusion-logo"
            />

            <p className="about-conclusion-tagline site-mono">
              <span aria-hidden="true">
                —
              </span>

              <span>
                {conclusionContent.tagline}
              </span>
            </p>
          </div>

          <div className="about-conclusion-copy">
            {conclusionContent.paragraphs.map(
              (paragraph, index) => (
                <p
                  key={index}
                  className="about-conclusion-paragraph"
                >
                  {paragraph}
                </p>
              ),
            )}
          </div>
        </section>

      </div>
    </section>
  );
}