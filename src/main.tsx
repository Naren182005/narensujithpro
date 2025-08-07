import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import config from './config';
import './index.css';



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={config.googleClientId}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);