// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="text-center py-6 px-4 text-sm text-gray-500 dark:text-gray-400">
      <p>Creado por Pablo G. Guizar con la ayuda de Gemini.</p>
      <p className="mt-1">
        <a
          href="http://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-500"
        >
          Licencia Creative Commons Atribución 4.0 Internacional
        </a>
      </p>
    </footer>
  );
}