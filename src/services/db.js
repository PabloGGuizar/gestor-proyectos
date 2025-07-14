// =======================================================================
// ARCHIVO NUEVO: src/services/db.js
// Este archivo contiene TODA la lógica de la base de datos local.
// Define la estructura y proporciona funciones para interactuar con ella.
// =======================================================================
import Dexie from 'dexie';

export const db = new Dexie('GestorProyectosDB');

// Definimos la estructura de la base de datos (nuestras "tablas")
db.version(1).stores({
  projects: '++id, name, description, createdAt' // '++id' es una clave autoincremental
});

// En Dexie, las propiedades que no están en el índice (como keywords, notes, tasks)
// se guardan automáticamente con el objeto, así que no necesitamos definirlas aquí.