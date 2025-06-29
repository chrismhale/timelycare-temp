// client/main.tsx
import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
