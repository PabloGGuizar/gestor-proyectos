// =======================================================================
// ARCHIVO: src/App.jsx
// Este componente ahora actúa como el "enrutador" principal. Decide qué
// página mostrar y maneja el estado global de la navegación.
// =======================================================================
import React, { useState, useEffect } from 'react';
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
    const [fileHandle, setFileHandle] = useState(null); // La referencia se mantiene solo en el estado

    const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray(), [], []);
    const isLoading = projects === undefined;

    const handleAddProject = async (name) => { if (name.trim()) await db.projects.add({ name: name.trim(), description: '', keywords: [], notes: [], tasks: [], createdAt: new Date() }); };
    const handleConfirmDelete = async () => { if (itemToDelete) { await db.projects.delete(itemToDelete); setItemToDelete(null); if (selectedProjectId === itemToDelete) navigateToDashboard(); } };
    const handleUpdateProject = async (id, data) => { await db.projects.update(id, data); };
    
    const confirmImport = async () => {
        if (!importConfirmation) return;
        try {
            await db.transaction('rw', db.projects, async () => {
                await db.projects.clear();
                const projectsToImport = importConfirmation.map(p => ({ ...p, createdAt: new Date(p.createdAt), id: undefined }));
                await db.projects.bulkAdd(projectsToImport);
            });
            setImportConfirmation(null);
        } catch (e) {
            console.error("Error importing data:", e);
            setError(t('importError'));
        }
    };

    const handleOpenFilePicker = async () => {
        setError(null);
        if (!('showOpenFilePicker' in window)) {
            return setError("Tu navegador no soporta la API de Acceso al Sistema de Archivos.");
        }
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'Archivos JSON', accept: { 'application/json': ['.json'] } }],
            });
            const file = await handle.getFile();
            const content = await file.text();
            const data = JSON.parse(content);

            let projectsToLoad = null;
            if (Array.isArray(data)) {
                projectsToLoad = data;
            } else if (data.projects && Array.isArray(data.projects)) {
                projectsToLoad = data.projects;
            }

            if (projectsToLoad) {
                setImportConfirmation(projectsToLoad);
                setFileHandle(handle); // Se guarda la referencia solo en el estado local
            } else {
                throw new Error(t('jsonFormatError'));
            }
        } catch (err) {
            console.error("Error al abrir o leer el archivo:", err);
            if (err.name !== 'AbortError') {
                setError(t('jsonParseError'));
            }
        }
    };

    const handleSaveFile = async () => {
        setError(null);
        let handle = fileHandle;

        if (!handle) {
            if (!('showSaveFilePicker' in window)) return setError("Tu navegador no soporta esta función.");
            try {
                handle = await window.showSaveFilePicker({
                    suggestedName: `proyectos-backup.json`,
                    types: [{ description: 'Archivos JSON', accept: { 'application/json': ['.json'] } }],
                });
                setFileHandle(handle); // Se vincula el nuevo archivo
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Error en 'Guardar como':", err);
                return;
            }
        }

        try {
            if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
                return setError("Se necesita permiso para guardar los cambios.");
            }
            const writable = await handle.createWritable();
            const allProjects = await db.projects.toArray();
            await writable.write(JSON.stringify({ projects: allProjects }, null, 2));
            await writable.close();
            alert('¡Archivo guardado!');
        } catch (err) {
            console.error("Error al guardar:", err);
            setError("No se pudo guardar el archivo.");
        }
    };

    const navigateToProject = (id) => { setSelectedProjectId(id); setCurrentPage('project'); };
    const navigateToDashboard = () => { setSelectedProjectId(null); setCurrentPage('dashboard'); };
    const selectedProject = projects?.find(p => p.id === selectedProjectId);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex justify-between items-center" role="alert"><p>{error}</p><button onClick={() => setError(null)} className="font-bold text-xl">×</button></div>}
                
                {currentPage === 'dashboard' && <DashboardPage 
                    projects={projects} 
                    onAddProject={handleAddProject} 
                    onOpenProject={navigateToProject} 
                    onDeleteProject={setItemToDelete} 
                    isLoading={isLoading} 
                    onOpenFile={handleOpenFilePicker}
                    onSaveFile={handleSaveFile}
                    onOpenHelp={() => setIsHelpModalOpen(true)} 
                    theme={theme} 
                    setTheme={setTheme}
                />}
                {currentPage === 'project' && selectedProject && <ProjectPage 
                    project={selectedProject} 
                    onUpdateProject={handleUpdateProject} 
                    onBack={navigateToDashboard} 
                    onViewNote={setViewingNote} 
                />}

                {itemToDelete && <ConfirmationModal title={t('deleteConfirmTitle')} message={t('deleteConfirmMessage')} onConfirm={handleConfirmDelete} onCancel={() => setItemToDelete(null)} />}
                {importConfirmation && <ConfirmationModal title={t('importConfirmTitle')} message={t('importConfirmMessage')} onConfirm={confirmImport} onCancel={() => setImportConfirmation(null)} />}
                {viewingNote && <NoteViewModal note={viewingNote} onClose={() => setViewingNote(null)} />}
                {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            </main>
            <Footer />
        </div>
    );
}