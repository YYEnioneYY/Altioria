import { BrowserRouter, Route, Routes } from 'react-router';

import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';

import { SiteLayout } from './layouts/SiteLayout';
import { LocaleProvider } from '../shared/lib/i18n';

import { AboutPage } from '../pages/about';
import { ContactsPage } from '../pages/contacts';

import { AdminLoginPage } from '../pages/admin-login';
import { AdminDashboardPage } from '../pages/admin-dashboard';
import { AdminLayout } from './layouts/AdminLayout';

import { AdminCategoriesPage } from '../pages/admin-categories';

function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contacts" element={<ContactsPage />}/>
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
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}

export default App;