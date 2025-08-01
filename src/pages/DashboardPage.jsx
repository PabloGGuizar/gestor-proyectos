// =======================================================================
// ARCHIVO: src/pages/DashboardPage.jsx
// VERSIÓN ACTUALIZADA PARA LA ARQUITECTURA SOLID POD
// =======================================================================
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, HelpCircle, FolderOpen, Save } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import UpcomingTasksSidebar from '../components/UpcomingTasksSidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLocalization } from '../context/LanguageContext';

export default function DashboardPage({
    projects,
    onAddProject,
    onOpenProject,
    onDeleteProject,
    isLoading,
    onOpenHelp,
    theme,
    setTheme,
    onOpenFile,
    onSaveFile
}) {
    const { t } = useLocalization();
    const [newProjectName, setNewProjectName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState(t('allKeywords'));

    const handleAdd = () => {
        if (newProjectName.trim()) {
            onAddProject(newProjectName);
            setNewProjectName('');
        }
    };

    const allKeywords = useMemo(() => {
        const keywords = new Set([t('allKeywords')]);
        (projects || []).forEach(p => {
            (p.keywords || []).forEach(k => keywords.add(k));
        });
        return Array.from(keywords);
    }, [projects, t]);

    useEffect(() => {
        // Asegura que "Todos" se seleccione si cambia el idioma
        setSelectedKeyword(t('allKeywords'));
    }, [t]);

    const filteredProjects = useMemo(() => {
        return (projects || []).filter(project => {
            const matchesKeyword = selectedKeyword === t('allKeywords') || (project.keywords || []).includes(selectedKeyword);
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                project.name.toLowerCase().includes(lowerSearchTerm) ||
                (project.description || '').toLowerCase().includes(lowerSearchTerm);
            return matchesKeyword && matchesSearch;
        });
    }, [projects, searchTerm, selectedKeyword, t]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div className="flex-grow">
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('dashboardTitle')}</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('dashboardSubtitle')}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center flex-wrap gap-2">
                            <LanguageSwitcher />
                            <ThemeSwitcher theme={theme} setTheme={setTheme} />
                            {/* Los botones de Importar/Exportar se mantienen como backup local */}
                            <button onClick={onOpenFile} title={t('openFile')} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white p-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><FolderOpen size={18} /> <span className="hidden sm:inline">{t('openFile')}</span></button>
                            <button onClick={onSaveFile} title={t('saveFile')} className="bg-blue-600 text-white p-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"><Save size={18} /> <span className="hidden sm:inline">{t('saveFile')}</span></button>
                            <button onClick={onOpenHelp} title={t('help')} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white p-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><HelpCircle size={18} /></button>
                        </div>
                    </div>
                </header>
                
                <div className="mb-8 p-6 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">{t('addProject')}</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} placeholder={t('newProjectPlaceholder')} className="flex-grow w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" />
                            <button onClick={handleAdd} disabled={!newProjectName.trim()} className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"><Plus />{t('addProject')}</button>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">{t('searchAndFilter')}</h2>
                         <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allKeywords.map(keyword => (
                                <button key={keyword} onClick={() => setSelectedKeyword(keyword)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedKeyword === keyword ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}`}>{keyword}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading ? (<div className="text-center py-10"><p className="text-lg text-slate-500">Sincronizando con tu Solid Pod...</p></div>) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredProjects.map(project => (<ProjectCard key={project.id} project={project} onOpen={onOpenProject} onDelete={onDeleteProject} />))}
                    </div>
                )}
                {!isLoading && filteredProjects.length === 0 && (
                    <div className="text-center py-16 px-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">{t('noProjectsFoundTitle')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('noProjectsFoundSubtitle')}</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-1">
                <div className="sticky top-8">
                    <UpcomingTasksSidebar projects={projects || []} onOpenProject={onOpenProject} />
                </div>
            </div>
        </div>
    );
}