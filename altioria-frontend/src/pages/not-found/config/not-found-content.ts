import type { Locale } from '../../../shared/lib/i18n';

interface NotFoundContent {
  documentTitle: string;
  eyebrow: string;
  titleMuted: string;
  titleAccent: string;
  description: string;

  homeButton: string;
  homeButtonLabel: string;

  productsButton: string;
  productsButtonLabel: string;

  footer: string;
}

export const notFoundContent = {
  ru: {
    documentTitle: 'Страница не найдена — Altioria',
    eyebrow: 'Ошибка 404',
    titleMuted: 'страница.',
    titleAccent: 'не найдена.',
    description:
      'Возможно, страница была перемещена, удалена или в адресе допущена ошибка.',

    homeButton: 'На главную',
    homeButtonLabel: 'Вернуться на главную страницу',

    productsButton: 'Посмотреть продукцию',
    productsButtonLabel: 'Перейти к продукции Altioria',

    footer: 'предметный дизайн, рождённый из архитектуры',
  },

  en: {
    documentTitle: 'Page not found — Altioria',
    eyebrow: 'Error 404',
    titleMuted: 'page.',
    titleAccent: 'not found.',
    description:
      'The page may have been moved, removed, or the address may be incorrect.',

    homeButton: 'Back home',
    homeButtonLabel: 'Return to the home page',

    productsButton: 'Explore products',
    productsButtonLabel: 'Explore Altioria products',

    footer: 'object design born from architecture',
  },
} satisfies Record<Locale, NotFoundContent>;