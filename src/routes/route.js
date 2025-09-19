import { registerUser } from '../services/userService.js';
import { sendRecoveryEmail } from '../services/userService.js';
import { resetPassword } from '../services/userService.js';
import { loginUser } from '../services/userService.js';
import { logoutUser } from '../services/userService.js';
import { getTasks } from '../services/taskService.js';
import { updateTaskStatus, deleteTask } from '../services/taskService.js';
import { getLists, createList } from '../services/listService.js';
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

// Esta función reemplaza tu initTasks() actual en route.js
async function initTasks() {
  const board = document.getElementById('kanban-board');
  if (!board) return;

  // Limpiar contenido actual
  board.querySelectorAll('.kanban-tasks').forEach(container => (container.innerHTML = ''));

  try {
    //const data = await getTasks();
    //if (!data) throw new Error('Error al cargar tareas desde el servidor');

     const data = [
      { id: 1, title: 'TAREA 1', description: 'Descripción de ejemplo', status: 'Pending', dueDate: '2024-01-01' },
      { id: 2, title: 'TAREA 2', description: 'En desarrollo', status: 'In-progress', dueDate: '2024-01-15' },
      { id: 3, title: 'TAREA 3', description: 'Completada', status: 'Completed', dueDate: '2024-01-10' }
    ];

    // Mapear estados del backend a estados del frontend
    const statusMapping = {
      'Pending': 'nuevo',
      'In-progress': 'en-progreso', 
      'Completed': 'hecho'
    };

    data.forEach(task => {
      let columnContainer;
      const frontendStatus = statusMapping[task.status] || 'nuevo';
      
      // Buscar el contenedor correcto por el data-status
      const column = board.querySelector(`[data-status="${frontendStatus}"]`);
      if (column) {
        columnContainer = column.querySelector('.kanban-tasks');
      }

      if (!columnContainer) {
        console.warn('No se encontró contenedor para estado:', task.status);
        return;
      }

      // Crear elemento de tarea mejorado
      const taskCard = document.createElement('div');
      taskCard.classList.add('kanban-task');
      taskCard.draggable = true;
      taskCard.dataset.taskId = task.id;
      
      // Formatear fecha si existe
      const formattedDate = task.dueDate ? 
        new Date(task.dueDate).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        }) : 'dd/mm/aa';

      taskCard.innerHTML = `
        <div class="task-actions">
          <button class="task-action-btn" onclick="editTask(${task.id})">✏️</button>
          <button class="task-action-btn" onclick="deleteTaskFromBoard(${task.id})">🗑️</button>
        </div>
        <div class="task-title">${task.title || 'Sin título'}</div>
        <div class="task-description">${task.description || 'Sin descripción'}</div>
        <div class="task-date">📅 ${formattedDate}</div>
      `;

      if (task.completed || task.status === 'Completed') {
        taskCard.classList.add('completed');
      }
      
      columnContainer.appendChild(taskCard);
    });

    // Configurar drag and drop después de cargar las tareas
    setupDragAndDrop();
    
  } catch (err) {
    console.error(err);
    board.innerHTML = `<p style="color:#ffb4b4">No se pudieron cargar las tareas: ${err.message}</p>`;
  }
}

// Función auxiliar para configurar drag and drop
function setupDragAndDrop() {
  const tasks = document.querySelectorAll('.kanban-task');
  const columns = document.querySelectorAll('.kanban-column');

  tasks.forEach(task => {
    task.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.dataset.taskId);
      task.classList.add('dragging');
    });

    task.addEventListener('dragend', () => {
      task.classList.remove('dragging');
    });
  });

  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drag-over');
      
      const taskId = parseInt(e.dataTransfer.getData('text/plain'));
      const newStatus = column.dataset.status;
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      
      if (taskElement) {
        try {
          // Mapear estados del frontend al backend
          const backendStatusMapping = {
            'nuevo': 'Pending',
            'en-progreso': 'In-progress',
            'hecho': 'Completed'
          };
          
          const backendStatus = backendStatusMapping[newStatus];
          
          // Actualizar en el servidor
          await updateTaskStatus(taskId, backendStatus);
          
          // Mover elemento visualmente
          const tasksContainer = column.querySelector('.kanban-tasks');
          tasksContainer.appendChild(taskElement);
          
          // Actualizar clase si se completó
          if (backendStatus === 'Completed') {
            taskElement.classList.add('completed');
          } else {
            taskElement.classList.remove('completed');
          }
          
        } catch (error) {
          console.error('Error al actualizar estado de tarea:', error);
          // Podrías mostrar una notificación de error aquí
        }
      }
    });
  });
}

// Función global para eliminar tarea desde el tablero
window.deleteTaskFromBoard = async function(taskId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    try {
      await deleteTask(taskId);
      
      // Remover elemento visual
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.remove();
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('No se pudo eliminar la tarea. Inténtalo de nuevo.');
    }
  }
};

// Función global para editar tarea
window.editTask = function(taskId) {
  // Redirigir a la página de edición con el ID de la tarea
  location.hash = `#/edit-task?id=${taskId}`;
};

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

// Agrega estas funciones al final de tu route.js, después de initTasks()

// Función para abrir modal de nueva tarea
function openTaskModal(status) {
  const modal = document.getElementById('task-modal');
  if (modal) {
    document.getElementById('task-status').value = status;
    document.getElementById('new-task-form').reset();
    modal.style.display = 'block';
  }
}

// Función para cerrar modal de tarea
function closeTaskModal() {
  const modal = document.getElementById('task-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Función para manejar envío de nueva tarea
async function handleTaskSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const taskData = {
    title: formData.get('title'),
    description: formData.get('description'),
    dueDate: formData.get('date'),
    status: formData.get('status')
  };

  // Mapear estado del frontend al backend
  const backendStatusMapping = {
    'nuevo': 'Pending',
    'en-progreso': 'In-progress',
    'hecho': 'Completed'
  };
  
  taskData.status = backendStatusMapping[taskData.status] || 'Pending';

  try {
    // Intentar crear tarea en el servidor
    // const newTask = await createTask(taskData);
    
    // Por ahora, crear tarea localmente
    const newTask = {
      id: Date.now(), // ID temporal
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      status: taskData.status
    };

    // Agregar tarea al tablero visualmente
    addTaskToBoard(newTask);
    closeTaskModal();
    
  } catch (error) {
    console.error('Error creando tarea:', error);
    alert('No se pudo crear la tarea. Inténtalo de nuevo.');
  }
}

// Función para agregar tarea al tablero visualmente
function addTaskToBoard(task) {
  const statusMapping = {
    'Pending': 'nuevo',
    'In-progress': 'en-progreso', 
    'Completed': 'hecho'
  };
  
  const frontendStatus = statusMapping[task.status] || 'nuevo';
  const container = document.getElementById(`${frontendStatus}-tasks`);
  
  if (container) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('kanban-task');
    taskCard.draggable = true;
    taskCard.dataset.taskId = task.id;
    
    const formattedDate = task.dueDate ? 
      new Date(task.dueDate).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      }) : 'dd/mm/aa';

    taskCard.innerHTML = `
      <div class="task-actions">
        <button class="task-action-btn" onclick="editTask(${task.id})">✏️</button>
        <button class="task-action-btn" onclick="deleteTaskFromBoard(${task.id})">🗑️</button>
      </div>
      <div class="task-title">${task.title || 'Sin título'}</div>
      <div class="task-description">${task.description || 'Sin descripción'}</div>
      <div class="task-date">📅 ${formattedDate}</div>
    `;

    if (task.status === 'Completed') {
      taskCard.classList.add('completed');
    }
    
    container.appendChild(taskCard);
    setupDragAndDrop(); // Reconfigurar drag and drop
  }
}