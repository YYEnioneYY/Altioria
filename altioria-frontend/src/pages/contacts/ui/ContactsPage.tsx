import {
  seoContent,
} from '../../../shared/config/seo-content';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  Seo,
} from '../../../shared/ui/seo';

interface ContactItem {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export function ContactsPage() {
  const {
    locale,
  } = useLocale();

  const seo =
    seoContent[locale].contacts;

  const contacts: ContactItem[] =
    locale === 'ru'
      ? [
          {
            label: 'почта',
            value:
              'info@altioria.design',
            href:
              'mailto:info@altioria.design',
          },
          {
            label: 'телефон',
            value:
              '+7 (925) 578-19-66',
            href:
              'tel:+79255781966',
          },
          {
            label: 'сайт',
            value: 'altioria.ru',
            href:
              'https://altioria.ru',
            external: true,
          },
        ]
      : [
          {
            label: 'email',
            value:
              'info@altioria.design',
            href:
              'mailto:info@altioria.design',
          },
          {
            label: 'phone',
            value:
              '+7 (925) 578-19-66',
            href:
              'tel:+79255781966',
          },
          {
            label: 'website',
            value: 'altioria.ru',
            href:
              'https://altioria.ru',
            external: true,
          },
        ];

  return (
    <>
      <Seo
        locale={locale}
        title={seo.title}
        description={seo.description}
        path="/contacts"
      />

      <main className="contacts-page">
        <section
          key={locale}
          className="contacts-page-grid language-content-in"
          aria-label={
            locale === 'ru'
              ? 'Контактная информация'
              : 'Contact information'
          }
        >
          {contacts.map(
            (contact) => (
              <div
                key={contact.label}
                className="contacts-page-item"
              >
                <span className="contacts-page-label">
                  {contact.label}
                </span>

                <a
                  href={contact.href}
                  target={
                    contact.external
                      ? '_blank'
                      : undefined
                  }
                  rel={
                    contact.external
                      ? 'noreferrer'
                      : undefined
                  }
                  className="contacts-page-value"
                >
                  {contact.value}
                </a>
              </div>
            ),
          )}
        </section>
      </main>
    </>
  );
}