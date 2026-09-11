import { useLocale } from '../../../shared/lib/i18n';

import { privacyPolicyContent } from '../config/privacy-policy-content';

const contactEmail = 'info@altioria.design';

function renderTextWithEmail(text: string) {
  const emailPosition = text.indexOf(contactEmail);

  if (emailPosition === -1) {
    return text;
  }

  const textBeforeEmail = text.slice(
    0,
    emailPosition,
  );

  const textAfterEmail = text.slice(
    emailPosition + contactEmail.length,
  );

  return (
    <>
      {textBeforeEmail}

      <a
        href={`mailto:${contactEmail}`}
        className="text-white underline decoration-white/50 underline-offset-[3px] transition-colors hover:text-[#c8c8c8]"
      >
        {contactEmail}
      </a>

      {textAfterEmail}
    </>
  );
}

export function PrivacyPolicyPage() {
  const { locale } = useLocale();

  const content =
    privacyPolicyContent[locale];

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 pb-[60px] pt-[120px] text-[#e0e0e0] min-[601px]:px-6 min-[601px]:pb-20 min-[601px]:pt-[140px]">
      <article
        key={locale}
        className="language-content-in mx-auto max-w-[640px] text-[15px] font-normal leading-[1.6] min-[601px]:text-[16px]"
      >
        <h1 className="mb-10 text-center text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-[#a0a0a0]">
          {content.title}
        </h1>

        <div className="mb-10 space-y-5">
          {content.introduction.map(
            (paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ),
          )}
        </div>

        {content.sections.map(
          (section, sectionIndex) => {
            const headingId = `privacy-section-${
              sectionIndex + 1
            }`;

            return (
              <section
                key={section.title}
                aria-labelledby={headingId}
                className="mb-8 scroll-mt-28 last:mb-0"
              >
                <h2
                  id={headingId}
                  className="mb-3 text-[16px] font-semibold leading-[1.5] text-white"
                >
                  {section.title}
                </h2>

                {section.paragraphs?.map(
                  (paragraph, paragraphIndex) => (
                    <p
                      key={paragraphIndex}
                      className="mb-3 last:mb-0"
                    >
                      {renderTextWithEmail(
                        paragraph,
                      )}
                    </p>
                  ),
                )}

                {section.items && (
                  <ul className="my-3 list-none p-0">
                    {section.items.map(
                      (item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="relative mb-[0.35rem] pl-[1em] last:mb-0 before:absolute before:left-0 before:content-['–']"
                        >
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                )}

                {section.footer && (
                  <p className="mt-3">
                    {renderTextWithEmail(
                      section.footer,
                    )}
                  </p>
                )}

                {section.details && (
                  <div className="mt-2">
                    {section.details.map(
                      (detail) => (
                        <p
                          key={detail.label}
                          className="mb-[0.35rem] last:mb-0"
                        >
                          <strong className="font-semibold text-white">
                            {detail.label}
                          </strong>{' '}

                          {detail.href ? (
                            <a
                              href={detail.href}
                              className="text-white underline decoration-white/50 underline-offset-[3px] transition-colors hover:text-[#c8c8c8]"
                            >
                              {detail.value}
                            </a>
                          ) : (
                            detail.value
                          )}
                        </p>
                      ),
                    )}
                  </div>
                )}
              </section>
            );
          },
        )}
      </article>
    </main>
  );
}