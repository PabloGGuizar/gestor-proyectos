// src/components/HelpModal.jsx
import React from 'react';
import { X, HardDrive, Upload, Download } from 'lucide-react';

export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Guía de Ayuda</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="text-gray-600 dark:text-gray-300" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto text-gray-700 dark:text-gray-300 space-y-6">
          <section>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <HardDrive size={20} /> ¿Cómo funciona esta aplicación?
            </h4>
            <p>
              Este gestor de proyectos es una aplicación "local-first". Esto significa que todos tus proyectos, notas y tareas se guardan directamente en la base de datos de **este navegador, en este dispositivo**. No se envían a ninguna nube o servidor externo.
            </p>
          </section>
          <section>
            <h4 className="font-bold text-lg text-red-600 dark:text-red-400 mb-2">
              ¡Importante! Sobre el Almacenamiento Local
            </h4>
            <p className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg">
              Al depender del almacenamiento del navegador, si limpias la caché, los datos de navegación o formateas tu dispositivo, **todos tus proyectos se perderán permanentemente**.
            </p>
          </section>
          <section>
            <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
              <Download size={20} /> Respalda tus Datos (Recomendado)
            </h4>
            <p>
              Para evitar la pérdida de datos, te recomendamos encarecidamente que uses el botón de **Exportar** con regularidad. Esto guardará una copia de seguridad de todos tus proyectos en un archivo `.json` en tu computadora.
            </p>
          </section>
           <section>
            <h4 className="font-bold text-lg text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <Upload size={20} /> Restaura desde un Respaldo
            </h4>
            <p>
              Si cambias de navegador, de dispositivo o necesitas restaurar tu información, puedes usar el botón de **Importar** y seleccionar el archivo `.json` que exportaste previamente. Ten en cuenta que esto sobreescribirá los datos actuales.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}