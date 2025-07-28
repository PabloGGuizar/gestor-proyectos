# Gestor de Proyectos con Solid

Una aplicación web moderna y "local-first" construida sobre el protocolo **Solid**, que te permite organizar tus ideas, proyectos y tareas en un almacén de datos personal (**Pod**) que solo tú controlas.

**[➡️ Ver la aplicación en vivo](https://pablogguizar.github.io/gestor-proyectos/)**

---

## ✨ Nuestra Filosofía: Tus Datos Son Tuyos

Este gestor de proyectos se adhiere a un principio fundamental: **el usuario debe tener control total sobre sus datos**.

A diferencia de las aplicaciones tradicionales que guardan tu información en sus propias bases de datos, esta herramienta se conecta directamente a tu **Solid Pod**. Un Pod es como tu disco duro personal en la web, un espacio seguro que te pertenece y que tú decides con qué aplicaciones compartir.

Esto significa que:
- **No dependes de nosotros**: Tus proyectos, notas y tareas no están en nuestros servidores. Están en tu Pod.
- **Privacidad por diseño**: Solo tú y las aplicaciones que autorices pueden acceder a tus datos.
- **Portabilidad total**: Si decides dejar de usar esta aplicación, todos tus datos permanecen intactos en tu Pod, listos para ser usados por otras herramientas compatibles con Solid.

## 🚀 De P2P a Solid: Nuestra Evolución

La versión anterios de esta aplicación utilizaba una conexión **P2P (Peer-to-Peer) con WebRTC** para sincronizar dispositivos en tiempo real. Aunque era una solución interesante para la sincronización instantánea, tenía una limitación importante: no ofrecía una verdadera persistencia de los datos a largo plazo.

Decidimos evolucionar a **Solid** porque se alinea perfectamente con la visión de una web descentralizada y centrada en el usuario. El cambio a Solid nos permitió:
-   **Eliminar las barreras de la red local**, permitiendo una sincronización universal desde cualquier lugar con internet.
-   **Ofrecer persistencia real de los datos**, protegiéndolos de la pérdida por limpieza de caché del navegador.
-   **Empoderar al usuario**, dándole la soberanía sobre su propia información, que es el objetivo final de este proyecto.

## 🛠️ Funcionalidades Principales

* **Sincronización Universal con Solid Pods**: Conecta tu Pod de Solid y accede a tus proyectos desde cualquier dispositivo y navegador.
* **Funcionamiento Offline-First**: Gracias a una caché local con Dexie.js, puedes seguir trabajando sin conexión. Tus cambios se sincronizarán automáticamente al reconectar.
* **PWA Instalable**: Funciona como una Progressive Web App. Puedes "instalarla" en tu escritorio o móvil para una experiencia similar a una aplicación nativa.
* **Gestión Completa de Proyectos (CRUD)**: Crea, lee, actualiza y elimina proyectos de forma sencilla.
* **Tareas, Notas y Detalles**: Cada proyecto puede contener listas de tareas, notas con formato y una descripción detallada con palabras clave.
* **Soporte de Markdown**: Usa formato simple (`#`, `**negrita**`, `*cursiva*`) en las descripciones y notas.
* **Búsqueda y Filtrado**: Encuentra proyectos rápidamente usando la barra de búsqueda o filtrando por palabras clave.
* **Respaldos Locales (Opcional)**: Los botones de "Exportar" e "Importar" te permiten crear copias de seguridad adicionales en formato `.json` en tu dispositivo local.
* **Selector de Tema y Multi-idioma**: Elige entre tema Claro/Oscuro y varios idiomas para la interfaz.

---

## 💻 Tecnologías Utilizadas

* **React**: Para construir una interfaz de usuario interactiva y moderna.
* **Vite**: Como herramienta de construcción y servidor de desarrollo ultra rápido.
* **Tailwind CSS**: Para un diseño estilizado, responsivo y personalizable.
* **Solid**:
    * **@inrupt/solid-client**: Para leer y escribir datos en Solid Pods.
    * **@inrupt/solid-client-authn-browser**: Para gestionar la autenticación de forma segura.
* **Dexie.js**: Como una envoltura amigable sobre IndexedDB para la base de datos local que permite el funcionamiento offline.
* **Lucide React**: Para los iconos limpios y consistentes.
* **vite-plugin-pwa**: Para automatizar la generación de las capacidades PWA.

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

## Créditos y Comunidad

* La idea y desarrollo de **Gestor de Proyectos** fue realizada por [Pablo G. Guizar](https://github.com/PabloGGuizar) con ayuda de Gemini.
* El repositorio de este proyecto se encuentra en: [GitHub - PabloGGuizar/gestor-proyectos](https://github.com/PabloGGuizar/gestor-proyectos).
* Este proyecto está indexado en el **Repositorio de aplicaciones educativas**, una colección de recursos creados por la comunidad Vibe Coding Educativo.
* Consulta más aplicaciones de esta comunidad en: [Repositorio Vibe Coding Educativo](https://vibe-coding-educativo.github.io/repositorio-apps/).
* Únete a la comunidad en Telegram: [t.me/vceduca](https://t.me/vceduca).
* Este proyecto se adhiere al [Decálogo del Conocimiento Abierto](https://vibe-coding-educativo.github.io/manifiesto/decalogo.html).

## Licencia

Este proyecto está bajo la [Licencia Creative Commons Atribución 4.0 Internacional](http://creativecommons.org/licenses/by/4.0/).
