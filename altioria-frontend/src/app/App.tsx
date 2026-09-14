import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router';

import {
  useLocale,
  LocaleProvider,
  type Locale,
} from '../shared/lib/i18n';

import {
  lazy,
  Suspense,
} from 'react';


import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';

import { SiteLayout } from './layouts/SiteLayout';

import { AboutPage } from '../pages/about';
import { ContactsPage } from '../pages/contacts';
import { CategoryProductsPage } from '../pages/category-products';
import { ProductDetailsPage } from '../pages/product-details';
import { ProductInquiryPage } from '../pages/product-inquiry';

import { ProductsPage } from '../pages/products';

import { PrivacyPolicyPage } from '../pages/privacy-policy';

const AdminNoIndexLayout = lazy(
  () =>
    import(
      './layouts/AdminNoIndexLayout'
    ).then((module) => ({
      default:
        module.AdminNoIndexLayout,
    })),
);

const AdminLayout = lazy(
  () =>
    import(
      './layouts/AdminLayout'
    ).then((module) => ({
      default: module.AdminLayout,
    })),
);

const AdminLoginPage = lazy(
  () =>
    import(
      '../pages/admin-login'
    ).then((module) => ({
      default:
        module.AdminLoginPage,
    })),
);

const AdminDashboardPage = lazy(
  () =>
    import(
      '../pages/admin-dashboard'
    ).then((module) => ({
      default:
        module.AdminDashboardPage,
    })),
);

const AdminCategoriesPage = lazy(
  () =>
    import(
      '../pages/admin-categories'
    ).then((module) => ({
      default:
        module.AdminCategoriesPage,
    })),
);

const AdminProductsPage = lazy(
  () =>
    import(
      '../pages/admin-products'
    ).then((module) => ({
      default:
        module.AdminProductsPage,
    })),
);

const AdminCreateProductPage =
  lazy(
    () =>
      import(
        '../pages/admin-create-product'
      ).then((module) => ({
        default:
          module.AdminCreateProductPage,
      })),
  );

const AdminProductDetailsPage =
  lazy(
    () =>
      import(
        '../pages/admin-product-details'
      ).then((module) => ({
        default:
          module.AdminProductDetailsPage,
      })),
  );

const AdminCreateProductVariantPage =
  lazy(
    () =>
      import(
        '../pages/admin-create-product-variant'
      ).then((module) => ({
        default:
          module.AdminCreateProductVariantPage,
      })),
  );

const AdminProductVariantDetailsPage =
  lazy(
    () =>
      import(
        '../pages/admin-product-variant-details'
      ).then((module) => ({
        default:
          module.AdminProductVariantDetailsPage,
      })),
  );

const AdminHelpPage = lazy(
  () =>
    import(
      '../pages/admin-help'
    ).then((module) => ({
      default:
        module.AdminHelpPage,
    })),
);

const publicLocales: Locale[] = [
  'ru',
  'en',
];

function RootRedirect() {
  const { locale } = useLocale();

  return (
    <Navigate
      to={`/${locale}`}
      replace
    />
  );
}

function LegacyPublicRedirect() {
  const { locale } = useLocale();
  const location = useLocation();

  return (
    <Navigate
      to={`/${locale}${location.pathname}${location.search}`}
      replace
    />
  );
}

function RouteLoadingFallback() {
  return (
    <main
      role="status"
      aria-label="Загрузка страницы"
      className="flex min-h-dvh items-center justify-center bg-[#0c0c0c] text-white"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white" />
    </main>
  );
}


function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <Suspense
          fallback={
            <RouteLoadingFallback />
          }
        >
          <Routes>
            <Route
              path="/"
              element={<RootRedirect />}
            />

            {publicLocales.map(
              (locale) => (
                <Route
                  key={locale}
                  path={locale}
                  element={<SiteLayout />}
                >
                  <Route
                    index
                    element={<HomePage />}
                  />

                  <Route
                    path="about"
                    element={<AboutPage />}
                  />

                  <Route
                    path="products"
                    element={<ProductsPage />}
                  />

                  <Route
                    path="products/:categorySlug"
                    element={
                      <CategoryProductsPage />
                    }
                  />

                  <Route
                    path="products/:categorySlug/:productSlug"
                    element={
                      <ProductDetailsPage />
                    }
                  />

                  <Route
                    path="products/:categorySlug/:productSlug/inquiry"
                    element={
                      <ProductInquiryPage />
                    }
                  />

                  <Route
                    path="contacts"
                    element={
                      <ContactsPage />
                    }
                  />

                  <Route
                    path="privacy-policy"
                    element={
                      <PrivacyPolicyPage />
                    }
                  />
                </Route>
              ),
            )}

            <Route index element={<LegacyPublicRedirect />} />
            <Route path="about" element={<LegacyPublicRedirect />} />
            <Route path="products" element={<LegacyPublicRedirect />} />
            <Route path="products/:categorySlug" element={<LegacyPublicRedirect />} />
            <Route path="products/:categorySlug/:productSlug/inquiry" element={<LegacyPublicRedirect />} />
            <Route path="products/:categorySlug/:productSlug" element={<LegacyPublicRedirect />} />
            <Route path="contacts" element={<LegacyPublicRedirect />}/>
            <Route path="privacy-policy" element={<LegacyPublicRedirect />} />

            <Route element={<AdminNoIndexLayout />}>
              <Route
                path="admin/login"
                element={<AdminLoginPage />}
              />

              <Route element={<AdminLayout />}>
                <Route
                  path="admin-dashboard"
                  element={<AdminDashboardPage />}
                />

                <Route
                  path="admin/categories"
                  element={<AdminCategoriesPage />}
                />

                <Route
                  path="admin/products"
                  element={<AdminProductsPage />}
                />

                <Route
                  path="admin/products/new"
                  element={<AdminCreateProductPage />}
                />

                <Route
                  path="admin/products/:id"
                  element={<AdminProductDetailsPage />}
                />

                <Route
                  path="admin/products/:id/edit"
                  element={<AdminCreateProductPage />}
                />

                <Route
                  path="admin/products/:productId/variants/new"
                  element={<AdminCreateProductVariantPage />}
                />

                <Route
                  path="admin/products/:productId/variants/:variantId"
                  element={<AdminProductVariantDetailsPage />}
                />

                <Route
                  path="admin/products/:productId/variants/:variantId/edit"
                  element={<AdminCreateProductVariantPage />}
                />

                <Route
                  path="admin/help"
                  element={<AdminHelpPage />}
                />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;