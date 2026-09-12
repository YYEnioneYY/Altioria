import { Seo } from '../../../shared/ui/seo';
import { seoContent } from '../../../shared/config/seo-content';

import { useLocale } from '../../../shared/lib/i18n';
import { AboutSection } from '../../../widgets/about-section';

export function AboutPage() {
  const { locale } = useLocale();
  const seo = seoContent[locale].about;

  return (
    <>
      <Seo
        locale={locale}
        title={seo.title}
        description={seo.description}
        path="/about"
      />
      <main className="min-h-dvh overflow-x-hidden bg-[#0c0c0c] text-white">
        <AboutSection variant="page" />
      </main>
    </>
  );
}