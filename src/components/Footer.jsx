// src/components/Footer.jsx
import React from 'react';
import { Github } from 'lucide-react';
import { useLocalization } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLocalization();
  return (
    <footer className="text-center py-6 px-4 text-sm text-slate-500 dark:text-slate-400">
      <p>{t('footerText')}</p>
      <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-2">
        <a
          href="http://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-500"
        >
          {t('footerLicense')}
        </a>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
        <a
          href="https://github.com/PabloGGuizar/gestor-proyectos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 underline hover:text-blue-500"
        >
          <Github size={16} />
          {t('githubRepo')}
        </a>
      </div>
    </footer>
  );
}