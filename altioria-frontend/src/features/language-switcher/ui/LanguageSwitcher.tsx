import {
  useLocale,
  type Locale,
} from '../../../shared/lib/i18n';

interface LanguageSwitcherProps {
  tabIndex?: number;
  compact?: boolean;
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
  compact = false,
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
      className={`site-serif relative grid shrink-0 grid-cols-2 overflow-hidden border border-white/70 bg-black font-normal ${
        compact
          ? 'h-[20px] w-[44px]'
          : 'h-[34px] w-[76px] min-[1201px]:h-[32px] min-[1201px]:w-[70px]'
      }`}
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
            aria-label={
              language.ariaLabel
            }
            aria-pressed={isActive}
            onClick={() =>
              setLocale(
                language.value,
              )
            }
            className={`site-serif relative z-10 flex h-full items-center justify-center font-normal lowercase leading-none transition-colors duration-300 focus-visible:outline-none ${
              compact
                ? 'text-[14px]'
                : 'text-[14px]'
            } ${
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