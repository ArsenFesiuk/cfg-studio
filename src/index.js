import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './i18n.js'; // Імпортуємо конфігурацію i18n
import { ThemeModeProvider } from './theme/ThemeModeProvider.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

