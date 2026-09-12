import type { Locale } from '../lib/i18n';

interface PageSeo {
  title: string;
  description: string;
}

interface SeoContent {
  home: PageSeo;
  about: PageSeo;
  products: PageSeo;
  contacts: PageSeo;
}

export const seoContent = {
  ru: {
    home: {
      title:
        'Авторская мебель и предметный дизайн',
      description:
        'Altioria — авторская мебель, освещение, зеркала и предметы интерьера Олега Клодта. Предметный дизайн, основанный на архитектурном подходе.',
    },

    about: {
      title:
        'Об Altioria и Олеге Клодте',
      description:
        'Altioria — предметный дизайн Олега Клодта, выросший из архитектурного опыта, работы с материалами, пропорциями и деталями.',
    },

    products: {
      title:
        'Авторская мебель и предметы интерьера',
      description:
        'Коллекция Altioria: авторская мебель, освещение, зеркала и предметы интерьера, созданные на основе архитектурного подхода Олега Клодта.',
    },

    contacts: {
      title: 'Контакты',
      description:
        'Контакты Altioria. Свяжитесь с нами по вопросам коллекции, приобретения предметов и сотрудничества.',
    },
  },

  en: {
    home: {
      title:
        'Designer Furniture and Collectible Object Design',
      description:
        'Altioria creates designer furniture, lighting, mirrors and interior objects by Oleg Klodt, shaped by an architectural approach to collectible design.',
    },

    about: {
      title:
        'About Altioria and Oleg Klodt',
      description:
        'Discover Altioria, Oleg Klodt’s object design practice shaped by architecture, proportion, materials and craftsmanship.',
    },

    products: {
      title:
        'Designer Furniture and Interior Objects',
      description:
        'Explore the Altioria collection of designer furniture, lighting, mirrors and interior objects created through Oleg Klodt’s architectural approach.',
    },

    contacts: {
      title: 'Contacts',
      description:
        'Contact Altioria regarding the collection, purchasing, projects and collaboration.',
    },
  },
} satisfies Record<Locale, SeoContent>;