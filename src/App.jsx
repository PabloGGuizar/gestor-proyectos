// =======================================================================
// ARCHIVO: src/App.jsx
// Este componente ahora actúa como el "enrutador" principal. Decide qué
// página mostrar y maneja el estado global de la navegación.
// =======================================================================
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';

import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ConfirmationModal from './components/ConfirmationModal';
import NoteViewModal from './components/NoteViewModal';
import HelpModal from './components/HelpModal';
import Footer from './components/Footer'; 

export default function App() {
    // Estado de la aplicación
    const [error, setError] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null); // Puede ser proyecto o nota
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const [importConfirmation, setImportConfirmation] = useState(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); 

    // useLiveQuery se suscribe a la base de datos y se actualiza en tiempo real
    const projects = useLiveQuery(
        () => db.projects.orderBy('createdAt').reverse().toArray(),
        [], // Dependencias
        []  // Valor inicial
    );
    
    const isLoading = projects === undefined;

    // --- Funciones CRUD para Proyectos ---
    const handleAddProject = async (name) => {
        if (name.trim() === '') return;
        try {
            await db.projects.add({
                name: name.trim(),
                description: '',
                keywords: [],
                notes: [],
                tasks: [],
                createdAt: new Date(),
            });
        } catch (e) {
            console.error("Error adding project:", e);
            setError("No se pudo agregar el proyecto.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await db.projects.delete(itemToDelete);
            setItemToDelete(null);
            if (selectedProjectId === itemToDelete) {
                navigateToDashboard();
            }
        } catch (e) {
            console.error("Error deleting project:", e);
            setError("No se pudo eliminar el proyecto.");
            setItemToDelete(null);
        }
    };

    const handleUpdateProject = async (id, data) => {
        try {
            await db.projects.update(id, data);
        } catch (e) {
            console.error("Update error:", e);
            setError("No se pudo actualizar el proyecto.");
        }
    };

    // --- Funciones de Importación y Exportación ---
    const handleExportData = async () => {
        try {
            const allProjects = await db.projects.toArray();
            const dataStr = JSON.stringify({ projects: allProjects }, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gestor-proyectos-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Error exporting data:", e);
            setError("No se pudieron exportar los datos.");
        }
    };

    const handleImportData = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.projects && Array.isArray(data.projects)) {
                    // Pedir confirmación antes de sobreescribir
                    setImportConfirmation(data.projects);
                } else {
                    throw new Error("El archivo JSON no tiene el formato correcto.");
                }
            } catch (e) {
                console.error("Error parsing import file:", e);
                setError("El archivo seleccionado no es un JSON válido o tiene un formato incorrecto.");
            }
        };
        reader.readAsText(file);
    };
    
    const confirmImport = async () => {
        if (!importConfirmation) return;
        try {
             // Transacción para asegurar que todo se haga o nada
            await db.transaction('rw', db.projects, async () => {
                await db.projects.clear(); // Borra todos los proyectos existentes
                // Dexie se encarga de los tipos de datos como Date
                const projectsToImport = importConfirmation.map(p => ({
                    ...p,
                    createdAt: new Date(p.createdAt), // Asegurarse de que la fecha es un objeto Date
                    id: undefined // Dejar que Dexie asigne nuevos IDs
                }));
                await db.projects.bulkAdd(projectsToImport);
            });
            setImportConfirmation(null);
        } catch (e) {
            console.error("Error importing data:", e);
            setError("Ocurrió un error al importar los datos.");
            setImportConfirmation(null);
        }
    };


    // --- Navegación ---
    const navigateToProject = (id) => {
        setSelectedProjectId(id);
        setCurrentPage('project');
    };

    const navigateToDashboard = () => {
        setSelectedProjectId(null);
        setCurrentPage('dashboard');
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert"><p>{error}</p></div>}
                
                {currentPage === 'dashboard' && (
                    <DashboardPage 
                        projects={projects} 
                        onAddProject={handleAddProject} 
                        onOpenProject={navigateToProject} 
                        onDeleteProject={setItemToDelete} 
                        isLoading={isLoading}
                        onExport={handleExportData}
                        onImport={handleImportData}
                        onOpenHelp={() => setIsHelpModalOpen(true)}
                    />
                )}
                
                {currentPage === 'project' && selectedProject && (
                    <ProjectPage 
                        project={selectedProject} 
                        onUpdateProject={handleUpdateProject} 
                        onBack={navigateToDashboard} 
                        onViewNote={setViewingNote} 
                    />
                )}

                {itemToDelete && <ConfirmationModal title="¿Confirmar Eliminación?" message="Esta acción es permanente." onConfirm={handleConfirmDelete} onCancel={() => setItemToDelete(null)} />}
                {importConfirmation && <ConfirmationModal title="¿Confirmar Importación?" message="Esto borrará todos los datos actuales y los reemplazará con el contenido del archivo. ¿Estás seguro?" onConfirm={confirmImport} onCancel={() => setImportConfirmation(null)} />}
                {viewingNote && <NoteViewModal note={viewingNote} onClose={() => setViewingNote(null)} />}
                {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}     
            </main>

            <Footer />
        </div>
    );
}