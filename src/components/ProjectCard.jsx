// =======================================================================
// ARCHIVO: src/components/ProjectCard.jsx
// =======================================================================
import React from 'react';
import { CheckSquare, FileText, BookOpen, Trash2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function ProjectCard({ project, onOpen, onDelete }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col">
            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate mb-2">{project.name}</h3>
                <MarkdownRenderer text={project.description} className="text-sm text-gray-600 dark:text-gray-400 flex-grow min-h-[40px] mb-3 line-clamp-2" />
                <div className="flex flex-wrap gap-1.5 min-h-[24px] mb-4">
                    {(project.keywords || []).slice(0, 3).map(keyword => (
                        <span key={keyword} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">{keyword}</span>
                    ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-auto pt-3 flex justify-around text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5" title="Tareas"><CheckSquare size={16} /><span>{(project.tasks || []).filter(t => t.completed).length}/{(project.tasks || []).length}</span></div>
                    <div className="flex items-center gap-1.5" title="Notas"><FileText size={16} /><span>{(project.notes || []).length}</span></div>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-between items-center">
                <button onClick={() => onOpen(project.id)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><BookOpen size={16} />Abrir Proyecto</button>
                <button onClick={() => onDelete(project.id)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
            </div>
        </div>
    );
}
