import { useEffect } from 'react';

import { useLocale } from '../../../shared/lib/i18n';
import { AboutSection } from '../../../widgets/about-section';

export function AboutPage() {
  const { locale } = useLocale();

  useEffect(() => {
    document.title =
      locale === 'ru'
        ? 'О нас — Altioria'
        : 'About Us — Altioria';

    return () => {
      document.title = 'Altioria';
    };
  }, [locale]);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#0c0c0c] text-white">
      <AboutSection variant="page" />
    </main>
  );
}