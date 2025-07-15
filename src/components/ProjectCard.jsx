// =======================================================================
// ARCHIVO: src/components/ProjectCard.jsx
// =======================================================================
import React from 'react';
import { CheckSquare, FileText, BookOpen, Trash2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useLocalization } from '../context/LanguageContext';

export default function ProjectCard({ project, onOpen, onDelete }) {
    const { t } = useLocalization();
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate mb-2">{project.name}</h3>
                <MarkdownRenderer text={project.description} className="text-sm text-slate-600 dark:text-slate-400 flex-grow min-h-[40px] mb-3 line-clamp-2" />
                <div className="flex flex-wrap gap-1.5 min-h-[24px] mb-4">
                    {(project.keywords || []).slice(0, 3).map(keyword => (
                        <span key={keyword} className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{keyword}</span>
                    ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 mt-auto pt-3 flex justify-around text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5" title={t('tasks')}><CheckSquare size={16} /><span>{(project.tasks || []).filter(t => t.completed).length}/{(project.tasks || []).length}</span></div>
                    <div className="flex items-center gap-1.5" title={t('notes')}><FileText size={16} /><span>{(project.notes || []).length}</span></div>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => onOpen(project.id)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><BookOpen size={16} />{t('openProject')}</button>
                <button onClick={() => onDelete(project.id)} className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
            </div>
        </div>
    );
}

