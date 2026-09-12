import type { Locale } from '../../lib/i18n';

interface SeoProps {
  locale: Locale;
  title: string;
  description: string;
  path: string;

  image?: string;
  imageAlt?: string;

  type?: 'website' | 'product';

  noIndex?: boolean;

  jsonLd?: Record<string, unknown>;
}

const SITE_URL = 'https://altioria.ru';

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '';
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function buildUrl(
  locale: Locale,
  path: string,
): string {
  return `${SITE_URL}/${locale}${normalizePath(path)}`;
}

export function Seo({
  locale,
  title,
  description,
  path,
  image = `${SITE_URL}/images/og/altioria.webp`,
  imageAlt = 'Altioria',
  type = 'website',
  noIndex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle =
    title === 'Altioria'
      ? title
      : `${title} | Altioria`;

  const canonicalUrl =
    buildUrl(locale, path);

  const ruUrl =
    buildUrl('ru', path);

  const enUrl =
    buildUrl('en', path);

  const ogLocale =
    locale === 'ru'
      ? 'ru_RU'
      : 'en_US';

  const alternateOgLocale =
    locale === 'ru'
      ? 'en_US'
      : 'ru_RU';

  const jsonLdString =
    jsonLd
      ? JSON.stringify(jsonLd)
          .replace(/</g, '\\u003c')
      : null;

  return (
    <>
      <title>{fullTitle}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, follow'
            : 'index, follow, max-image-preview:large'
        }
      />

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      <link
        rel="alternate"
        hrefLang="ru"
        href={ruUrl}
      />

      <link
        rel="alternate"
        hrefLang="en"
        href={enUrl}
      />

      <link
        rel="alternate"
        hrefLang="x-default"
        href={ruUrl}
      />

      <meta
        property="og:type"
        content={type}
      />

      <meta
        property="og:site_name"
        content="Altioria"
      />

      <meta
        property="og:title"
        content={fullTitle}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:image:alt"
        content={imageAlt}
      />

      <meta
        property="og:locale"
        content={ogLocale}
      />

      <meta
        property="og:locale:alternate"
        content={alternateOgLocale}
      />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={fullTitle}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />

      {jsonLdString && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString,
          }}
        />
      )}
    </>
  );
}