// =======================================================================
// ARCHIVO: src/components/ConfirmationModal.jsx
// =======================================================================
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLocalization } from '../context/LanguageContext';

export default function ConfirmationModal({ title, message, onConfirm, onCancel }) {
    const { t } = useLocalization();
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-colors">{t('cancel')}</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors">{t('confirm')}</button>
                </div>
            </div>
        </div>
    );
}
