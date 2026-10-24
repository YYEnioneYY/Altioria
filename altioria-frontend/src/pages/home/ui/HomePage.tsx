import {
  useEffect,
  useRef,
} from 'react';

import {
  Link,
} from 'react-router';

import {
  siteContent,
} from '../../../shared/config/site-content';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  Seo,
} from '../../../shared/ui/seo';

import {
  seoContent,
} from '../../../shared/config/seo-content';

import {
  AboutSection,
} from '../../../widgets/about-section';

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

function lerp(
  from: number,
  to: number,
  progress: number,
): number {
  return from + (to - from) * progress;
}

function smoothstep(
  progress: number,
): number {
  const value = clamp(progress, 0, 1);

  return (
    value *
    value *
    (3 - 2 * value)
  );
}

interface AnimatedHomeLogoProps {
  logoAlt: string;
  tagline: string;
  productsLinkLabel: string;
}

function AnimatedHomeLogo({
  logoAlt,
  tagline,
  productsLinkLabel,
}: AnimatedHomeLogoProps) {
  const logoRef =
    useRef<HTMLDivElement>(null);

  const taglineRef =
    useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root =
      document.documentElement;

    const logo =
      logoRef.current;

    const taglineElement =
      taglineRef.current;

    if (!logo || !taglineElement) {
      return;
    }

    let animationFrameId = 0;

    const updateAnimation = () => {
      animationFrameId = 0;

      const viewportWidth =
        window.innerWidth;

      const viewportHeight =
        window.innerHeight;

      const isDesktop =
        viewportWidth >= 1201;

      const reducedMotion =
        window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

      const headerHeight =
        isDesktop ? 82 : 80;
      const headerCenter =
        headerHeight / 2;

      const scrollDistance =
        Math.max(viewportHeight, 1);

      const rawProgress =
        reducedMotion
          ? 1
          : clamp(
              window.scrollY /
                scrollDistance,
              0,
              1,
            );

      const navProgress =
        smoothstep(rawProgress);

      /*
       * Navbar сначала находится внизу экрана,
       * затем поднимается наверх.
       */
      const navStartOffset =
        viewportHeight -
        headerHeight;

      const navOffset =
        navStartOffset *
        (1 - navProgress);

      root.style.setProperty(
        '--home-nav-offset',
        `${navOffset}px`,
      );

      /*
       * Когда логотип почти доехал до navbar,
       * большой логотип плавно исчезает,
       * а логотип внутри navbar появляется.
       */
      const logoHandoffProgress =
        smoothstep(
          clamp(
            (rawProgress - 0.72) /
              (0.88 - 0.72),
            0,
            1,
          ),
        );
      
      root.style.setProperty(
        '--home-header-logo-opacity',
        String(logoHandoffProgress),
      );

      logo.style.opacity =
        String(1 - logoHandoffProgress);

      logo.style.pointerEvents =
        logoHandoffProgress >= 0.9
          ? 'none'
          : 'auto';
      /*
       * До 55% прокрутки логотип уменьшается
       * и встречается с navbar.
       */
      const meetingPoint = isDesktop ? 0.55 : 0.58;

      const meetingProgress =
        smoothstep(
          rawProgress /
            meetingPoint,
        );

      const meetingNavProgress =
        smoothstep(meetingPoint);

      const meetingY =
        headerCenter +
        navStartOffset *
          (1 - meetingNavProgress);

      const initialY =
        viewportHeight *
        (isDesktop ? 0.43 : 0.48);

      const currentNavY =
        headerCenter + navOffset;

      const logoY =
        rawProgress <= meetingPoint
          ? lerp(
              initialY,
              meetingY,
              meetingProgress,
            )
          : currentNavY;
      
      const initialWidth =
        isDesktop
          ? Math.min(
              viewportWidth * 0.72,
              1100,
            )
          : Math.min(
              viewportWidth * 0.82,
              520,
            );
          
      const finalWidth =
        isDesktop ? 210 : 118;

      const logoWidth =
        lerp(
          initialWidth,
          finalWidth,
          meetingProgress,
        );

      logo.style.top =
        `${logoY}px`;

      logo.style.width =
        `${logoWidth}px`;

      /*
       * Подпись исчезает раньше,
       * чем логотип достигает navbar.
       */
      const taglineProgress =
        clamp(
          rawProgress / 0.32,
          0,
          1,
        );

      taglineElement.style.opacity =
        `${1 - taglineProgress}`;

      taglineElement.style.transform =
        `translate3d(
          0,
          ${-10 * taglineProgress}px,
          0
        )`;

      taglineElement.style.visibility =
        taglineProgress >= 1
          ? 'hidden'
          : 'visible';
    };

    const requestUpdate = () => {
      if (animationFrameId !== 0) {
        return;
      }

      animationFrameId =
        window.requestAnimationFrame(
          updateAnimation,
        );
    };

    updateAnimation();

    window.addEventListener(
      'scroll',
      requestUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      'resize',
      requestUpdate,
    );

    return () => {
      window.removeEventListener(
        'scroll',
        requestUpdate,
      );

      window.removeEventListener(
        'resize',
        requestUpdate,
      );

      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(
          animationFrameId,
        );
      }

      root.style.removeProperty(
        '--home-nav-offset',
      );

      root.style.removeProperty(
        '--home-header-logo-opacity',
      );
    };
  }, []);

  return (
    <>
      <div
        ref={logoRef}
        className="fixed left-1/2 top-[48vh] z-[80] w-[82vw] -translate-x-1/2 -translate-y-1/2 will-change-[top,width,opacity] min-[1201px]:top-[43vh]"
      >
        <Link
          to="/products"
          draggable={false}
          aria-label={productsLinkLabel}
          className="block w-full"
        >
          <img
            src="/images/altioria-logo.svg"
            alt={logoAlt}
            draggable={false}
            className="block h-auto w-full"
          />
        </Link>
        
        <p
          ref={taglineRef}
          className="site-mono absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[11px] font-normal lowercase tracking-[0.04em] text-white/35 will-change-[opacity,transform] min-[1201px]:text-[clamp(11px,1vw,16px)]"
        >
          <span aria-hidden="true">
            [
          </span>
            
          <span className="mx-2">
            {tagline}
          </span>
            
          <span aria-hidden="true">
            ]
          </span>
        </p>
      </div>
    </>
  );
}

export function HomePage() {
  const {
    locale,
  } = useLocale();

  const content =
    siteContent[locale];

  const seo =
    seoContent[locale].home;

  return (
    <>
      <Seo
        locale={locale}
        title={seo.title}
        description={seo.description}
        path="/"
        image="https://altioria.ru/images/og/altioria.jpg"
        jsonLd={{
          '@context':
            'https://schema.org',
          '@type': 'Organization',
          name: 'Altioria',
          url: 'https://altioria.ru',
          logo:
            'https://altioria.ru/images/altioria-logo.svg',
          email:
            'info@altioria.design',
          telephone:
            '+79255781966',
        }}
      />

        <main className="relative overflow-x-clip bg-black">
          {/*
           * Desktop-секция занимает две высоты экрана.
           * За одну дополнительную высоту происходит
           * скролл-анимация.
           */}
          <section className="relative h-[200dvh] bg-black">
            <div className="sticky top-0 h-[100dvh] bg-black">
              <AnimatedHomeLogo
                logoAlt={
                  content.logoAlt
                }
                tagline={
                  content.heroTagline
                }
                productsLinkLabel={
                  content.productsLinkLabel
                }
              />
            </div>
          </section>

          <AboutSection variant="home" />
        </main>
    </>
  );
}