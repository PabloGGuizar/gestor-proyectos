import Dexie from 'dexie';

export const db = new Dexie('GestorProyectosDB');

// Dejamos únicamente la versión 1, que es la correcta y estable.
db.version(1).stores({
  projects: '++id, name, description, createdAt'
});