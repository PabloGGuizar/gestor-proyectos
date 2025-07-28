// =======================================================================
// ARCHIVO: src/services/solidService.js
// VERSIÓN FINAL CON LÓGICA DE SOBRESCRITURA ROBUSTA
// =======================================================================
import {
  getSolidDataset, getThing, getThingAll, setThing, createThing, removeThing,
  saveSolidDatasetAt, createSolidDataset, getStringNoLocale, setStringNoLocale,
  getUrl, setUrl, createContainerAt, asUrl, deleteFile,
} from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { RDF } from '@inrupt/vocab-common-rdf';

const PROJECT_VOCAB = {
  Project: "http://schema.org/CreativeWork", name: "http://schema.org/name",
  description: "http://schema.org/description", keywords: "http://schema.org/keywords",
  tasks: "http://purl.org/ontology/po/Task", notes: "http://purl.org/ontology/po/Note",
};

const getProjectsContainerUrl = (webId) => {
  if (!webId) throw new Error("WebID no definido.");
  const podUrl = webId.split('/profile/card#me')[0];
  return `${podUrl}/private/gestor-proyectos/`;
};

const getProjectsDatasetUrl = (webId) => {
  return `${getProjectsContainerUrl(webId)}data.ttl`;
};

async function ensureContainerExists(containerUrl, fetch) {
  try {
    await getSolidDataset(containerUrl, { fetch });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await createContainerAt(containerUrl, { fetch });
    } else { throw error; }
  }
}

const thingToProject = (thing) => ({
    id: asUrl(thing),
    name: getStringNoLocale(thing, PROJECT_VOCAB.name) || 'Proyecto sin nombre',
    description: getStringNoLocale(thing, PROJECT_VOCAB.description) || '',
    keywords: JSON.parse(getStringNoLocale(thing, PROJECT_VOCAB.keywords) || '[]'),
    tasks: JSON.parse(getStringNoLocale(thing, PROJECT_VOCAB.tasks) || '[]'),
    notes: JSON.parse(getStringNoLocale(thing, PROJECT_VOCAB.notes) || '[]'),
});

export async function getProjects() {
    // ... (sin cambios)
  const session = getDefaultSession();
  if (!session.info.isLoggedIn || !session.info.webId) return [];
  const projectsUrl = getProjectsDatasetUrl(session.info.webId);
  try {
    const projectsDataset = await getSolidDataset(projectsUrl, { fetch: session.fetch });
    const projectThings = getThingAll(projectsDataset).filter(t => getUrl(t, RDF.type) === PROJECT_VOCAB.Project);
    return projectThings.map(thingToProject);
  } catch (error) {
    if (error.response && error.response.status === 404) return [];
    console.error("Error al obtener los proyectos:", error); throw error;
  }
}

export async function saveProject(projectData) {
    // ... (sin cambios)
  const session = getDefaultSession();
  if (!session.info.isLoggedIn || !session.info.webId) throw new Error("Usuario no autenticado o sin WebID.");
  const containerUrl = getProjectsContainerUrl(session.info.webId);
  const projectsUrl = getProjectsDatasetUrl(session.info.webId);
  await ensureContainerExists(containerUrl, session.fetch);
  let projectsDataset;
  try {
    projectsDataset = await getSolidDataset(projectsUrl, { fetch: session.fetch });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      projectsDataset = createSolidDataset();
    } else { throw error; }
  }
  const isUpdate = projectData.id && !projectData.id.startsWith('local-');
  const thingName = isUpdate ? projectData.id.substring(projectData.id.lastIndexOf('#') + 1) : `proj-${Date.now()}`;
  const thingUrl = `${projectsUrl}#${thingName}`;
  let projectThing = getThing(projectsDataset, thingUrl) ?? createThing({ url: thingUrl });
  projectThing = setUrl(projectThing, RDF.type, PROJECT_VOCAB.Project);
  projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.name, projectData.name);
  projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.description, projectData.description || '');
  projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.keywords, JSON.stringify(projectData.keywords || []));
  projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.tasks, JSON.stringify(projectData.tasks || []));
  projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.notes, JSON.stringify(projectData.notes || []));
  projectsDataset = setThing(projectsDataset, projectThing);
  const savedDataset = await saveSolidDatasetAt(projectsUrl, projectsDataset, { fetch: session.fetch });
  const savedThing = getThing(savedDataset, thingUrl);
  if (!savedThing) throw new Error("El proyecto no se encontró en el dataset después de guardar.");
  return thingToProject(savedThing);
}

export async function deleteProject(projectId) {
    // ... (sin cambios)
  const session = getDefaultSession();
  if (!session.info.isLoggedIn || !session.info.webId) throw new Error("Usuario no autenticado.");
  const projectsUrl = getProjectsDatasetUrl(session.info.webId);
  try {
    let projectsDataset = await getSolidDataset(projectsUrl, { fetch: session.fetch });
    projectsDataset = removeThing(projectsDataset, projectId);
    await saveSolidDatasetAt(projectsUrl, projectsDataset, { fetch: session.fetch });
  } catch (error) { console.error("Error al eliminar el proyecto:", error); throw error; }
}

export async function overwriteProjects(projects) {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn || !session.info.webId) {
    throw new Error("Usuario no autenticado o sin WebID.");
  }

  const containerUrl = getProjectsContainerUrl(session.info.webId);
  const projectsUrl = getProjectsDatasetUrl(session.info.webId);

  await ensureContainerExists(containerUrl, session.fetch);

  // **INICIO DE LA CORRECCIÓN**
  // Primero, intenta borrar el archivo antiguo si existe.
  try {
    await deleteFile(projectsUrl, { fetch: session.fetch });
  } catch (error) {
    // Si el archivo no existe (404), ignoramos el error y continuamos.
    if (!error.response || error.response.status !== 404) {
      console.error("No se pudo borrar el archivo antiguo, puede que no existiera:", error);
    }
  }

  // Ahora, creamos un dataset nuevo y lo guardamos
  let newProjectsDataset = createSolidDataset();
  for (const projectData of projects) {
    const thingName = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let projectThing = createThing({ name: thingName });
    
    projectThing = setUrl(projectThing, RDF.type, PROJECT_VOCAB.Project);
    projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.name, projectData.name);
    // ... (resto de las propiedades)
    projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.description, projectData.description || '');
    projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.keywords, JSON.stringify(projectData.keywords || []));
    projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.tasks, JSON.stringify(projectData.tasks || []));
    projectThing = setStringNoLocale(projectThing, PROJECT_VOCAB.notes, JSON.stringify(projectData.notes || []));
    
    newProjectsDataset = setThing(newProjectsDataset, projectThing);
  }
  await saveSolidDatasetAt(projectsUrl, newProjectsDataset, { fetch: session.fetch });
  // **FIN DE LA CORRECCIÓN**
}

export async function processSyncQueue(queue) {
    // ... (sin cambios)
  for (const item of queue) {
    try {
      if (item.type === 'add' || item.type === 'update') {
        await saveProject(item.payload);
      } else if (item.type === 'delete') {
        if (item.payload.id && !item.payload.id.startsWith('local-')) {
          await deleteProject(item.payload.id);
        }
      }
    } catch (error) { console.error(`Falló el procesamiento del elemento de la cola: ${item.id}`, error); }
  }
}