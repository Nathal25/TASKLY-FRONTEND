import { registerUser } from '../services/userService.js';
import { sendRecoveryEmail } from '../services/userService.js';
import { resetPassword } from '../services/userService.js';
import { loginUser } from '../services/userService.js';
import { logoutUser } from '../services/userService.js';
import { getTasks } from '../services/taskService.js';
import { getLoggedUser } from '../services/userService.js';
import { editLoggedUser } from '../services/userService.js';
import { createTask } from '../services/taskService.js';
import { updateTaskStatus, deleteTask } from '../services/taskService.js';
import { getTask, updateTask } from '../services/taskService.js';
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
  if (name === 'profile') initProfile();
  if (name === 'edit-profile') initEditProfile();
  if (name === 'edit-task') initEditTask();
  if (name === 'create-task') initCreateTask();
  
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
  const known = ['home', 'login', 'register', 'send-email', 'recover-password', 
    'recover-code', 'tasks', 'profile', 'edit-profile', 'edit-task', 'create-task'];
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

/** * Initialize the "tasks" view.
 * Fetches tasks from the backend and populates the Kanban board.
 * Sets up drag-and-drop functionality for task cards.
 */
async function initTasks() {
  const board = document.getElementById('kanban-board');
  if (!board) return;

  // Limpiar contenido actual
  board.querySelectorAll('.kanban-tasks').forEach(container => (container.innerHTML = ''));

  try {
    // Obtén las tareas desde el backend
    const tasks = await getTasks();
    // Mapear las tareas a las columnas correspondientes
    tasks.forEach(task => {
      const columnId = getColumnIdByStatus(task.status);
      const columnContainer = document.getElementById(columnId);

      if (columnContainer) {
        const taskCard = createTaskCard(task);
        columnContainer.appendChild(taskCard);
      } else {
        console.warn(`Contenedor de columna no encontrado: ${columnId}`);
      }
    });

    // Configurar drag and drop después de cargar las tareas
    setupDragAndDrop();

  } catch (err) {
    console.error('Error al cargar tareas:', err.message);
    board.innerHTML = `<p style="color:#ffb4b4">No se pudieron cargar las tareas: ${err.message}</p>`;
  }
}

/**
 * Devuelve el ID del contenedor de la columna según el estado de la tarea.
 * @param {string} status - Estado de la tarea ('Pending', 'In-progress', 'Completed').
 * @returns {string} ID del contenedor de la columna.
 */
function getColumnIdByStatus(status) {
  const statusMapping = {
    'Pending': 'pending-tasks',
    'In-progress': 'in-progress-tasks',
    'Completed': 'completed-tasks',
  };
  return statusMapping[status];
}

/**
 * Crea un elemento de tarjeta de tarea.
 * @param {Object} task - Objeto de la tarea.
 * @returns {HTMLElement} Elemento de la tarjeta de tarea.
 */
function createTaskCard(task) {
  const taskCard = document.createElement('div');
  taskCard.classList.add('kanban-task');
  taskCard.draggable = true;
  taskCard.dataset.taskId = task._id;

  const adjustedDate = new Date(task.date);
  adjustedDate.setDate(adjustedDate.getDate() + 1);
  const formattedDate = adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

  taskCard.innerHTML = `
    <div class="task-actions">
      <button class="task-action-btn" onclick="handleEditTask('${task._id}')">✏️</button>
      <button class="task-action-btn" onclick="initDeleteTask('${task._id}')">🗑️</button>
      
    </div>
    <div class="task-title">${task.title || 'Sin título'}</div>
    <div class="task-description">${task.details || 'Sin descripción'}</div>
    <div class="task-date">📅 ${formattedDate}</div>
    <div class="task-time">${task.time || 'Sin hora'}</div>

  `;

  return taskCard;
}

/** Configura la funcionalidad de arrastrar y soltar para las tarjetas de tareas.
 * Permite mover tareas entre columnas y actualiza su estado en el backend.
 */
function setupDragAndDrop() {
  const tasks = document.querySelectorAll('.kanban-task');
  const columns = document.querySelectorAll('.kanban-column');

  // Configurar eventos para las tareas
  tasks.forEach(task => {
    task.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.dataset.taskId); // Guardar el ID de la tarea
      task.classList.add('dragging'); // Agregar clase para estilo visual
    });

    task.addEventListener('dragend', () => {
      task.classList.remove('dragging'); // Remover clase al finalizar el drag
    });
  });

  // Configurar eventos para las columnas
  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault(); // Permitir el drop
      column.classList.add('drag-over'); // Agregar clase para estilo visual
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over'); // Remover clase al salir del área
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drag-over'); // Remover clase al soltar

      const taskId = e.dataTransfer.getData('text/plain'); // Obtener el ID de la tarea
      const newStatus = column.dataset.status; // Obtener el nuevo estado desde la columna
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

      if (taskElement) {
        try {
          // Actualizar el estado de la tarea en el backend
          await updateTaskStatus(taskId, newStatus);

          // Mover la tarea visualmente
          const tasksContainer = column.querySelector('.kanban-tasks');
          tasksContainer.appendChild(taskElement);
        } catch (error) {
          alert('No se pudo mover la tarea. Inténtalo de nuevo.');
        }
      } else {
        console.warn(`No se encontró el elemento visual para la tarea con ID ${taskId}.`);
      }
    });
  });
}

/** Initialize the "register" view.
 * Attaches a submit handler to the registration form to create a new user.
 */
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

/**
 * Initialize the "login" view.
 * Attaches a submit handler to the login form to authenticate the user.
 */
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

/** Initialize the "send-email" view.
 * Attaches a submit handler to the email form to send a recovery email.
 */
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

/** Initialize the "recover-password" view.
 * Attaches a submit handler to the password reset form to reset the user's password.
 * Extracts token and email from the query string and pre-fills the form.
 */
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

/** Initialize the logout button functionality.
 * Attaches a click handler to the logout button to log out the user.
 */
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

/** Initialize the "profile" view.
 * Fetches and displays the logged-in user's profile information.
 * Attaches handlers for editing profile and navigating back to tasks.
 */
async function initProfile() {
  const userInfoContainer = document.getElementById('profile-info');
  const backButton = document.getElementById('backToTasks');
  const editInfoButton = document.getElementById('editInfoBtn');

    if (!userInfoContainer) return;

    try {
      // Llama al servicio getLoggedUser para obtener la información del usuario
      const user = await getLoggedUser();
      userInfoContainer.innerHTML = `
        <p><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Edad:</strong> ${user.age}</p>
      `;
    } catch (error) {
      console.error('Error al cargar la información del usuario:', error.message);
      userInfoContainer.innerHTML = `<p style="color: red;">Error al cargar la información del usuario.</p>`;
    }

    // Manejar el botón para volver a las tareas
    backButton.addEventListener('click', () => {
      location.hash = '#/tasks';
    });

    // Manejar el botón para editar la información del usuario
    editInfoButton.addEventListener('click', () => {
      location.hash = '#/edit-profile';
    });
}

/** Initialize the "edit-profile" view.
 * Fetches the logged-in user's information and pre-fills the edit form.
 * Attaches a submit handler to update the user's profile.
 * Attaches a handler to navigate back to the profile view.
 */
async function initEditProfile() {
  const form = document.getElementById('edit-profile-form');
  const backButton = document.getElementById('backToProfile');

  if (!form) return;

  try {
    // Obtén la información del usuario logueado
    const user = await getLoggedUser();

    // Rellena los campos del formulario con los valores actuales del usuario
    form.querySelector('#firstName').value = user.firstName || '';
    form.querySelector('#lastName').value = user.lastName || '';
    form.querySelector('#email').value = user.email || '';
    form.querySelector('#age').value = user.age || '';

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedUser = {
        firstName: form.querySelector('#firstName').value.trim(),
        lastName: form.querySelector('#lastName').value.trim(),
        email: form.querySelector('#email').value.trim(),
        age: Number(form.querySelector('#age').value.trim()),
      };

      try {
        await editLoggedUser(updatedUser);
        alert('Perfil actualizado exitosamente');
        location.hash = '#/profile'; // Redirige a la vista del perfil
      } catch (error) {
        alert('Error al actualizar el perfil');
      }
    });
  } catch (error) {
    alert('Error al cargar la información del usuario');
  }

  // Manejar el botón para volver al perfil
  backButton.addEventListener('click', () => {
    location.hash = '#/profile';
  });
}

/** Initialize the "create-task" view.
 * Attaches a submit handler to the create task form to create a new task.
 * Attaches a handler to navigate back to the tasks view.
 */
async function initCreateTask() {
  const form = document.getElementById('create-task-form');
  const cancelButton = document.getElementById('cancelCreateTask');
  const user = await getLoggedUser();
  if (!form) return;

  // Manejar el envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskData = {
      title: form.querySelector('#title').value.trim(),
      details: form.querySelector('#details').value.trim(),
      date: form.querySelector('#date').value,
      time: form.querySelector('#time').value, // Captura el valor del campo time
      status: form.querySelector('#status').value,
      userId: user.id // Asume que el usuario logueado tiene un ID
    };

    try {
      await createTask(taskData); // Llama al servicio para crear la tarea
      alert('Tarea creada exitosamente');
      location.hash = '#/tasks'; // Redirige a la vista de tareas
    } catch (error) {
      alert('Error al crear la tarea');
    }
  });

  // Manejar el botón de cancelar
  cancelButton.addEventListener('click', () => {
    location.hash = '#/tasks';
  });
}

/** Initialize the "edit-task" view.
 * Fetches the task information and pre-fills the edit form.
 * Attaches a submit handler to update the task.
 * Attaches a handler to navigate back to the tasks view.
 */
async function initEditTask() {
  const form = document.getElementById('edit-task-form');
  const cancelButton = document.getElementById('cancelEditTask');

  if (!form) return;
  // Obtener el ID de la tarea desde localStorage
  const taskId = localStorage.getItem('editTaskId');
  if (!taskId) {
    alert('No se pudo cargar la tarea para editar.');
    location.hash = '#/tasks';
    return;
  }

  try {
    // Obtén la información de la tarea desde el backend
    const task = await getTask(taskId);

    if (!task) {
      alert('No se pudo cargar la tarea para editar.');
      location.hash = '#/tasks';
      return;
    }

    // Formatear la fecha al formato "yyyy-MM-dd"
    const formattedDate = task.date ? new Date(task.date).toISOString().split('T')[0] : '';

    // Rellena los campos del formulario con los valores actuales de la tarea
    form.querySelector('#title').value = task.title || '';
    form.querySelector('#details').value = task.details || '';
    form.querySelector('#date').value = formattedDate; // Asignar la fecha formateada
    form.querySelector('#time').value = task.time || '';
    form.querySelector('#status').value = task.status || 'Pending';

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedTask = {
        title: form.querySelector('#title').value.trim(),
        details: form.querySelector('#details').value.trim(),
        date: form.querySelector('#date').value,
        time: form.querySelector('#time').value,
        status: form.querySelector('#status').value,
      };

      try {
        await updateTask(taskId, updatedTask);
        alert('Tarea actualizada exitosamente');
        location.hash = '#/tasks'; // Redirige a la vista de tareas
      } catch (error) {
        alert('Error al actualizar la tarea');
      }
    });
  } catch (error) {
    alert('Error al cargar la tarea');
    location.hash = '#/tasks';
  }

  // Manejar el botón de cancelar
  cancelButton.addEventListener('click', () => {
  localStorage.removeItem('editTaskId'); // Eliminar el ID de localStorage
  location.hash = '#/tasks';
});
}

/** Handle editing a task.
 * Saves the task ID to localStorage and navigates to the edit task view.
 * @param {string} taskId - The ID of the task to edit.
 */
window.handleEditTask = async function(taskId) {
  if (!taskId) {
    console.error('No se proporcionó un ID de tarea para editar.');
    return;
  }

  // Guardar el ID de la tarea en localStorage
  localStorage.setItem('editTaskId', taskId);

  // Redirigir a la vista de edición
  location.hash = '#/edit-task';
}

/** Handle deleting a task.
 * Prompts for confirmation, deletes the task via the service, and removes it from the UI.
 * @param {string} taskId - The ID of the task to delete.
 */
window.initDeleteTask = async function(taskId) {
  if (!taskId) {
    console.error('No se proporcionó un ID de tarea para eliminar.');
    alert('No se pudo eliminar la tarea.');
    return;
  }

  const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar esta tarea?');
    if (!confirmDelete) {
      return;
    }
  try {
    // Llama a la función para eliminar la tarea
    await deleteTask(taskId);

    // Remover elemento visual
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.remove();
    } else {
      console.warn(`No se encontró el elemento visual para la tarea con ID ${taskId}.`);
    }
  } catch (error) {
    alert('Error al eliminar la tarea.');
  }
}