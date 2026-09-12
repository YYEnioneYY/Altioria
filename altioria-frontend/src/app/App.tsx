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


import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';

import { SiteLayout } from './layouts/SiteLayout';

import { AboutPage } from '../pages/about';
import { ContactsPage } from '../pages/contacts';
import { CategoryProductsPage } from '../pages/category-products';
import { ProductDetailsPage } from '../pages/product-details';
import { ProductInquiryPage } from '../pages/product-inquiry';

import { AdminLoginPage } from '../pages/admin-login';
import { AdminDashboardPage } from '../pages/admin-dashboard';
import { AdminLayout } from './layouts/AdminLayout';

import { AdminCategoriesPage } from '../pages/admin-categories';

import { ProductsPage } from '../pages/products';

import { PrivacyPolicyPage } from '../pages/privacy-policy';

import { AdminProductsPage } from '../pages/admin-products';
import { AdminCreateProductPage } from '../pages/admin-create-product';
import { AdminProductDetailsPage } from '../pages/admin-product-details';
import { AdminCreateProductVariantPage } from '../pages/admin-create-product-variant';
import { AdminProductVariantDetailsPage } from '../pages/admin-product-variant-details';
import { AdminHelpPage } from '../pages/admin-help';


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


function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;