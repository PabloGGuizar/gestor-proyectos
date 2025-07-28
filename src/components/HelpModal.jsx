// src/components/HelpModal.jsx
import React from 'react';
import { X, HardDrive, WifiOff, Download, Cloud } from 'lucide-react';
import { useLocalization } from '../context/LanguageContext';

export default function HelpModal({ onClose }) {
  const { t } = useLocalization();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{t('helpTitle')}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="text-slate-600 dark:text-slate-300" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto text-slate-700 dark:text-slate-300 space-y-6">
          <section>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              {t('helpIntro')}
            </h4>
            <p>{t('helpIntroText')}</p>
          </section>
          <section>
            <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
              <Cloud size={20} /> {t('helpStorageTitle')}
            </h4>
            <p className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg">{t('helpStorageText')}</p>
          </section>
           <section>
            <h4 className="font-bold text-lg text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <WifiOff size={20} /> {t('helpOfflineTitle')}
            </h4>
            <p>{t('helpOfflineText')}</p>
          </section>
          <section>
            <h4 className="font-bold text-lg text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Download size={20} /> {t('helpBackupTitle')}
            </h4>
            <p>{t('helpBackupText')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}