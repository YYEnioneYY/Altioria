import type { Locale } from '../../../shared/lib/i18n';

interface ContactsContent {
  heading: string;
  pageTitle: string;
  contactsLabel: string;
  emailLinkLabel: string;
  phoneLinkLabel: string;
  websiteLinkLabel: string;
}

export const contactsContent = {
  ru: {
    heading: 'Контакты',
    pageTitle: 'Контакты — Altioria',
    contactsLabel: 'Контактная информация',
    emailLinkLabel: 'Написать на электронную почту',
    phoneLinkLabel: 'Позвонить в Altioria',
    websiteLinkLabel: 'Открыть сайт Altioria',
  },

  en: {
    heading: 'Contacts',
    pageTitle: 'Contacts — Altioria',
    contactsLabel: 'Contact information',
    emailLinkLabel: 'Send an email',
    phoneLinkLabel: 'Call Altioria',
    websiteLinkLabel: 'Open the Altioria website',
  },
} satisfies Record<Locale, ContactsContent>;