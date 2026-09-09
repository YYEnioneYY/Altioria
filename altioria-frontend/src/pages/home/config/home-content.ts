import type { Locale } from '../../../shared/lib/i18n';

interface StoryParagraph {
  beforeBrand: string;
  afterBrand: string;
}

interface HomeContent {
  productsLinkLabel: string;
  logoAlt: string;
  heroTagline: string;

  headline: string[];
  lead: string;

  personName: string;
  personImageAlt: string;
  biography: string[];

  aboutLabel: string;
  story: StoryParagraph[];
  closing: string;
}

export const homeContent = {
  ru: {
    productsLinkLabel: 'Перейти к продукции Altioria',
    logoAlt: 'Altioria',
    heroTagline: 'Не мебель — идентичность',

    headline: [
      'пространство.',
      'логика.',
      'предмет.',
    ],

    lead:
      'Более двадцати пяти лет Олег Клодт проектирует частные резиденции и общественные пространства, в которых интерьер выстраивается как цельная архитектурная система. В этих проектах рождаются предметы — мебель, свет, зеркала — созданные не как самостоятельные объекты, а как естественное продолжение пространства и жизни внутри него.',

    personName: 'Олег Клодт',
    personImageAlt: 'Олег Клодт',

    biography: [
      'Олег Клодт родился в семье художников, в которой на протяжении многих поколений потомки знаменитого скульптора Петра Карловича Клодта выбирали жизненный путь, связанный с искусством.',

      'После окончания МАРХИ он основал архитектурное бюро. Для проектов Олега Клодта характерна благородная выдержанность стиля: его интерьеры отличаются изяществом и в то же время выполнены в простой интеллигентной манере. Прорабатывая каждый сантиметр пространства, Олег Клодт наполняет интерьер индивидуальными изделиями: специально для клиента архитектор разрабатывает дизайн встроенной и отдельно стоящей мебели, света и любых декоративных деталей. Результатом такой щепетильности становится неповторимость каждого интерьера.',
    ],

    aboutLabel: 'Об Altioria',

    story: [
      {
        beforeBrand:
          'Со временем эта практика получила собственное имя. Так появилась ',
        afterBrand:
          ' — предметный дизайн, рождённый из архитектурного опыта и основанный на его принципах: точность пропорций, работа с материалами, внимание к деталям.',
      },
      {
        beforeBrand: 'Изделия ',
        afterBrand:
          ' формируются из архитектурного мышления и проходят долгий путь — от идеи и чертежа до ручной работы в мастерских. Этот процесс позволяет сохранить авторскую интонацию в каждой детали.',
      },
      {
        beforeBrand: 'Каждый предмет из коллекции ',
        afterBrand:
          ' имеет индивидуальный номер и сопровождается архивной записью, фиксирующей его происхождение и дату создания. Многие объекты создаются для частных интерьеров и личных коллекций, поэтому значительная часть работ остаётся в единственном экземпляре.',
      },
    ],

    closing:
      'Altioria — это продолжение архитектуры в масштабе предмета.',
  },

  en: {
    productsLinkLabel: 'Explore Altioria products',
    logoAlt: 'Altioria',
    heroTagline: 'Not furniture — an identity',

    headline: [
      'space.',
      'logic.',
      'object.',
    ],

    lead:
      'For more than twenty-five years, Oleg Klodt has designed private residences and public spaces in which the interior is conceived as a coherent architectural system. These projects give rise to objects — furniture, lighting and mirrors — created not as standalone pieces, but as a natural extension of the space and the life within it.',

    personName: 'Oleg Klodt',
    personImageAlt: 'Oleg Klodt',

    biography: [
      'Oleg Klodt was born into a family of artists in which, for many generations, descendants of the renowned sculptor Peter Karlovich Klodt chose lives connected with art.',

      'After graduating from the Moscow Architectural Institute, he founded an architectural bureau. Oleg Klodt’s projects are defined by a noble restraint: his interiors are elegant yet executed with intelligent simplicity. Working through every centimetre of a space, Oleg Klodt fills it with bespoke pieces. For each client, the architect designs built-in and freestanding furniture, lighting and decorative details. This meticulous approach makes every interior unique.',
    ],

    aboutLabel: 'About Altioria',

    story: [
      {
        beforeBrand:
          'Over time, this practice acquired a name of its own. This is how ',
        afterBrand:
          ' emerged — object design born from architectural experience and grounded in its principles: precise proportions, thoughtful use of materials and attention to detail.',
      },
      {
        beforeBrand: '',
        afterBrand:
          ' pieces are shaped by architectural thinking and follow a long path — from an idea and a drawing to handcrafting in workshops. This process preserves the designer’s distinctive voice in every detail.',
      },
      {
        beforeBrand: 'Every object in the ',
        afterBrand:
          ' collection has an individual number and is accompanied by an archival record documenting its origin and date of creation. Many pieces are created for private interiors and personal collections, so a significant part of the work remains one of a kind.',
      },
    ],

    closing:
      'Altioria is architecture continued at the scale of an object.',
  },
} satisfies Record<Locale, HomeContent>;