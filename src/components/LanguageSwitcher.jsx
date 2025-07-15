// =======================================================================
// ARCHIVO NUEVO: src/components/LanguageSwitcher.jsx
// =======================================================================
import React from 'react';
import { useLocalization } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocalization();

  const languages = [
    { code: 'ca', name: 'Català' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'eu', name: 'Euskara' },
    { code: 'gl', name: 'Galego' },
  ];

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white p-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors appearance-none cursor-pointer text-sm"
      title="Seleccionar idioma"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
      ))}
    </select>
  );
}