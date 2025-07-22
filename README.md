# Gestor de Proyectos

Una aplicación web moderna, "local-first" y PWA (Progressive Web App) para organizar tus ideas, proyectos y tareas en un solo lugar.

**[➡️ Ver la aplicación en vivo](https://pablogguizar.github.io/gestor-proyectos/)**

---

## ✨ Funcionalidades Principales

Este gestor de proyectos está diseñado para ser rápido, privado y potente. Todas tus datos se guardan directamente en tu navegador o, si lo prefieres, en un archivo local en tu disco.

* **🗄️ Almacenamiento Local (Local-First):** Utiliza la base de datos IndexedDB de tu navegador a través de Dexie.js para un acceso sin conexión rápido y fiable.
* **💾 Acceso al Sistema de Archivos:** Usa la File System Access API para abrir, leer y guardar tus proyectos directamente en un archivo `.json` en tu computadora. ¡Tus datos, tu control!
* **⭐ PWA Instalable:** Funciona como una Progressive Web App. Puedes "instalarla" en tu escritorio o móvil para una experiencia similar a una aplicación nativa, con acceso sin conexión.
* **✏️ Gestión Completa de Proyectos (CRUD):** Crea, lee, actualiza y elimina proyectos de forma sencilla, incluyendo la capacidad de editar sus nombres.
* **📝 Tareas, Notas y Detalles:** Cada proyecto puede contener:
    * Una lista de **tareas** con fechas de vencimiento opcionales.
    * Una lista de **notas** con título y contenido.
    * Una **descripción** detallada y **palabras clave** para una mejor organización.
* **✍️ Soporte de Texto Enriquecido:** Usa Markdown simple (`#`, `##`, `**negrita**`, `*cursiva*`) en las descripciones y notas para dar formato a tu texto.
* **🔍 Búsqueda y Filtrado:** Encuentra proyectos rápidamente usando la barra de búsqueda o filtrando por palabras clave.
* **🗓️ Vista de Próximas Tareas:** Un panel lateral te muestra de un vistazo las tareas con fecha límite en los próximos 7 días.
* **🎨 Selector de Tema:** Elige entre tema Claro, Oscuro o el que use tu Sistema Operativo. Tu preferencia se guarda.
* **🌐 Soporte Multi-idioma (i18n):** La interfaz está disponible en Español, Inglés, Catalán, Euskera y Gallego.

---

## 🛠️ Tecnologías Utilizadas

* **React:** Para construir una interfaz de usuario interactiva y moderna.
* **Vite:** Como herramienta de construcción y servidor de desarrollo ultra rápido.
* **Tailwind CSS:** Para un diseño estilizado, responsivo y personalizable.
* **Dexie.js:** Como una envoltura amigable sobre IndexedDB para la base de datos local.
* **Lucide React:** Para los iconos limpios y consistentes.
* **vite-plugin-pwa:** Para automatizar la generación de las capacidades PWA.

---

## 🚀 Cómo Ejecutar en Local

Si deseas ejecutar este proyecto en tu propia máquina, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/PabloGGuizar/gestor-proyectos.git](https://github.com/PabloGGuizar/gestor-proyectos.git)
    ```

2.  **Navega al directorio del proyecto:**
    ```bash
    cd gestor-proyectos
    ```

3.  **Instala las dependencias:**
    ```bash
    npm install
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

5.  Abre tu navegador y ve a la dirección que te indique la terminal (normalmente `http://localhost:5173`).

---

<div align="center">

Creado por Pablo G. Guizar con la ayuda de Gemini.

<p>
  <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
    Licencia Creative Commons Atribución 4.0 Internacional
  </a>
  <span style="margin: 0 10px;">|</span>
  <a href="https://pablogguizar.github.io/gestor-proyectos/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/master/icons/github.svg" width="16" height="16" style="vertical-align: middle; margin-right: 4px;" />
    Ver Aplicación
  </a>
</p>

</div>