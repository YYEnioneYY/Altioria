import {
  useLocale,
  type Locale,
} from '../../../shared/lib/i18n';

interface LanguageSwitcherProps {
  tabIndex?: number;
}

const languages = [
  {
    value: 'ru',
    label: 'ru',
    ariaLabel: 'Русский язык',
  },
  {
    value: 'en',
    label: 'en',
    ariaLabel: 'English language',
  },
] satisfies {
  value: Locale;
  label: string;
  ariaLabel: string;
}[];

export function LanguageSwitcher({
  tabIndex,
}: LanguageSwitcherProps) {
  const {
    locale,
    setLocale,
  } = useLocale();

  return (
    <div
      role="group"
      aria-label={
        locale === 'ru'
          ? 'Выбор языка'
          : 'Choose language'
      }
      className="relative grid h-[34px] w-[76px] shrink-0 grid-cols-2 overflow-hidden border border-white/70 bg-black/20 backdrop-blur-sm min-[1201px]:h-[32px] min-[1201px]:w-[70px]"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-white transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          locale === 'en'
            ? 'translate-x-full'
            : 'translate-x-0'
        }`}
      />

      {languages.map((language) => {
        const isActive =
          locale === language.value;

        return (
          <button
            key={language.value}
            type="button"
            tabIndex={tabIndex}
            aria-label={language.ariaLabel}
            aria-pressed={isActive}
            onClick={() =>
              setLocale(language.value)
            }
            className={`relative z-10 flex h-full items-center justify-center text-[15px] min-[1201px]:text-[14px] font-normal lowercase transition-colors duration-300 focus-visible:outline-none ${
              isActive
                ? 'text-black'
                : 'text-white/55 hover:text-white'
            }`}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}