// =======================================================================
// ARCHIVO: src/App.jsx
// Este componente ahora actúa como el "enrutador" principal. Decide qué
// página mostrar y maneja el estado global de la navegación.
// =======================================================================
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { useTheme } from './hooks/useTheme';
import { useLocalization } from './context/LanguageContext';

import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ConfirmationModal from './components/ConfirmationModal';
import NoteViewModal from './components/NoteViewModal';
import HelpModal from './components/HelpModal';
import Footer from './components/Footer';

export default function App() {
    const [theme, setTheme] = useTheme();
    const { t } = useLocalization();
    
    const [error, setError] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const [importConfirmation, setImportConfirmation] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray(), [], []);
    const isLoading = projects === undefined;

    const handleAddProject = async (name) => { if (name.trim() === '') return; try { await db.projects.add({ name: name.trim(), description: '', keywords: [], notes: [], tasks: [], createdAt: new Date() }); } catch (e) { console.error("Error adding project:", e); setError(t('addProjectError')); } };
    const handleConfirmDelete = async () => { if (!itemToDelete) return; try { await db.projects.delete(itemToDelete); setItemToDelete(null); if (selectedProjectId === itemToDelete) { navigateToDashboard(); } } catch (e) { console.error("Error deleting project:", e); setError(t('deleteProjectError')); setItemToDelete(null); } };
    const handleUpdateProject = async (id, data) => { try { await db.projects.update(id, data); } catch (e) { console.error("Update error:", e); setError(t('updateProjectError')); } };
    const handleExportData = async () => { try { const allProjects = await db.projects.toArray(); const dataStr = JSON.stringify({ projects: allProjects }, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `gestor-proyectos-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); } catch (e) { console.error("Error exporting data:", e); setError(t('exportError')); } };
    const handleImportData = (file) => { if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = JSON.parse(event.target.result); if (data.projects && Array.isArray(data.projects)) { setImportConfirmation(data.projects); } else { throw new Error(t('jsonFormatError')); } } catch (e) { console.error("Error parsing import file:", e); setError(t('jsonParseError')); } }; reader.readAsText(file); };
    const confirmImport = async () => { if (!importConfirmation) return; try { await db.transaction('rw', db.projects, async () => { await db.projects.clear(); const projectsToImport = importConfirmation.map(p => ({ ...p, createdAt: new Date(p.createdAt), id: undefined })); await db.projects.bulkAdd(projectsToImport); }); setImportConfirmation(null); } catch (e) { console.error("Error importing data:", e); setError(t('importError')); setImportConfirmation(null); } };
    const navigateToProject = (id) => { setSelectedProjectId(id); setCurrentPage('project'); };
    const navigateToDashboard = () => { setSelectedProjectId(null); setCurrentPage('dashboard'); };
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert"><p>{error}</p></div>}
                
                {currentPage === 'dashboard' && <DashboardPage projects={projects} onAddProject={handleAddProject} onOpenProject={navigateToProject} onDeleteProject={setItemToDelete} isLoading={isLoading} onExport={handleExportData} onImport={handleImportData} onOpenHelp={() => setIsHelpModalOpen(true)} theme={theme} setTheme={setTheme} />}
                {currentPage === 'project' && selectedProject && <ProjectPage project={selectedProject} onUpdateProject={handleUpdateProject} onBack={navigateToDashboard} onViewNote={setViewingNote} />}

                {itemToDelete && <ConfirmationModal title={t('deleteConfirmTitle')} message={t('deleteConfirmMessage')} onConfirm={handleConfirmDelete} onCancel={() => setItemToDelete(null)} />}
                {importConfirmation && <ConfirmationModal title={t('importConfirmTitle')} message={t('importConfirmMessage')} onConfirm={confirmImport} onCancel={() => setImportConfirmation(null)} />}
                {viewingNote && <NoteViewModal note={viewingNote} onClose={() => setViewingNote(null)} />}
                {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            </main>
            <Footer />
        </div>
    );
}