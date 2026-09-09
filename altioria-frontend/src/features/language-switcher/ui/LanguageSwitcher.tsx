import {
  useLocale,
  type Locale,
} from '../../../shared/lib/i18n';

interface LanguageSwitcherProps {
  tabIndex?: number;
}

const languages: Array<{
  value: Locale;
  label: string;
  ariaLabel: string;
}> = [
  {
    value: 'ru',
    label: 'RU',
    ariaLabel: 'Русский язык',
  },
  {
    value: 'en',
    label: 'EN',
    ariaLabel: 'English language',
  },
];

export function LanguageSwitcher({
  tabIndex,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Выбор языка"
      className="relative inline-grid shrink-0 select-none grid-cols-2 items-center rounded-full border border-white/10 bg-white/[0.08] p-1"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1 top-1 h-6 w-9 rounded-full bg-white shadow-[0_2px_12px_rgba(255,255,255,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          locale === 'en'
            ? 'translate-x-9'
            : 'translate-x-0'
        }`}
      />

      {languages.map((language) => {
        const isActive = locale === language.value;

        return (
          <button
            key={language.value}
            type="button"
            tabIndex={tabIndex}
            aria-label={
              locale === 'ru'
                ? 'Выбор языка'
                : 'Choose language'
            }
            aria-pressed={isActive}
            className={`relative z-10 flex h-6 w-9 items-center justify-center rounded-full text-[10px] font-medium transition-colors duration-300 ${
              isActive
                ? 'text-[#0c0c0c]'
                : 'text-white/45 hover:text-white'
            }`}
            onClick={() => setLocale(language.value)}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}