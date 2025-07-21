import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Calendar, CheckSquare, Square, ArrowLeft, Edit2, Check } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { useLocalization } from '../context/LanguageContext';

export default function ProjectPage({ project, onUpdateProject, onBack, onViewNote }) {
    const { t } = useLocalization();
    const [isEditingName, setIsEditingName] = useState(false);
    const [projectName, setProjectName] = useState(project.name);
    const [newTaskText, setNewTaskText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteText, setNewNoteText] = useState('');
    const [description, setDescription] = useState(project.description || '');
    const [keywords, setKeywords] = useState(project.keywords || []);
    const [newKeyword, setNewKeyword] = useState('');

    // Sincroniza el nombre del proyecto si el prop cambia
    useEffect(() => {
        setProjectName(project.name);
    }, [project.name]);

    const handleNameUpdate = () => {
        if (projectName.trim() && projectName.trim() !== project.name) {
            onUpdateProject(project.id, { name: projectName.trim() });
        }
        setIsEditingName(false);
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setProjectName(project.name);
    };

    const handleUpdateDescription = () => { if (description !== project.description) { onUpdateProject(project.id, { description }); } };
    const handleAddKeyword = () => { const trimmed = newKeyword.trim(); if (trimmed && !keywords.includes(trimmed)) { const updated = [...keywords, trimmed]; setKeywords(updated); onUpdateProject(project.id, { keywords: updated }); setNewKeyword(''); } };
    const handleRemoveKeyword = (k) => { const updated = keywords.filter(i => i !== k); setKeywords(updated); onUpdateProject(project.id, { keywords: updated }); };
    const handleAddTask = () => { if (newTaskText.trim() === '') return; const task = { id: crypto.randomUUID(), text: newTaskText.trim(), completed: false, dueDate: dueDate || null }; onUpdateProject(project.id, { tasks: [...(project.tasks || []), task] }); setNewTaskText(''); setDueDate(''); };
    const handleToggleTask = (id) => { const updated = project.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); onUpdateProject(project.id, { tasks: updated }); };
    const handleDeleteTask = (id) => { const updated = project.tasks.filter(t => t.id !== id); onUpdateProject(project.id, { tasks: updated }); };
    const handleAddNote = () => { if (newNoteTitle.trim() === '') return; const note = { id: crypto.randomUUID(), title: newNoteTitle.trim(), text: newNoteText.trim() }; onUpdateProject(project.id, { notes: [...(project.notes || []), note] }); setNewNoteTitle(''); setNewNoteText(''); };
    const handleDeleteNote = (id) => { const updated = project.notes.filter(n => n.id !== id); onUpdateProject(project.id, { notes: updated }); };

    return (
        <div className="animate-fade-in">
            <header className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"><ArrowLeft size={20} />{t('backToDashboard')}</button>
                <div className="flex items-center gap-4">
                    {isEditingName ? (
                        <>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleNameUpdate()}
                                className="text-4xl font-extrabold text-slate-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                                autoFocus
                            />
                            <button onClick={handleNameUpdate} className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"><Check size={24} /></button>
                            <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><X size={24} /></button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mr-2">{project.name}</h1>
                            <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <Edit2 size={20} />
                            </button>
                        </>
                    )}
                </div>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">{t('details')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('description')}</label>
                                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleUpdateDescription} placeholder={t('descriptionPlaceholder')} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" rows="4"></textarea>
                                <p className="text-xs text-slate-500 mt-1">{t('formattingHelp')}</p>
                            </div>
                            <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('keywords')}</label>
                                <div className="flex flex-wrap gap-2 mb-2">{keywords.map(k => (<span key={k} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">{k}<button onClick={() => handleRemoveKeyword(k)} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"><X size={12}/></button></span>))}</div>
                                <div className="flex gap-2"><input id="keywords" type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()} placeholder={t('keywordsPlaceholder')} className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">{t('notes')}</h3>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                            {(project.notes || []).map(note => (
                                <div key={note.id} className="flex items-start justify-between bg-yellow-50 dark:bg-slate-700/80 p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewNote(note)}>
                                    <div className="flex-grow mr-4">
                                        <h4 className="font-bold text-slate-800 dark:text-white truncate">{note.title}</h4>
                                        <MarkdownRenderer text={note.text} className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-2" />
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 border-t pt-4 border-slate-200 dark:border-slate-700">
                            <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder={t('newNoteTitlePlaceholder')} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none" />
                            <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder={t('newNoteContentPlaceholder')} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none" rows="3" />
                            <p className="text-xs text-slate-500 -mt-1 mb-1">{t('formattingHelp')}</p>
                            <button onClick={handleAddNote} disabled={!newNoteTitle.trim()} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold flex items-center justify-center gap-2 self-end disabled:bg-yellow-300 disabled:cursor-not-allowed"><Plus size={18} /> {t('addNote')}</button>
                        </div>
                    </section>
                </div>
                <section className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-white">{t('tasks')}</h3>
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
                        {(project.tasks || []).sort((a, b) => a.completed - b.completed).map(task => (<div key={task.id} className="flex items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg transition-all hover:shadow-md"><button onClick={() => handleToggleTask(task.id)} className="mr-3">{task.completed ? <CheckSquare className="text-green-500" /> : <Square className="text-slate-400" />}</button><span className={`flex-grow ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{task.text}</span>{task.dueDate && (<div className="flex items-center text-sm text-slate-500 dark:text-slate-400 ml-4"><Calendar size={16} className="mr-1.5" /><span>{task.dueDate}</span></div>)}<button onClick={() => handleDeleteTask(task.id)} className="ml-4 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button></div>))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder={t('newTaskPlaceholder')} className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <button onClick={handleAddTask} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"><Plus size={18} /> {t('addTask')}</button>
                    </div>
                </section>
            </main>
        </div>
    );
}