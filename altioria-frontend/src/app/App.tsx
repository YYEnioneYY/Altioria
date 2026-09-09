import { BrowserRouter, Route, Routes } from 'react-router';

import { NotFoundPage } from '../pages/not-found';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;