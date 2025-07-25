import Dexie from 'dexie';

export const db = new Dexie('GestorProyectosDB');

// MEJORA: Añadimos 'updatedAt' al esquema para indexarlo.
// Dexie maneja las actualizaciones de versión automáticamente.
db.version(2).stores({
  projects: '++id, name, description, createdAt, updatedAt'
}).upgrade(tx => {
  // Lógica de migración (opcional para este caso, pero buena práctica)
  // Como 'updatedAt' se añade en la app, no necesitamos migrar datos antiguos.
  return tx.table("projects").toCollection().modify(proj => {
    if (!proj.updatedAt) {
      proj.updatedAt = proj.createdAt;
    }
  });
});

// Mantenemos la versión 1 por si un usuario antiguo no ha actualizado
db.version(1).stores({
  projects: '++id, name, description, createdAt'
});