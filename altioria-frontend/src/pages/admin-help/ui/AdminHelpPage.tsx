import {
  useEffect,
  type ReactNode,
} from 'react';

import { Link } from 'react-router';

interface GuideSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

interface GuideStepProps {
  number: number;
  title: string;
  children: ReactNode;
}

interface NoticeProps {
  title: string;
  children: ReactNode;
  tone?: 'neutral' | 'warning' | 'success';
}

const tableOfContents = [
  {
    id: 'quick-start',
    label: 'Порядок работы',
  },
  {
    id: 'categories',
    label: 'Категории',
  },
  {
    id: 'products',
    label: 'Товары',
  },
  {
    id: 'variants',
    label: 'Исполнения',
  },
  {
    id: 'images',
    label: 'Изображения',
  },
  {
    id: 'files',
    label: 'Файлы',
  },
  {
    id: 'publication',
    label: 'Публикация',
  },
  {
    id: 'common-errors',
    label: 'Частые вопросы',
  },
];

function GuideSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: GuideSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-8 rounded-[1.75rem] border border-white/[0.07] bg-white/[0.022] p-5 sm:p-7"
    >
      <header className="border-b border-white/[0.07] pb-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/25">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-[clamp(1.65rem,3vw,2.3rem)] font-medium leading-tight tracking-[-0.04em]">
          {title}
        </h2>

        <p className="mt-3 max-w-[48rem] text-sm leading-relaxed text-white/35">
          {description}
        </p>
      </header>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function GuideStep({
  number,
  title,
  children,
}: GuideStepProps) {
  return (
    <article className="flex gap-4 rounded-2xl border border-white/[0.06] bg-black/15 p-4 sm:p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-xs font-medium text-white/45">
        {number}
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-medium text-white/75">
          {title}
        </h3>

        <div className="mt-2 text-sm leading-relaxed text-white/35">
          {children}
        </div>
      </div>
    </article>
  );
}

function Notice({
  title,
  children,
  tone = 'neutral',
}: NoticeProps) {
  const toneClassName = {
    neutral:
      'border-white/[0.07] bg-white/[0.025] text-white/40',

    warning:
      'border-[#d7bd82]/15 bg-[#d7bd82]/[0.05] text-[#d7bd82]/75',

    success:
      'border-[#91c89a]/15 bg-[#91c89a]/[0.05] text-[#a7d6ae]/80',
  }[tone];

  return (
    <div
      className={`rounded-2xl border p-4 ${toneClassName}`}
    >
      <p className="text-sm font-medium">
        {title}
      </p>

      <div className="mt-2 text-xs leading-relaxed opacity-80">
        {children}
      </div>
    </div>
  );
}

function FieldRow({
  name,
  description,
  required = false,
}: {
  name: string;
  description: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2 border-b border-white/[0.06] py-4 last:border-0 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="flex items-center gap-2">
        <code className="text-xs text-white/55">
          {name}
        </code>

        {required && (
          <span className="rounded-md bg-[#d99595]/10 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-[#e4aaaa]">
            Обязательно
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-white/35">
        {description}
      </p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M5 12h14M14 7l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function AdminHelpPage() {
  useEffect(() => {
    document.title =
      'Справка администратора — Altioria';

    return () => {
      document.title = 'Altioria';
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[96rem] pb-20">
      <header className="mb-10 flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/55">
              ?
            </span>

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/25">
              Справочный центр
            </p>
          </div>

          <h1 className="max-w-[54rem] text-[clamp(2.8rem,7vw,5.3rem)] font-medium leading-[0.9] tracking-[-0.055em]">
            Как работать
            <span className="block text-white/20">
              с каталогом
            </span>
          </h1>

          <p className="mt-6 max-w-[46rem] text-sm leading-relaxed text-white/40">
            Здесь описан весь процесс: от создания
            категории до публикации товара и его
            дополнительных исполнений.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-[#d6d6d6]"
          >
            <span className="text-lg leading-none">
              +
            </span>

            Добавить товар
          </Link>

          <Link
            to="/admin/categories"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-5 text-sm text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            Открыть категории
          </Link>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <main className="min-w-0 space-y-6">
          <GuideSection
            id="quick-start"
            eyebrow="Начало работы"
            title="Правильный порядок заполнения"
            description="Чтобы товар корректно появился на сайте, выполняйте действия в следующем порядке."
          >
            <div className="space-y-3">
              <GuideStep
                number={1}
                title="Создайте категорию"
              >
                <p>
                  Например: «Столы», «Освещение» или
                  «Зеркала». Загрузите изображение
                  категории и заполните названия на
                  русском и английском языках.
                </p>
              </GuideStep>

              <GuideStep
                number={2}
                title="Создайте основной товар"
              >
                <p>
                  Выберите категорию, заполните
                  название, описание, материалы,
                  размеры и стоимость. Затем загрузите
                  фотографии и необходимые файлы.
                </p>
              </GuideStep>

              <GuideStep
                number={3}
                title="Проверьте карточку"
              >
                <p>
                  Убедитесь, что первая фотография
                  подходит для обложки, тексты
                  заполнены на двух языках, а цена
                  указана правильно.
                </p>
              </GuideStep>

              <GuideStep
                number={4}
                title="Добавьте исполнения при необходимости"
              >
                <p>
                  Если у товара есть другое
                  исполнение, цвет, материал или
                  размер, добавьте его внутри уже
                  созданного товара.
                </p>
              </GuideStep>

              <GuideStep
                number={5}
                title="Опубликуйте"
              >
                <p>
                  После проверки включите публикацию.
                  Только опубликованные категории,
                  товары и исполнения видны
                  посетителям сайта.
                </p>
              </GuideStep>
            </div>

            <div className="mt-5">
              <Notice
                title="Главное правило"
                tone="success"
              >
                Сначала создаётся категория, затем
                основной товар и только потом —
                дополнительные исполнения этого
                товара.
              </Notice>
            </div>
          </GuideSection>

          <GuideSection
            id="categories"
            eyebrow="Раздел 01"
            title="Категории"
            description="Категории объединяют товары и отображаются на первой странице публичного каталога."
          >
            <h3 className="text-base font-medium text-white/70">
              Как создать категорию
            </h3>

            <div className="mt-4 space-y-3">
              <GuideStep
                number={1}
                title="Откройте раздел «Категории»"
              >
                <p>
                  Нажмите иконку категорий в левой
                  панели администратора.
                </p>
              </GuideStep>

              <GuideStep
                number={2}
                title="Нажмите «Добавить категорию»"
              >
                <p>
                  Откроется форма создания. Заполните
                  обязательные поля и выберите
                  изображение.
                </p>
              </GuideStep>

              <GuideStep
                number={3}
                title="Сохраните категорию"
              >
                <p>
                  Если категория ещё не готова,
                  оставьте её черновиком. Опубликовать
                  её можно позже через изменение.
                </p>
              </GuideStep>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Поля категории
            </h3>

            <div className="mt-3 rounded-2xl border border-white/[0.06] bg-black/15 px-4">
              <FieldRow
                name="slug"
                required
                description="Адрес категории. Используйте английские строчные буквы, цифры и дефисы: tables, lighting, soft-furniture."
              />

              <FieldRow
                name="nameRu"
                required
                description="Название, которое увидят посетители русской версии сайта."
              />

              <FieldRow
                name="nameEn"
                required
                description="Название категории для английской версии сайта."
              />

              <FieldRow
                name="image"
                required
                description="Изображение карточки категории. Рекомендуется использовать качественную вертикальную фотографию."
              />

              <FieldRow
                name="sortOrder"
                description="Положение категории. Обычно его удобнее изменять через drag-and-drop."
              />

              <FieldRow
                name="isPublished"
                description="Определяет, показывается ли категория посетителям."
              />
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <Notice
                title="Публикация без изображения запрещена"
                tone="warning"
              >
                Категория без фотографии оставила бы
                пустую карточку в каталоге, поэтому
                система не позволит её опубликовать.
              </Notice>

              <Notice
                title="Изображение опубликованной категории"
                tone="warning"
              >
                Нельзя просто удалить изображение у
                опубликованной категории. Сначала
                загрузите новое или переведите
                категорию в черновик.
              </Notice>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Изменение порядка
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/35">
              Нажмите «Изменить порядок», зажмите
              специальную кнопку на карточке и
              перетащите категорию. После завершения
              обязательно нажмите «Сохранить порядок».
              Кнопка «Отмена» вернёт предыдущий
              порядок.
            </p>
          </GuideSection>

          <GuideSection
            id="products"
            eyebrow="Раздел 02"
            title="Основные товары"
            description="Основной товар — это полноценная карточка предмета. Даже если у него есть дополнительные исполнения, сначала всегда создаётся основной товар."
          >
            <h3 className="text-base font-medium text-white/70">
              Как добавить товар
            </h3>

            <div className="mt-4 space-y-3">
              <GuideStep
                number={1}
                title="Нажмите «Добавить товар»"
              >
                <p>
                  Кнопка находится на странице обзора
                  и в разделе со всеми товарами.
                </p>
              </GuideStep>

              <GuideStep
                number={2}
                title="Выберите категорию"
              >
                <p>
                  Товар обязательно должен относиться
                  к одной из существующих категорий.
                </p>
              </GuideStep>

              <GuideStep
                number={3}
                title="Заполните информацию"
              >
                <p>
                  Укажите slug, названия и описания на
                  двух языках. Материалы и размеры
                  заполняются при наличии данных.
                </p>
              </GuideStep>

              <GuideStep
                number={4}
                title="Выберите тип стоимости"
              >
                <p>
                  Можно указать фиксированную цену
                  либо выбрать вариант «По запросу».
                </p>
              </GuideStep>

              <GuideStep
                number={5}
                title="Загрузите фотографии и файлы"
              >
                <p>
                  Можно загрузить до 15 фотографий и
                  до 10 документов или 3D-моделей.
                  Первая фотография станет обложкой.
                </p>
              </GuideStep>

              <GuideStep
                number={6}
                title="Сохраните товар"
              >
                <p>
                  После создания откроется страница
                  товара, где можно проверить данные,
                  изменить их и добавить исполнения.
                </p>
              </GuideStep>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Основные поля товара
            </h3>

            <div className="mt-3 rounded-2xl border border-white/[0.06] bg-black/15 px-4">
              <FieldRow
                name="category"
                required
                description="Категория, в которой товар будет показан на сайте."
              />

              <FieldRow
                name="slug"
                required
                description="Уникальная часть адреса товара. Например: altair-i."
              />

              <FieldRow
                name="nameRu / nameEn"
                required
                description="Название товара на русском и английском языках."
              />

              <FieldRow
                name="descriptionRu / En"
                required
                description="Полное описание товара для обеих языковых версий."
              />

              <FieldRow
                name="materialsRu / En"
                description="Материалы изделия. Например: дуб, латунь, натуральный камень."
              />

              <FieldRow
                name="dimensions"
                description="Высота, ширина и глубина в миллиметрах."
              />

              <FieldRow
                name="priceType"
                required
                description="FIXED означает фиксированную стоимость, ON_REQUEST — стоимость по запросу."
              />

              <FieldRow
                name="images"
                required
                description="От 1 до 15 изображений. Первое изображение используется как обложка."
              />

              <FieldRow
                name="files"
                description="PDF-документы, GLB или GLTF-модели. Максимум 10 файлов."
              />
            </div>

            <div className="mt-5">
              <Notice
                title="Товар без исполнений — это нормально"
              >
                Если предмет существует только в одном
                варианте, достаточно создать основной
                товар. Дополнительное исполнение
                создавать не требуется.
              </Notice>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Как изменить товар
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/35">
              Откройте раздел «Товары», нажмите на
              нужную карточку, затем нажмите
              «Изменить». На странице изменения можно
              поменять данные и добавить новые
              изображения или файлы. Уже сохранённые
              изображения и файлы управляются
              отдельно внутри этой же страницы.
            </p>

            <div className="mt-5">
              <Notice
                title="Удаление товара"
                tone="warning"
              >
                При удалении основного товара также
                удаляются его фотографии, файлы и все
                дополнительные исполнения. Это
                действие нельзя отменить.
              </Notice>
            </div>
          </GuideSection>

          <GuideSection
            id="variants"
            eyebrow="Раздел 03"
            title="Дополнительные исполнения"
            description="Исполнение — это вариант существующего товара: другой материал, цвет, размер, отделка или комплектация."
          >
            <h3 className="text-base font-medium text-white/70">
              Когда нужно создавать исполнение
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                'Другой цвет или отделка',
                'Другой материал',
                'Другой размер',
                'Отдельная стоимость',
                'Собственные фотографии',
                'Собственные PDF или 3D-файлы',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/15 px-4 py-3"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" />

                  <p className="text-sm text-white/45">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Наследование данных
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/35">
              Исполнение не требует повторного
              заполнения всей информации. Если поле
              оставить пустым, оно возьмёт значение из
              основного товара.
            </p>

            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/15 px-4">
              <FieldRow
                name="nameRu / nameEn"
                required
                description="Название исполнения обязательно. Например: «Тёмный дуб» или «Белый мрамор»."
              />

              <FieldRow
                name="description"
                description="Если не заполнить, используется описание основного товара."
              />

              <FieldRow
                name="materials"
                description="Если не заполнить, используются материалы основного товара."
              />

              <FieldRow
                name="dimensions"
                description="Пустые размеры наследуются от основного товара."
              />

              <FieldRow
                name="price"
                description="Можно наследовать цену товара, задать другую цену или выбрать «По запросу»."
              />

              <FieldRow
                name="images"
                description="Если собственные изображения не загружены, используются изображения основного товара."
              />

              <FieldRow
                name="files"
                description="Файлы исполнения относятся только к нему и не заменяют файлы основного товара."
              />
            </div>

            <div className="mt-5">
              <Notice
                title="Не создавайте исполнение для основного товара"
                tone="warning"
              >
                Основной товар уже является полноценной
                карточкой. Исполнения нужны только для
                реальных дополнительных вариантов.
              </Notice>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Перестановка исполнений
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/35">
              На странице товара нажмите «Изменить
              порядок». Перетащите карточки за ручку
              из точек и сохраните результат. Именно в
              этом порядке исполнения будут показаны
              посетителям.
            </p>
          </GuideSection>

          <GuideSection
            id="images"
            eyebrow="Раздел 04"
            title="Работа с изображениями"
            description="Фотографии определяют внешний вид карточек товаров и исполнений в публичном каталоге."
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <Notice
                title="Первая фотография — обложка"
                tone="success"
              >
                Изображение на первой позиции
                отображается в списке товаров и первым
                открывается в галерее.
              </Notice>

              <Notice
                title="Поддерживаемые форматы"
              >
                Можно загружать JPG, JPEG, PNG и WEBP.
                Сервер оптимизирует изображения перед
                сохранением.
              </Notice>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Как поменять порядок
            </h3>

            <div className="mt-4 space-y-3">
              <GuideStep
                number={1}
                title="Откройте изменение товара или исполнения"
              >
                <p>
                  Управление находится в блоке уже
                  загруженных изображений.
                </p>
              </GuideStep>

              <GuideStep
                number={2}
                title="Нажмите «Изменить порядок»"
              >
                <p>
                  На изображениях появятся специальные
                  ручки из точек.
                </p>
              </GuideStep>

              <GuideStep
                number={3}
                title="Перетащите изображения"
              >
                <p>
                  Поместите нужную обложку на первую
                  позицию и расположите остальные
                  фотографии в правильной
                  последовательности.
                </p>
              </GuideStep>

              <GuideStep
                number={4}
                title="Сохраните порядок"
              >
                <p>
                  Пока кнопка «Сохранить порядок» не
                  нажата, изменения не отправлены на
                  сервер.
                </p>
              </GuideStep>
            </div>

            <div className="mt-5">
              <Notice
                title="Удаление изображения"
                tone="warning"
              >
                После подтверждения фотография
                удаляется не только из карточки, но и
                из файлового хранилища. Восстановить её
                можно только повторной загрузкой.
              </Notice>
            </div>
          </GuideSection>

          <GuideSection
            id="files"
            eyebrow="Раздел 05"
            title="PDF и 3D-файлы"
            description="К товару и его исполнениям можно прикреплять документы и модели, которые посетитель сможет открыть или скачать."
          >
            <div className="rounded-2xl border border-white/[0.06] bg-black/15 px-4">
              <FieldRow
                name="PDF"
                description="Каталог, техническое описание, инструкция, чертёж или спецификация."
              />

              <FieldRow
                name="GLB"
                description="Готовая упакованная 3D-модель. Обычно это наиболее удобный формат для сайта."
              />

              <FieldRow
                name="GLTF"
                description="Формат 3D-модели, который может использовать дополнительные внешние ресурсы."
              />
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Подписи файлов
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-white/35">
              У каждого сохранённого файла можно
              изменить русскую и английскую подпись.
              Например, вместо технического имени
              <code className="mx-1 rounded bg-white/[0.05] px-1.5 py-0.5 text-xs text-white/50">
                catalogue-final-2.pdf
              </code>
              посетитель увидит «Каталог товара».
            </p>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <Notice title="Если подпись не указана">
                На сайте будет использовано исходное
                имя загруженного файла.
              </Notice>

              <Notice title="Порядок файлов">
                Файлы можно переставить с помощью
                drag-and-drop так же, как фотографии.
              </Notice>
            </div>

            <div className="mt-5">
              <Notice
                title="Удаление файла"
                tone="warning"
              >
                Удалённый файл также удаляется из
                хранилища. Перед удалением убедитесь,
                что документ больше не нужен.
              </Notice>
            </div>
          </GuideSection>

          <GuideSection
            id="publication"
            eyebrow="Раздел 06"
            title="Черновики и публикация"
            description="Статус публикации позволяет подготовить карточку заранее и показать её посетителям только после проверки."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-white/[0.07] bg-black/15 p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/25" />

                  <h3 className="text-sm font-medium text-white/65">
                    Черновик
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-white/30">
                  Объект сохранён в панели
                  администратора, но не отображается
                  посетителям сайта. Используйте этот
                  статус, пока карточка не готова.
                </p>
              </article>

              <article className="rounded-2xl border border-[#91c89a]/15 bg-[#91c89a]/[0.04] p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#91c89a] shadow-[0_0_0.8rem_rgba(145,200,154,0.6)]" />

                  <h3 className="text-sm font-medium text-[#a7d6ae]">
                    Опубликовано
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#a7d6ae]/55">
                  Объект доступен посетителям в
                  публичном каталоге и может
                  появляться в результатах поиска.
                </p>
              </article>
            </div>

            <h3 className="mt-8 text-base font-medium text-white/70">
              Перед публикацией проверьте
            </h3>

            <ul className="mt-4 space-y-2">
              {[
                'Название заполнено на русском и английском языках',
                'Описание проверено на обеих языковых версиях',
                'Выбрана правильная категория',
                'Первая фотография подходит для обложки',
                'Фотографии расположены в правильном порядке',
                'Цена или статус «По запросу» указаны верно',
                'Размеры и материалы не содержат ошибок',
                'Файлы открываются и имеют понятные подписи',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl px-2 py-1.5 text-sm leading-relaxed text-white/40"
                >
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#91c89a]/20 bg-[#91c89a]/10 text-[0.6rem] text-[#a7d6ae]">
                    ✓
                  </span>

                  {item}
                </li>
              ))}
            </ul>
          </GuideSection>

          <GuideSection
            id="common-errors"
            eyebrow="Раздел 07"
            title="Частые вопросы"
            description="Ответы на ситуации, которые могут возникнуть при работе с каталогом."
          >
            <div className="space-y-3">
              <details className="group rounded-2xl border border-white/[0.06] bg-black/15 open:bg-white/[0.025]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white/65">
                  Почему объект не появился на сайте?

                  <span className="text-white/25 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/35">
                  Проверьте статус публикации самого
                  товара и его категории. Если
                  категория находится в черновике,
                  опубликованный товар внутри неё также
                  не будет доступен в каталоге.
                </div>
              </details>

              <details className="group rounded-2xl border border-white/[0.06] bg-black/15 open:bg-white/[0.025]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white/65">
                  Почему у исполнения фотографии товара?

                  <span className="text-white/25 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/35">
                  Это нормальное поведение. Если у
                  исполнения нет собственных
                  фотографий, оно автоматически
                  использует галерею основного товара.
                  Загрузите хотя бы одну собственную
                  фотографию, чтобы заменить галерею.
                </div>
              </details>

              <details className="group rounded-2xl border border-white/[0.06] bg-black/15 open:bg-white/[0.025]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white/65">
                  Почему не сохраняется фиксированная цена?

                  <span className="text-white/25 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/35">
                  Для фиксированной стоимости
                  необходимо заполнить сумму и
                  трёхбуквенный код валюты. Например:
                  RUB, EUR или USD.
                </div>
              </details>

              <details className="group rounded-2xl border border-white/[0.06] bg-black/15 open:bg-white/[0.025]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white/65">
                  Почему кнопка перестановки недоступна?

                  <span className="text-white/25 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/35">
                  Перестановка имеет смысл только при
                  наличии минимум двух элементов.
                  Поэтому для одной категории,
                  фотографии, файла или исполнения
                  кнопка отключена.
                </div>
              </details>

              <details className="group rounded-2xl border border-white/[0.06] bg-black/15 open:bg-white/[0.025]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white/65">
                  Почему после перестановки ничего не изменилось?

                  <span className="text-white/25 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/35">
                  После перетаскивания обязательно
                  нажмите «Сохранить порядок». Если
                  нажать «Отмена» или уйти со страницы,
                  предыдущий порядок будет сохранён.
                </div>
              </details>

              <details className="group rounded-2xl border border-white/[0.06] bg-black/15 open:bg-white/[0.025]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white/65">
                  Что делать, если загрузился неправильный файл?

                  <span className="text-white/25 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>

                <div className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/35">
                  Удалите неправильный файл и
                  загрузите правильный заново. Замену
                  содержимого существующего файла
                  система не выполняет.
                </div>
              </details>
            </div>
          </GuideSection>
        </main>

        <aside className="hidden xl:sticky xl:top-8 xl:block">
          <nav
            aria-label="Оглавление справки"
            className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.022] p-4"
          >
            <p className="px-3 text-[0.65rem] font-medium uppercase tracking-[0.17em] text-white/25">
              На этой странице
            </p>

            <div className="mt-3 space-y-1">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/35 transition-colors hover:bg-white/[0.045] hover:text-white"
                >
                  {item.label}

                  <span className="text-white/15 transition-transform group-hover:translate-x-0.5 group-hover:text-white/40">
                    →
                  </span>
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-4 rounded-[1.5rem] border border-[#91c89a]/15 bg-[#91c89a]/[0.04] p-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#91c89a] shadow-[0_0_0.7rem_rgba(145,200,154,0.55)]" />

              <p className="text-xs font-medium text-[#a7d6ae]">
                Система работает
              </p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#a7d6ae]/50">
              Все изменения сохраняются сразу после
              подтверждения соответствующего действия.
            </p>
          </div>

          <Link
            to="/admin-dashboard"
            className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            Вернуться к обзору

            <ArrowIcon />
          </Link>
        </aside>
      </div>
    </div>
  );
}