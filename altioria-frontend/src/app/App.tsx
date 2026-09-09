import { BrowserRouter, Route, Routes } from 'react-router';

import { HomePage } from '../pages/home';
import { NotFoundPage } from '../pages/not-found';

import { SiteLayout } from './layouts/SiteLayout';
import { LocaleProvider } from '../shared/lib/i18n';

function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}

export default App;