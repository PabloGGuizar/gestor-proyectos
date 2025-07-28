// src/services/db.js
import Dexie from 'dexie';

export const db = new Dexie('GestorProyectosDB');

// Incrementamos la versión para añadir la nueva tabla de sincronización
db.version(3).stores({
  projects: '++id, name, description, createdAt, updatedAt',
  // Nueva tabla para registrar cambios offline
  syncQueue: '++id, type, payload' // type: 'add', 'update', 'delete'
});

// ... (mantienes las versiones anteriores para la migración)
db.version(2).stores({
  projects: '++id, name, description, createdAt, updatedAt'
});

db.version(1).stores({
  projects: '++id, name, description, createdAt'
}).upgrade(tx => {
  return tx.table("projects").toCollection().modify(proj => {
    if (!proj.updatedAt) {
      proj.updatedAt = proj.createdAt;
    }
  });
});