import { registerUser } from '../services/userService.js';
import { sendRecoveryEmail } from '../services/userService.js';
import { resetPassword } from '../services/userService.js';
import { loginUser } from '../services/userService.js';
import { logoutUser } from '../services/userService.js';
import { getTasks, updateTaskStatus } from '../services/taskService.js';
import { createTask } from '../services/taskService.js';
import { updateTask } from '../services/taskService.js';
import { deleteTask } from '../services/taskService.js';
import {updateTaskStatus} from '../services/taskService.js';

const app = document.getElementById('app');

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Load an HTML fragment by view name and initialize its corresponding logic.
 * @async
 * @param {string} name - The view name to load (e.g., "home", "board").
 * @throws {Error} If the view cannot be fetched.
 */
async function loadView(name, queryString) {
  const res = await fetch(viewURL(name));
  if (!res.ok) throw new Error(`Failed to load view: ${name}`);
  const html = await res.text();
  app.innerHTML = html;

  if (name === 'home') initHome();
  if (name === 'register') initRegister();
  if (name === 'tasks') initTasks();
  if (name === 'login') initLogin2();
  if (name === 'send-email') initSendEmail();
  if (name === 'recover-password') initRecoverPassword(queryString);

  // ✅ NUEVAS VISTAS
  if (name === 'profile') initProfile();
  if (name === 'edit-profile') initEditProfile();
  if (name === 'edit-task') initEditTask();
  initLogout();
}

/**
 * Initialize the hash-based router.
 * Attaches an event listener for URL changes and triggers the first render.
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); // first render
}

/**
 * Handle the current route based on the location hash.
 * Fallback to 'home' if the route is unknown.
 */
function handleRoute() {
  const path = (location.hash.startsWith('#/') ? location.hash.slice(2) : '') || 'home';
  const [routeName, queryString] = path.split("?");
  const known = ['home', 'login', 'register', 'send-email', 'recover-password', 'recover-code', 'tasks', 'profile', 'edit-profile', 'edit-task'];
  const route = known.includes(routeName) ? routeName : 'home';

  loadView(route, queryString).catch(err => {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "home" view.
 * Attaches a submit handler to the register form to navigate to the board.
 */
function initHome() {
  const form = document.getElementById('registerForm');
  const userInput = document.getElementById('username');
  const passInput = document.getElementById('password');
  const msg = document.getElementById('registerMsg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const username = userInput?.value.trim();
    const password = passInput?.value.trim();

    if (!username || !password) {
      msg.textContent = 'Por favor completa usuario y contraseña.';
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await registerUser({ username, password });
      msg.textContent = 'Registro exitoso';

      setTimeout(() => (location.hash = '#/login'), 400);
    } catch (err) {
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

// Función initTasks actualizada para manejar listas
async function initTasks() {
  const board = document.getElementById('kanban-board');
  if (!board) return;

  // Estado de la aplicación
  let currentTasks = [];
  let currentTaskId = null;
  let isEditing = false;
  let currentListId = 1; // Lista activa (por defecto Lista 1)

  // Referencias a elementos DOM
  const modal = document.getElementById('task-modal');
  const detailModal = document.getElementById('task-detail-modal');
  const taskForm = document.getElementById('task-form');
  const loadingOverlay = document.getElementById('loading-overlay');
  const taskMsg = document.getElementById('task-msg');
  const modalTitle = document.getElementById('modal-title');
  const currentListTitle = document.getElementById('current-list-title');

  // Inicializar la aplicación
  await loadTasks();
  initEventListeners();
  initListNavigation();

  // Función para cargar tareas desde el servidor
  async function loadTasks() {
    showLoading(true);
    try {
      const tasks = await getTasks();
      // Filtrar tareas por lista actual (simulado - en real vendrá del backend)
      currentTasks = tasks || [];
      renderTasks();
      updateTaskCounts();
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      showMessage('Error al cargar las tareas: ' + error.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  // Función para renderizar las tareas en el tablero
  function renderTasks() {
    // Limpiar columnas
    board.querySelectorAll('.kanban-tasks').forEach(container => {
      container.innerHTML = '';
    });

    // Renderizar cada tarea
    currentTasks.forEach(task => {
      const taskElement = createTaskElement(task);
      const column = board.querySelector(`[data-status="${task.status}"] .kanban-tasks`);
      if (column) {
        column.appendChild(taskElement);
      }
    });
  }

  // Función para crear un elemento de tarea
  function createTaskElement(task) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('kanban-task');
    taskCard.dataset.taskId = task.id;
    
    // Agregar clase de prioridad
    if (task.priority) {
      taskCard.classList.add(`priority-${task.priority}`);
    }

    const priorityIcon = getPriorityIcon(task.priority);
    const dateText = task.dueDate ? formatDate(task.dueDate) : '';

    taskCard.innerHTML = `
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      ${dateText ? `<div class="task-date">${dateText}</div>` : ''}
      ${priorityIcon ? `<div class="task-priority-indicator">${priorityIcon}</div>` : ''}
    `;

    // Evento click para mostrar detalles
    taskCard.addEventListener('click', () => showTaskDetails(task));
    
    return taskCard;
  }

  // Función para inicializar navegación entre listas
  function initListNavigation() {
    const listButtons = document.querySelectorAll('.list-btn');
    
    listButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos los botones
        listButtons.forEach(btn => btn.classList.remove('active'));
        
        // Agregar clase active al botón clickeado
        button.classList.add('active');
        
        // Cambiar lista actual
        const listId = button.dataset.list;
        currentListId = parseInt(listId);
        
        // Actualizar título
        currentListTitle.textContent = `LISTA ${listId}`;
        
        // Recargar tareas para la nueva lista
        loadTasks();
      });
    });
  }

  // Función para mostrar detalles de una tarea
  function showTaskDetails(task) {
    const taskDetails = document.getElementById('task-details');
    taskDetails.innerHTML = `
      <h4>Título:</h4>
      <p>${escapeHtml(task.title)}</p>
      
      <h4>Estado:</h4>
      <p>${getStatusText(task.status)}</p>
      
      ${task.description ? `
        <h4>Descripción:</h4>
        <p>${escapeHtml(task.description)}</p>
      ` : ''}
      
      ${task.priority ? `
        <h4>Prioridad:</h4>
        <p>${getPriorityText(task.priority)} ${getPriorityIcon(task.priority)}</p>
      ` : ''}
      
      ${task.dueDate ? `
        <h4>Fecha límite:</h4>
        <p>${formatDate(task.dueDate)}</p>
      ` : ''}
      
      ${task.createdAt ? `
        <h4>Creada:</h4>
        <p>${formatDate(task.createdAt)}</p>
      ` : ''}
    `;

    currentTaskId = task.id;
    detailModal.style.display = 'block';
  }

  // Función para inicializar todos los event listeners
  function initEventListeners() {
    // Botones agregar en columnas
    board.querySelectorAll('.add-task-column').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const status = e.target.dataset.status;
        openTaskModal(null, status);
      });
    });

    // Botón actualizar
    const refreshBtn = document.getElementById('refresh-tasks');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', loadTasks);
    }

    // Modal de tarea - cerrar
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', closeTaskModal);
    }

    // Modal de tarea - cancelar
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeTaskModal);
    }

    // Formulario de tarea
    if (taskForm) {
      taskForm.addEventListener('submit', handleTaskSubmit);
    }

    // Modal de detalles - cerrar
    const closeDetailModal = document.getElementById('close-detail-modal');
    if (closeDetailModal) {
      closeDetailModal.addEventListener('click', () => {
        detailModal.style.display = 'none';
      });
    }

    const closeDetailBtn = document.getElementById('close-detail-btn');
    if (closeDetailBtn) {
      closeDetailBtn.addEventListener('click', () => {
        detailModal.style.display = 'none';
      });
    }

    // Modal de detalles - editar
    const editTaskBtn = document.getElementById('edit-task-btn');
    if (editTaskBtn) {
      editTaskBtn.addEventListener('click', () => {
        const task = currentTasks.find(t => t.id === currentTaskId);
        if (task) {
          detailModal.style.display = 'none';
          openTaskModal(task);
        }
      });
    }

    // Modal de detalles - eliminar
    const deleteTaskBtn = document.getElementById('delete-task-btn');
    if (deleteTaskBtn) {
      deleteTaskBtn.addEventListener('click', handleDeleteTask);
    }

    // Cerrar modales con clic fuera
    window.addEventListener('click', (e) => {
      if (e.target === modal) closeTaskModal();
      if (e.target === detailModal) detailModal.style.display = 'none';
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal.style.display === 'block') closeTaskModal();
        if (detailModal.style.display === 'block') detailModal.style.display = 'none';
      }
    });
  }

  // Función para abrir el modal de tarea
  function openTaskModal(task = null, defaultStatus = 'Pending') {
    isEditing = !!task;
    currentTaskId = task?.id || null;
    
    modalTitle.textContent = isEditing ? 'Editar Tarea' : 'Nueva Tarea';
    
    // Llenar formulario
    document.getElementById('task-title').value = task?.title || '';
    document.getElementById('task-description').value = task?.description || '';
    document.getElementById('task-status').value = task?.status || defaultStatus;
    document.getElementById('task-priority').value = task?.priority || 'medium';
    
    // Fecha límite
    const dueDateInput = document.getElementById('task-due-date');
    if (dueDateInput && task?.dueDate) {
      dueDateInput.value = task.dueDate.split('T')[0]; // Formato YYYY-MM-DD
    } else if (dueDateInput) {
      dueDateInput.value = '';
    }
    
    // Limpiar mensajes
    taskMsg.textContent = '';
    taskMsg.className = 'message';
    
    modal.style.display = 'block';
    document.getElementById('task-title').focus();
  }

  // Función para cerrar el modal de tarea
  function closeTaskModal() {
    modal.style.display = 'none';
    taskForm.reset();
    isEditing = false;
    currentTaskId = null;
  }

  // Función para manejar el envío del formulario
  async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const taskData = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      status: formData.get('status'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate') || null,
      listId: currentListId // Asociar tarea a lista actual
    };

    // Validación
    if (!taskData.title) {
      showMessage('El título es requerido', 'error');
      return;
    }

    const submitBtn = taskForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      if (isEditing && currentTaskId) {
        await updateTask(currentTaskId, taskData);
        showMessage('Tarea actualizada exitosamente ✅', 'success');
      } else {
        await createTask(taskData);
        showMessage('Tarea creada exitosamente ✅', 'success');
      }

      setTimeout(() => {
        closeTaskModal();
        loadTasks();
      }, 1000);

    } catch (error) {
      console.error('Error al guardar tarea:', error);
      showMessage('Error al guardar la tarea: ' + error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  // Función para manejar la eliminación de tarea
  async function handleDeleteTask() {
    if (!currentTaskId || !confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      await deleteTask(currentTaskId);
      showMessage('Tarea eliminada exitosamente ✅', 'success');
      setTimeout(loadTasks, 1000);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      showMessage('Error al eliminar la tarea: ' + error.message, 'error');
    }
  }

function initRegister() {
  const form = document.getElementById('registerForm');
  const msg = document.getElementById('registerMsg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();  // Esto previene el comportamiento por defecto del formulario (que recarga la página)
    if (msg) msg.textContent = '';

    const formData = new FormData(form);
    const data = {
      firstName: formData.get('firstName')?.trim(),
      lastName: formData.get('lastName')?.trim(),
      age: Number(formData.get('age')),
      email: formData.get('email')?.trim(),
      password: formData.get('password')?.trim(),
      confirmPassword: formData.get('confirmPassword')?.trim(),
    };

    // Validación básica
    if (!data.firstName || !data.lastName || !data.age || !data.email || !data.password || !data.confirmPassword) {
      if (msg) msg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    // Validar contraseñas
    if (data.password !== data.confirmPassword) {
      if (msg) msg.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      await registerUser(data);
      if (msg) msg.textContent = 'Registro exitoso ✅';
      setTimeout(() => (location.hash = '#/login'), 400);
    } catch (err) {
      if (msg) msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

async function initLogin2() {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMsg');
  if (!form) return;

  const correoInput = document.getElementById('email');
  const passInput = document.getElementById('password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const correo = correoInput?.value.trim();
    const password = passInput?.value.trim();
    if (!correo || !password) {
      msg.textContent = 'Por favor completa todos los campos.';
      return;
    }
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      const data = await loginUser({ email: correo, password });
      console.log('Respuesta backend:', data);
      msg.textContent = 'Login exitoso';
      setTimeout(() => (location.hash = '#/tasks'), 400);
    } catch (err) {
      // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
      msg.textContent = `No se pudo iniciar sesión: ${err.message}`;
    } finally {
      // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

async function initLogin() {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMsg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const formData = new FormData(form);
    const data = {
      email: formData.get('email').trim(),
      password: formData.get('password').trim(),
    };

    if (!data.email || !data.password) {
      msg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const response = await fetch('https://taskly-2h0c.onrender.com/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en login');
      }

      const responseData = await response.json();
      console.log('Respuesta backend:', responseData);
      msg.textContent = 'Login exitoso';

      // Aquí guardar token o info si es necesario
      // localStorage.setItem('token', responseData.token);

      setTimeout(() => (location.hash = '#/tasks'), 400);

    } catch (err) {
      msg.textContent = `No se pudo iniciar sesión: ${err.message}`;
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

function initSendEmail() {
  const form = document.getElementById('recoverForm');
  const correoInput = document.getElementById('email');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = correoInput?.value.trim();
    if (!correo) {
      console.error('Correo es requerido');
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await sendRecoveryEmail(correo);
      console.log('Respuesta del servidor:', data);
      setTimeout(() => (location.hash = '#/login'), 400);
    } catch (err) {
      // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

function initRecoverPassword(queryString) {
  const form = document.getElementById('recover-password-form');

  const params = new URLSearchParams(queryString);
  const token = params.get("token");
  const email = params.get("email");

  const tokenInput = document.getElementById("token");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("new-password");
  const confirmInput = document.getElementById("confirm-password");

  if (!form) return;

  if (tokenInput) tokenInput.value = token;
  if (emailInput) emailInput.value = email;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = tokenInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passInput?.value.trim();
    const confirmPassword = confirmInput?.value.trim();

    if (!token || !email || !password || !confirmPassword) {
      console.error('Por favor completa todos los campos.');
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await resetPassword({ token, email, password, confirmPassword });
      console.log('Respuesta del servidor:', data);
      setTimeout(() => (location.hash = '#/login'), 400);

    } catch (err) {
      // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

function initLogout() {
  const logoutBtn = document.getElementById('logout');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const data = await logoutUser();
      console.log('Respuesta del servidor:', data);
      setTimeout(() => (location.hash = '#/home'), 400);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  });
}

function initProfile() {
  console.log("Vista perfil cargada ✅");
}

function initEditProfile() {
  console.log("Vista editar perfil cargada ✅");
}

function initEditTask() {
  console.log("Vista editar tarea cargada ✅");
}
}