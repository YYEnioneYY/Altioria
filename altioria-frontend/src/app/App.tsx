import { BrowserRouter, Route, Routes } from 'react-router';

import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';

import { SiteLayout } from './layouts/SiteLayout';
import { LocaleProvider } from '../shared/lib/i18n';

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

function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:categorySlug" element={<CategoryProductsPage />} />
            <Route path="products/:categorySlug/:productSlug/inquiry" element={<ProductInquiryPage />} />
            <Route path="products/:categorySlug/:productSlug" element={<ProductDetailsPage />} />
            <Route path="contacts" element={<ContactsPage />}/>
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          </Route>

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
      </BrowserRouter>
    </LocaleProvider>
  );
}

export default App;