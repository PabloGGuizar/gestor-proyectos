// =======================================================================
// ARCHIVO: src/components/UpcomingTasksSidebar.jsx
// =======================================================================
import React from 'react';
import { Calendar } from 'lucide-react';
import { useLocalization } from '../context/LanguageContext';

export default function UpcomingTasksSidebar({ projects, onOpenProject }) {
    const { t } = useLocalization();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcomingTasks = projects
        .flatMap(project => (project.tasks || []).map(task => ({ ...task, projectName: project.name, projectId: project.id })))
        .filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate + 'T00:00:00');
            return dueDate >= today && dueDate <= sevenDaysFromNow;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('today');
        if (diffDays === 1) return t('tomorrow');
        return t('inXDays', { days: diffDays });
    };

    return (
        <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">{t('upcomingTasks')}</h3>
            {upcomingTasks.length > 0 ? (
                <ul className="space-y-4">
                    {upcomingTasks.map(task => (
                        <li key={task.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-r-lg">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{task.text}</p>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex justify-between items-center">
                                <button onClick={() => onOpenProject(task.projectId)} className="hover:underline font-medium text-blue-600 dark:text-blue-400 truncate pr-2">{task.projectName}</button>
                                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 flex-shrink-0"><Calendar size={14} />{formatDate(task.dueDate)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">{t('noUpcomingTasks')}</p>
            )}
        </section>
    );
}