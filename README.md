# Gestor de Proyectos

Una aplicación web moderna, "local-first" y PWA (Progressive Web App) para organizar tus ideas, proyectos y tareas en un solo lugar.

**[➡️ Ver la aplicación en vivo](https://pablogguizar.github.io/gestor-proyectos/)**

---

## ✨ Funcionalidades Principales

Este gestor de proyectos está diseñado para ser rápido, privado y potente.

* **🗄️ Almacenamiento Local (Local-First):** Utiliza la base de datos IndexedDB de tu navegador a través de Dexie.js para un acceso sin conexión rápido y fiable.

* **🔄 Sincronización P2P en Tiempo Real (WebRTC):** Conecta múltiples dispositivos (como tu portátil y tu móvil) en la misma red de forma segura. Escanea un código QR para establecer una conexión directa y ver cómo los cambios se reflejan en tiempo real en todos tus dispositivos sincronizados.

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
* **PeerJS:** Para simplificar la conectividad P2P a través de WebRTC.
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

## Licencia

Este proyecto está bajo la [Licencia Creative Commons Atribución 4.0 Internacional](http://creativecommons.org/licenses/by/4.0/).

## Créditos y Comunidad

* La idea y desarrollo de **Gestor de Proyectos** fue realizada por Juan Pablo Guízar ([PabloGGuizar](https://github.com/PabloGGuizar)) con ayuda de Gemini.
* El repositorio de este proyecto se encuentra en: [GitHub - PabloGGuizar/gestor-proyectos](https://github.com/PabloGGuizar/gestor-proyectos).
* Este proyecto está indexado en el **Repositorio de aplicaciones educativas**, una colección de recursos creados por la comunidad Vibe Coding Educativo.
* Consulta más aplicaciones de esta comunidad en: [Repositorio Vibe Coding Educativo](https://www.google.com/search?q=https://vibe-coding-educativo.github.io/repositorio-apps/).
* Únete a la comunidad en Telegram: [t.me/vceduca](https://t.me/vceduca).
* Este proyecto se adhiere al [Decálogo del Conocimiento Abierto](https://www.google.com/search?q=https://vibe-coding-educativo.github.io/manifiesto/decalogo.html).