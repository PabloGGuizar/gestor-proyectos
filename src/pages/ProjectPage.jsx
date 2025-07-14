// =======================================================================
// ARCHIVO: src/pages/ProjectPage.jsx
// Representa la pantalla de un proyecto individual.
// =======================================================================
import React, { useState } from 'react';
import { Plus, Trash2, X, Calendar, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function ProjectPage({ project, onUpdateProject, onBack, onViewNote }) {
    const [newTaskText, setNewTaskText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteText, setNewNoteText] = useState('');
    const [description, setDescription] = useState(project.description || '');
    const [keywords, setKeywords] = useState(project.keywords || []);
    const [newKeyword, setNewKeyword] = useState('');

    const handleUpdateDescription = () => { if (description !== project.description) { onUpdateProject(project.id, { description }); } };
    const handleAddKeyword = () => { const t = newKeyword.trim(); if (t && !keywords.includes(t)) { const u = [...keywords, t]; setKeywords(u); onUpdateProject(project.id, { keywords: u }); setNewKeyword(''); } };
    const handleRemoveKeyword = (k) => { const u = keywords.filter(i => i !== k); setKeywords(u); onUpdateProject(project.id, { keywords: u }); };
    const handleAddTask = () => { if (newTaskText.trim() === '') return; const t = { id: crypto.randomUUID(), text: newTaskText.trim(), completed: false, dueDate: dueDate || null }; onUpdateProject(project.id, { tasks: [...(project.tasks || []), t] }); setNewTaskText(''); setDueDate(''); };
    const handleToggleTask = (id) => { const u = project.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); onUpdateProject(project.id, { tasks: u }); };
    const handleDeleteTask = (id) => { const u = project.tasks.filter(t => t.id !== id); onUpdateProject(project.id, { tasks: u }); };
    
    const handleAddNote = () => {
        if (newNoteTitle.trim() === '') return;
        const newNote = { id: crypto.randomUUID(), title: newNoteTitle.trim(), text: newNoteText.trim() };
        onUpdateProject(project.id, { notes: [...(project.notes || []), newNote] });
        setNewNoteTitle('');
        setNewNoteText('');
    };

    const handleDeleteNote = (id) => { const u = project.notes.filter(n => n.id !== id); onUpdateProject(project.id, { notes: u }); };

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"><ArrowLeft size={20} />Volver al Tablero</button>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{project.name}</h1>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Detalles</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleUpdateDescription} placeholder="Añade una breve descripción..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" rows="4"></textarea>
                                <p className="text-xs text-gray-500 mt-1">Usa #, ##, ### para encabezados, **negrita** y *cursiva*.</p>
                            </div>
                            <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Palabras Clave</label>
                                <div className="flex flex-wrap gap-2 mb-2">{keywords.map(k => (<span key={k} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">{k}<button onClick={() => handleRemoveKeyword(k)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"><X size={12}/></button></span>))}</div>
                                <div className="flex gap-2"><input id="keywords" type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()} placeholder="Añadir y presionar Enter" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Notas</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                            {(project.notes || []).map(note => (
                                <div key={note.id} className="flex items-start justify-between bg-yellow-50 dark:bg-gray-700/80 p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewNote(note)}>
                                    <div className="flex-grow mr-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white truncate">{note.title}</h4>
                                        <MarkdownRenderer text={note.text} className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-2" />
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 border-t pt-4 border-gray-200 dark:border-gray-700">
                            <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="Título de la nueva nota" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none" />
                            <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Escribe el contenido de la nota..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none" rows="3" />
                            <p className="text-xs text-gray-500 -mt-1 mb-1">Usa #, ##, ### para encabezados, **negrita** y *cursiva*.</p>
                            <button onClick={handleAddNote} disabled={!newNoteTitle.trim()} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors font-semibold flex items-center justify-center gap-2 self-end disabled:bg-yellow-300 disabled:cursor-not-allowed"><Plus size={18} /> Añadir Nota</button>
                        </div>
                    </section>
                </div>
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Tareas</h3>
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
                        {(project.tasks || []).sort((a, b) => a.completed - b.completed).map(task => (<div key={task.id} className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-all hover:shadow-md"><button onClick={() => handleToggleTask(task.id)} className="mr-3">{task.completed ? <CheckSquare className="text-green-500" /> : <Square className="text-gray-400" />}</button><span className={`flex-grow ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{task.text}</span>{task.dueDate && (<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4"><Calendar size={16} className="mr-1.5" /><span>{task.dueDate}</span></div>)}<button onClick={() => handleDeleteTask(task.id)} className="ml-4 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button></div>))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Nueva tarea..." className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"><Plus size={18} /> Añadir</button>
                    </div>
                </section>
            </main>
        </div>
    );
}
