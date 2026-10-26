import {
  Link,
} from 'react-router';

import {
  useLocale,
} from '../../../shared/lib/i18n';

const footerNavigation = [
  {
    path: '/about',
    label: {
      ru: 'о нас',
      en: 'about',
    },
  },
  {
    path: '/products',
    label: {
      ru: 'каталог',
      en: 'catalogue',
    },
  },
  {
    path: '/contacts',
    label: {
      ru: 'контакты',
      en: 'contacts',
    },
  },
];

export function Footer() {
  const {
    locale,
  } = useLocale();

  const labels =
  locale === 'ru'
    ? {
        email: 'почта',
        phone: 'телефон',
        website: 'сайт',
        tagline:
          'не мебель — идентичность',
      }
    : {
        email: 'email',
        phone: 'phone',
        website: 'website',
        tagline:
          'not furniture — an identity',
      };

  return (
    <footer
      className="site-footer site-mono"
      aria-label={
        locale === 'ru'
          ? 'Подвал сайта'
          : 'Website footer'
      }
    >
      <div className="site-footer-inner">
        <p className="site-footer-tagline">
          <span aria-hidden="true">
            [
          </span>

          <span>
            {labels.tagline}
          </span>

          <span aria-hidden="true">
            ]
          </span>
        </p>

        <nav
          className="site-footer-navigation"
          aria-label={
            locale === 'ru'
              ? 'Навигация в подвале'
              : 'Footer navigation'
          }
        >
          {footerNavigation.map(
            (item) => (
              <Link
                key={item.path}
                to={item.path}
                draggable={false}
                className="site-footer-navigation-link"
              >
                <span
                  aria-hidden="true"
                  className="site-footer-navigation-line"
                />

                <span>
                  {item.label[locale]}
                </span>

                <span
                  aria-hidden="true"
                  className="site-footer-navigation-line"
                />
              </Link>
            ),
          )}
        </nav>

        <address className="site-footer-contacts">
          <div className="site-footer-contact">
            <span className="site-footer-contact-label">
              {labels.email}
            </span>

            <a
              href="mailto:info@altioria.design"
              className="site-footer-contact-value"
            >
              info@altioria.design
            </a>
          </div>

          <div className="site-footer-contact">
            <span className="site-footer-contact-label">
              {labels.phone}
            </span>

            <a
              href="tel:+79255781966"
              className="site-footer-contact-value"
            >
              +7 (925) 578-19-66
            </a>
          </div>

          <div className="site-footer-contact">
            <span className="site-footer-contact-label">
              {labels.website}
            </span>

            <Link
              to="/"
              className="site-footer-contact-value"
            >
              altioria.ru
            </Link>
          </div>
        </address>
      </div>
    </footer>
  );
}