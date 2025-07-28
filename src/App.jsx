// =======================================================================
// ARCHIVO: src/App.jsx
// VERSIÓN FINAL CON LÓGICA DE SINCRONIZACIÓN OFFLINE-FIRST CORREGIDA
// =======================================================================
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDefaultSession, handleIncomingRedirect } from '@inrupt/solid-client-authn-browser';
import * as solidService from './services/solidService';
import { db } from './services/db';
import { useTheme } from './hooks/useTheme';
import { useLocalization } from './context/LanguageContext';

import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ConfirmationModal from './components/ConfirmationModal';
import NoteViewModal from './components/NoteViewModal';
import HelpModal from './components/HelpModal';
import Footer from './components/Footer';
import SolidAuth from './components/SolidAuth';

export default function App() {
    const [theme, setTheme] = useTheme();
    const { t } = useLocalization();

    const [error, setError] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [importConfirmation, setImportConfirmation] = useState(null);
    const [projectsToImport, setProjectsToImport] = useState(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [webId, setWebId] = useState(undefined);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const localProjects = useLiveQuery(() => db.projects.toArray(), []);

    useEffect(() => {
        const updateSessionState = () => {
            const session = getDefaultSession();
            setIsLoggedIn(session.info.isLoggedIn);
            setWebId(session.info.webId);
        };

        handleIncomingRedirect({ restorePreviousSession: true }).then(() => {
            updateSessionState();
        });

        const session = getDefaultSession();
        session.events.on("login", updateSessionState);
        session.events.on("sessionRestore", updateSessionState);
        session.events.on("logout", () => {
            setIsLoggedIn(false);
            setWebId(undefined);
            // CORRECCIÓN: Al cerrar sesión, NO borramos los datos locales.
            // Esto permite al usuario seguir trabajando sin conexión.
            navigateToDashboard();
        });
    }, []);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn && isOnline) {
            syncWithPod();
        } else {
            setIsLoading(false);
        }
    }, [isLoggedIn, isOnline]);

    /**
     * Sincroniza los datos de forma inteligente para evitar la pérdida de datos.
     */
    const syncWithPod = async () => {
        if (!webId) return;
        setIsLoading(true);
        setError(null);
        try {
            // 1. Envía al Pod todos los cambios que se hicieron sin conexión.
            const pendingChanges = await db.syncQueue.toArray();
            if (pendingChanges.length > 0) {
                await solidService.processSyncQueue(pendingChanges);
                await db.syncQueue.clear();
            }
            
            // 2. Descarga todos los proyectos del Pod.
            const remoteProjects = await solidService.getProjects();
            
            // 3. Reemplaza los datos locales con los del Pod.
            // Esto es seguro ahora porque el paso 1 ya ha subido todos los cambios locales.
            await db.transaction('rw', db.projects, async () => {
                await db.projects.clear();
                await db.projects.bulkAdd(remoteProjects);
            });
        } catch (err) {
            console.error("Error de sincronización:", err);
            setError("No se pudo sincronizar con el Pod.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProject = async (name) => {
        if (!name.trim()) return;
        const tempId = `local-${crypto.randomUUID()}`;
        const newProject = { id: tempId, name: name.trim(), description: '', keywords: [], notes: [], tasks: [], createdAt: new Date(), updatedAt: new Date() };
        await db.projects.add(newProject);

        if (isOnline && isLoggedIn) {
            try {
                const savedProject = await solidService.saveProject(newProject);
                await db.transaction('rw', db.projects, async () => {
                    await db.projects.delete(tempId);
                    await db.projects.add(savedProject);
                });
            } catch (error) {
                console.error("Error guardando en Pod, encolando...", error);
                await db.syncQueue.add({ type: 'add', payload: newProject });
            }
        } else {
            await db.syncQueue.add({ type: 'add', payload: newProject });
        }
    };
    
    const handleUpdateProject = async (id, data) => {
        const updatedData = { ...data, updatedAt: new Date() };
        await db.projects.update(id, updatedData);
        const projectToSync = await db.projects.get(id);

        if (isOnline && isLoggedIn) {
            try {
                await solidService.saveProject(projectToSync);
            } catch (error) {
                console.error("Error actualizando en Pod, encolando...", error);
                await db.syncQueue.add({ type: 'update', payload: projectToSync });
            }
        } else {
            await db.syncQueue.add({ type: 'update', payload: projectToSync });
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const projectId = itemToDelete;
        const projectToDelete = await db.projects.get(projectId);
        await db.projects.delete(projectId);
        setItemToDelete(null);
        if (selectedProjectId === projectId) navigateToDashboard();

        if (isOnline && isLoggedIn) {
            try {
                if (projectToDelete && !projectToDelete.id.startsWith('local-')) {
                    await solidService.deleteProject(projectToDelete.id);
                }
            } catch (error) {
                 if (projectToDelete) await db.syncQueue.add({ type: 'delete', payload: { id: projectToDelete.id } });
            }
        } else {
             if (projectToDelete) await db.syncQueue.add({ type: 'delete', payload: { id: projectToDelete.id } });
        }
    };

    const handleSaveFile = async () => {
        if (!localProjects || localProjects.length === 0) {
            alert("No hay proyectos para exportar.");
            return;
        }
        const dataToSave = JSON.stringify(localProjects, null, 2);
        const blob = new Blob([dataToSave], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `gestor-proyectos-respaldo-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const handleOpenFilePicker = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const parsedProjects = JSON.parse(text);
                if (!Array.isArray(parsedProjects)) throw new Error(t('jsonFormatError'));
                setProjectsToImport(parsedProjects);
                setImportConfirmation(true);
            } catch (err) {
                setError(t('jsonParseError'));
            }
        };
        input.click();
    };

    const confirmImport = async () => {
        if (!projectsToImport) return;
        setIsLoading(true);
        setError(null);
        setImportConfirmation(null);
        try {
            const projectsForPod = projectsToImport.map(({ id, ...rest }) => rest);
            if (isOnline && isLoggedIn) {
                await solidService.overwriteProjects(projectsForPod);
                const remoteProjects = await solidService.getProjects();
                await db.transaction('rw', db.projects, async () => {
                    await db.projects.clear();
                    await db.projects.bulkAdd(remoteProjects);
                });
            } else {
                await db.transaction('rw', db.projects, async () => {
                    await db.projects.clear();
                    await db.projects.bulkAdd(projectsToImport);
                });
                setError("Importado localmente. Se sincronizará con el Pod cuando haya conexión.");
            }
            setProjectsToImport(null);
        } catch (err) {
            setError(t('importError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const navigateToProject = (id) => { setSelectedProjectId(id); setCurrentPage('project'); };
    const navigateToDashboard = () => { setSelectedProjectId(null); setCurrentPage('dashboard'); };
    const selectedProject = localProjects?.find(p => p.id === selectedProjectId);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
            <header className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-wrap justify-between items-center gap-4">
                 <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboardTitle')}</h1>
                 </div>
                 <div className="flex-grow flex justify-end">
                    <SolidAuth isLoggedIn={isLoggedIn} webId={webId} />
                 </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert"><p>{error}</p></div>}
                
                {currentPage === 'dashboard' ? (
                    <DashboardPage 
                        projects={localProjects} 
                        onAddProject={handleAddProject} 
                        onOpenProject={navigateToProject} 
                        onDeleteProject={setItemToDelete} 
                        isLoading={isLoading} 
                        onOpenFile={handleOpenFilePicker}
                        onSaveFile={handleSaveFile}
                        onOpenHelp={() => setIsHelpModalOpen(true)}
                        theme={theme} 
                        setTheme={setTheme}
                    />
                ) : (
                    selectedProject && <ProjectPage 
                        project={selectedProject} 
                        onUpdateProject={handleUpdateProject} 
                        onBack={navigateToDashboard} 
                        onViewNote={setViewingNote} 
                    />
                )}
                {itemToDelete && <ConfirmationModal title={t('deleteConfirmTitle')} message={t('deleteConfirmMessage')} onConfirm={handleConfirmDelete} onCancel={() => setItemToDelete(null)} />}
                {importConfirmation && <ConfirmationModal title={t('importConfirmTitle')} message={t('importConfirmMessage')} onConfirm={confirmImport} onCancel={() => setImportConfirmation(null)} />}
                {viewingNote && <NoteViewModal note={viewingNote} onClose={() => setViewingNote(null)} />}
                {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
            </main>
            <Footer />
        </div>
    );
}