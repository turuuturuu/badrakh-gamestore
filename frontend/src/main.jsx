import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProductModalProvider } from './context/ProductModalContext.jsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SiteSettingsProvider>
          <ToastProvider>
            <FavoritesProvider>
              <CompareProvider>
                <ProductModalProvider>
                  <AdminAuthProvider>
                    <App />
                  </AdminAuthProvider>
                </ProductModalProvider>
              </CompareProvider>
            </FavoritesProvider>
          </ToastProvider>
        </SiteSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
