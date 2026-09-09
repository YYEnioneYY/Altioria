import { useEffect } from 'react';

import { useLocale } from '../../../shared/lib/i18n';
import { contactsContent } from '../config/contacts-content';

export function ContactsPage() {
  const { locale } = useLocale();

  const content = contactsContent[locale];

  useEffect(() => {
    document.title = content.pageTitle;

    return () => {
      document.title = 'Altioria';
    };
  }, [content.pageTitle]);

  const headingSize =
    locale === 'ru'
      ? 'text-[clamp(4rem,15vw,13rem)]'
      : 'text-[clamp(4.5rem,17vw,15rem)]';

  return (
    <main className="box-border flex min-h-dvh select-none flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] px-6 py-16 text-white">
      <div
        key={locale}
        className="language-content-in flex flex-col items-center"
      >
        <h1
          className={`m-0 inline-block overflow-visible bg-[linear-gradient(#3a3a3a_5%,#0c0c0c_100%)] bg-clip-text pb-[0.02em] pl-[0.02em] pr-[0.12em] pt-[0.04em] font-normal leading-none tracking-[-0.045em] text-transparent [-webkit-text-fill-color:transparent] ${headingSize}`}
        >
          {content.heading}
        </h1>

        <ul
          aria-label={content.contactsLabel}
          className="m-0 flex list-none flex-wrap items-center justify-center gap-[clamp(1.5rem,6vw,2rem)] p-0 max-[700px]:mt-7 max-[700px]:flex-col max-[700px]:gap-[1.15rem]"
        >
          <li>
            <a
              href="mailto:info@altioria.design"
              aria-label={content.emailLinkLabel}
              className="inline-flex items-center gap-[0.55rem] whitespace-nowrap text-[clamp(1.3rem,0.85rem+0.5vw,3rem)] font-normal tracking-[-0.01em] text-white transition-colors duration-300 hover:text-[#b4b4b4]"
            >
              <img
                src="/images/mail-icon.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none block h-[1.05em] w-[1.05em] object-contain"
              />

              <span>info@altioria.design</span>
            </a>
          </li>

          <li>
            <a
              href="tel:+79255781966"
              aria-label={content.phoneLinkLabel}
              className="inline-flex items-center gap-[0.55rem] whitespace-nowrap text-[clamp(1.3rem,0.85rem+0.5vw,3rem)] font-normal tracking-[-0.01em] text-white transition-colors duration-300 hover:text-[#b4b4b4]"
            >
              <img
                src="/images/phone-icon.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none block h-[1.05em] w-[1.05em] object-contain"
              />

              <span>+79255781966</span>
            </a>
          </li>

          <li>
            <a
              href="https://altioria.ru"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={content.websiteLinkLabel}
              className="inline-flex items-center gap-[0.55rem] whitespace-nowrap text-[clamp(1.3rem,0.85rem+0.5vw,3rem)] font-normal tracking-[-0.01em] text-white transition-colors duration-300 hover:text-[#b4b4b4]"
            >
              <img
                src="/images/planet-icon.svg"
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none block h-[1.05em] w-[1.05em] object-contain"
              />

              <span>altioria.ru</span>
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}