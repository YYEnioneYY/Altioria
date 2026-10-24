import {
  Footer,
} from '../../../widgets/footer';

import {
  PublicCatalog,
} from '../../../widgets/public-catalog';

import {
  seoContent,
} from '../../../shared/config/seo-content';

import {
  useLocale,
} from '../../../shared/lib/i18n';

import {
  Seo,
} from '../../../shared/ui/seo';

export function ProductsPage() {
  const {
    locale,
  } = useLocale();

  const seo =
    seoContent[locale].products;

  return (
    <>
      <Seo
        locale={locale}
        title={seo.title}
        description={seo.description}
        path="/products"
      />

      <PublicCatalog />

      <Footer />
    </>
  );
}