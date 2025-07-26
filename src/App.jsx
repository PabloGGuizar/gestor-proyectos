// =======================================================================
// ARCHIVO: src/App.jsx
// VERSIÓN FINAL CON SINCRONIZACIÓN MANUAL Y CONTINUA
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
    
    // ... (otros estados no cambian)
    const [error, setError] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const [importConfirmation, setImportConfirmation] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [fileHandle, setFileHandle] = useState(null);

    const peerRef = useRef(null);
    const connRef = useRef(null);

    // Efecto para inicializar PeerJS y manejar conexiones
    useEffect(() => {
        const peer = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
                ],
            },
        });
        peerRef.current = peer;

        peer.on('connection', (conn) => {
            connRef.current = conn;
            setupConnectionListeners(conn);
        });

        return () => { if (peer) peer.destroy(); };
    }, []);

    const handleDataReceived = async (data) => {
        if (data.type === 'full-sync') {
            await db.transaction('rw', db.projects, async () => {
                const localProjects = await db.projects.toArray();
                const localMap = new Map(localProjects.map(p => [p.id, p]));
                
                for (const remoteProject of data.payload) {
                    const localProject = localMap.get(remoteProject.id);
                    if (!localProject || new Date(remoteProject.updatedAt) > new Date(localProject.updatedAt)) {
                        await db.projects.put(remoteProject);
                    }
                }
            });
        } else if (data.type === 'project-update') {
            await db.projects.put(data.payload);
        } else if (data.type === 'project-delete') {
            await db.projects.delete(data.payload);
        }
    };
    
    const setupConnectionListeners = (conn) => {
        conn.on('open', async () => {
            const allProjects = await db.projects.toArray();
            conn.send({ type: 'full-sync', payload: allProjects });
            setIsSyncModalOpen(false);
        });
        conn.on('data', handleDataReceived);
        conn.on('close', () => { connRef.current = null; console.log("Conexión cerrada."); });
        conn.on('error', () => { connRef.current = null; console.log("Conexión perdida."); });
    };

    const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray(), [], []);
    const isLoading = projects === undefined;

    // ========= CAMBIOS EN LAS FUNCIONES DE MODIFICACIÓN DE DATOS =========
    const handleAddProject = async (name) => {
        if (name.trim()) {
            const newProject = {
                name: name.trim(), description: '', keywords: [], notes: [], tasks: [], 
                createdAt: new Date(), updatedAt: new Date()
            };
            const newId = await db.projects.add(newProject);
            if (connRef.current && connRef.current.open) {
                connRef.current.send({ type: 'project-update', payload: { ...newProject, id: newId } });
            }
        }
    };
    
    const handleUpdateProject = async (id, data) => {
        const updatedData = { ...data, updatedAt: new Date() };
        await db.projects.update(id, updatedData);
        if (connRef.current && connRef.current.open) {
            const updatedProject = await db.projects.get(id);
            connRef.current.send({ type: 'project-update', payload: updatedProject });
        }
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            await db.projects.delete(itemToDelete);
            if (connRef.current && connRef.current.open) {
                connRef.current.send({ type: 'project-delete', payload: itemToDelete });
            }
            setItemToDelete(null);
            if (selectedProjectId === itemToDelete) navigateToDashboard();
        }
    };

    // ... (El resto de funciones y el return no cambian)
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