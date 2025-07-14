// =======================================================================
// ARCHIVO: src/pages/DashboardPage.jsx
// Representa la pantalla principal (el tablero).
// =======================================================================
import React, { useState, useMemo, useRef } from 'react';
import { Plus, Search, Upload, Download, HelpCircle  } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import UpcomingTasksSidebar from '../components/UpcomingTasksSidebar';

export default function DashboardPage({ projects, onAddProject, onOpenProject, onDeleteProject, isLoading, onExport, onImport, onOpenHelp }) {
    const [newProjectName, setNewProjectName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState('Todos');
    const importInputRef = useRef(null);

    const handleAdd = () => { onAddProject(newProjectName); setNewProjectName(''); };

    const allKeywords = useMemo(() => {
        const keywords = new Set(['Todos']);
        (projects || []).forEach(p => { (p.keywords || []).forEach(k => keywords.add(k)); });
        return Array.from(keywords);
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return (projects || []).filter(project => {
            const matchesKeyword = selectedKeyword === 'Todos' || (project.keywords || []).includes(selectedKeyword);
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                project.name.toLowerCase().includes(lowerSearchTerm) ||
                (project.description || '').toLowerCase().includes(lowerSearchTerm);
            return matchesKeyword && matchesSearch;
        });
    }, [projects, searchTerm, selectedKeyword]);

    const handleImportClick = () => {
        importInputRef.current.click();
    };
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        onImport(file);
        event.target.value = null; // Reset input para poder importar el mismo archivo de nuevo
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Gestor de Proyectos</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Organiza tus ideas, proyectos y tareas en un solo lugar.</p>
                        </div>
                        <div className="flex gap-2">
                            <input type="file" accept=".json" ref={importInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={handleImportClick} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><Upload size={18} /> Importar</button>
                            <button onClick={onExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"><Download size={18} /> Exportar</button>
                            <button onClick={onOpenHelp} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><HelpCircle size={18} /> Ayuda
              </button>
                        </div>
                    </div>
                </header>
                
                <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Crear un nuevo proyecto</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} placeholder="Nombre de tu nueva idea o proyecto..." className="flex-grow w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" />
                            <button onClick={handleAdd} disabled={!newProjectName.trim()} className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"><Plus />Añadir Proyecto</button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Buscar y Filtrar</h2>
                         <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o descripción..." className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allKeywords.map(keyword => (
                                <button key={keyword} onClick={() => setSelectedKeyword(keyword)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedKeyword === keyword ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>{keyword}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading ? (<div className="text-center py-10"><p className="text-lg text-gray-500">Cargando base de datos local...</p></div>) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredProjects.map(project => (<ProjectCard key={project.id} project={project} onOpen={onOpenProject} onDelete={onDeleteProject} />))}
                    </div>
                )}
                {!isLoading && filteredProjects.length === 0 && (
                    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow">
                        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">No se encontraron proyectos</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta ajustar tu búsqueda o filtro, o crea tu primer proyecto.</p>
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