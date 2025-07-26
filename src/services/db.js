// =======================================================================
// ARCHIVO: src/services/db.js
// VERSIÓN SIMPLIFICADA Y CORREGIDA
// =======================================================================
import Dexie from 'dexie';

export const db = new Dexie('GestorProyectosDB');

// Dejamos únicamente la versión 2, que es la correcta y estable.
db.version(2).stores({
  projects: '++id, name, description, createdAt, updatedAt'
});

// Mantenemos la versión 1 por si un usuario antiguo no ha actualizado
db.version(1).stores({
  projects: '++id, name, description, createdAt'
}).upgrade(tx => {
  // Migración para añadir updatedAt a proyectos existentes
  return tx.table("projects").toCollection().modify(proj => {
    if (!proj.updatedAt) {
      proj.updatedAt = proj.createdAt;
    }
  });
});