import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { FavouritesProvider } from './contexts/FavouritesContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <FavouritesProvider>
        <App />
      </FavouritesProvider>
    </AuthProvider>
  </React.StrictMode>
);
