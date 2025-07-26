// =======================================================================
// ARCHIVO: src/App.jsx
// VERSIÓN CON SINCRONIZACIÓN CONTINUA EN TIEMPO REAL
// =======================================================================
import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Peer from 'peerjs';
import { db } from './services/db';
import { useTheme } from './hooks/useTheme';
import { useLocalization } from './context/LanguageContext';

import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ConfirmationModal from './components/ConfirmationModal';
import NoteViewModal from './components/NoteViewModal';
import HelpModal from './components/HelpModal';
import Footer from './components/Footer';
import SyncModal from './components/SyncModal';

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
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [fileHandle, setFileHandle] = useState(null);

    // Refs para manejar la conexión PeerJS
    const peerRef = useRef(null);
    const connRef = useRef(null);

    // Hook para la sincronización en tiempo real
    useEffect(() => {
        // Inicializar PeerJS
        const peer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
                ],
            },
        });
        peerRef.current = peer;

        // Escuchar conexiones entrantes
        peer.on('connection', (conn) => {
            connRef.current = conn;
            setupConnectionListeners(conn);
        });

        // Escuchar cambios en la base de datos
        const handleDbChanges = (changes) => {
            if (connRef.current && connRef.current.open) {
                // Solo enviar si hay una conexión activa y no somos el origen del cambio
                const relevantChanges = changes.filter(change => !change.source); // Evitar bucles
                if (relevantChanges.length > 0) {
                    connRef.current.send({ type: 'db-changes', payload: relevantChanges });
                }
            }
        };

        db.on('changes', handleDbChanges);

        return () => {
            db.on('changes').unsubscribe(handleDbChanges);
            if (peer) peer.destroy();
        };
    }, []);
    
    // Función para manejar los datos recibidos (tanto iniciales como cambios)
    const handleDataReceived = async (data) => {
        if (data.type === 'full-sync') {
            // Lógica de fusión para la sincronización inicial
            await db.transaction('rw', db.projects, async () => {
                const localProjects = await db.projects.toArray();
                const localMap = new Map(localProjects.map(p => [p.id, p]));
                
                for (const remoteProject of data.payload) {
                    const localProject = localMap.get(remoteProject.id);
                    if (!localProject || new Date(remoteProject.updatedAt) > new Date(localProject.updatedAt)) {
                        await db.projects.put(remoteProject, undefined, { source: 'sync' });
                    }
                }
            });
        } else if (data.type === 'db-changes') {
            // Aplicar cambios incrementales
            await db.transaction('rw', db.projects, async () => {
                for (const change of data.payload) {
                    switch (change.type) {
                        case 1: // CREATE
                            await db.projects.put(change.obj, undefined, { source: 'sync' });
                            break;
                        case 2: // UPDATE
                            await db.projects.update(change.key, change.mods, { source: 'sync' });
                            break;
                        case 3: // DELETE
                            await db.projects.delete(change.key, { source: 'sync' });
                            break;
                    }
                }
            });
        }
    };
    
    const setupConnectionListeners = (conn) => {
        conn.on('open', async () => {
            const allProjects = await db.projects.toArray();
            conn.send({ type: 'full-sync', payload: allProjects });
            setIsSyncModalOpen(false); // Cierra el modal al conectar
        });
        conn.on('data', handleDataReceived);
        conn.on('close', () => { connRef.current = null; });
        conn.on('error', () => { connRef.current = null; });
    };

    const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray(), [], []);
    const isLoading = projects === undefined;

    const handleAddProject = async (name) => { if (name.trim()) await db.projects.add({ name: name.trim(), description: '', keywords: [], notes: [], tasks: [], createdAt: new Date(), updatedAt: new Date() }); };
    const handleConfirmDelete = async () => { if (itemToDelete) { await db.projects.delete(itemToDelete); setItemToDelete(null); if (selectedProjectId === itemToDelete) navigateToDashboard(); } };
    const handleUpdateProject = async (id, data) => { await db.projects.update(id, { ...data, updatedAt: new Date() }); };
    
    // ... (el resto de funciones como confirmImport, handleOpenFilePicker, etc., no cambian)

    const confirmImport = async () => { /* ...código sin cambios... */ };
    const handleOpenFilePicker = async () => { /* ...código sin cambios... */ };
    const handleSaveFile = async () => { /* ...código sin cambios... */ };
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
                    onOpenSync={() => setIsSyncModalOpen(true)}
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
                {isSyncModalOpen && <SyncModal 
                    peer={peerRef.current}
                    onConnectionEstablished={setupConnectionListeners}
                    onClose={() => setIsSyncModalOpen(false)} 
                />}
            </main>
            <Footer />
        </div>
    );
}