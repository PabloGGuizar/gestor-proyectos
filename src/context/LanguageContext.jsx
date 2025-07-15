// =======================================================================
// ARCHIVO NUEVO: src/context/LanguageContext.jsx
// =======================================================================
import React, { createContext, useState, useContext, useEffect } from 'react';
import { locales } from '../i18n/locales';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('locale') || 'es');

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = (key, params = {}) => {
    let text = locales[locale]?.[key] || locales['en']?.[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocalization() {
  return useContext(LanguageContext);
}