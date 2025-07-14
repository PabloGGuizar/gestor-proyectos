// =======================================================================
// ARCHIVO: src/components/NoteViewModal.jsx
// =======================================================================
import React from 'react';
import { X } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function NoteViewModal({ note, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{note.title || 'Nota'}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><X className="text-gray-600 dark:text-gray-300" /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <MarkdownRenderer text={note.text} className="prose dark:prose-invert max-w-none" />
                </div>
            </div>
        </div>
    );
}