import { registerUser } from '../services/userService.js';
import { sendRecoveryEmail } from '../services/userService.js';
import { resetPassword } from '../services/userService.js';
import { loginUser } from '../services/userService.js';
import { logoutUser } from '../services/userService.js';
import { getLoggedUser } from '../services/userService.js';
import { getTasks } from '../services/taskService.js';
import { editLoggedUser } from '../services/userService.js';
import { checkIfTokenIsValid } from '../services/userService.js';
import { deleteLoggedUser } from '../services/userService.js';
import { createTask } from '../services/taskService.js';
import { updateTaskStatus, deleteTask } from '../services/taskService.js';
import { getLists, createList } from '../services/listService.js';
import { getTask, updateTask } from '../services/taskService.js';
const app = document.getElementById('app');

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);


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
async function handleRoute() {
  const path = (location.hash.startsWith('#/') ? location.hash.slice(2) : '') || 'home';
  const [routeName, queryString] = path.split("?");
  const known = ['home', 'login', 'register', 'send-email', 'recover-password',
    'recover-code', 'tasks', 'profile', 'edit-profile', 'edit-task', 'create-task', 'delete-task'];
  const privateRoutes = ['tasks', 'profile', 'edit-profile', 'edit-task', 'create-task', 'delete-task'];
  const route = known.includes(routeName) ? routeName : 'home';

  try {
    // Verificar si la ruta es privada
    if (privateRoutes.includes(route)) {
      const isLoggedIn = await checkAuth();
      if (!isLoggedIn) {
        location.hash = '#/login'; // redirige a login si no está autenticado
        return;
      }
    }

    // Cargar la vista
    await loadView(route, queryString);

  } catch (err) {
    console.error(err);
    app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
  }
}

async function checkAuth() {
  try {
    const res = await checkIfTokenIsValid();
    if (!res == "Token valido") return false; // no autorizado
    return true;
  } catch {
    return false;
  }
}

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
  if (name === 'login') initLogin();
  if (name === 'send-email') initSendEmail();
  if (name === 'recover-password') initRecoverPassword(queryString);
  if (name === 'profile') initProfile();
  if (name === 'edit-profile') initEditProfile();
  if (name === 'edit-task') initEditTask();
  if (name === 'create-task') initCreateTask();
  if (name === 'delete-task') initDeleteTask();

  initLogout();
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "home" view.
 * Attaches a submit handler to the register form to navigate to the board.
 */
function initHome() {
  console.log("Vista home cargada");
}

// Función para inicializar la vista de registro
function initRegister() {
  console.log("Vista register cargada");

  // Tomamos referencias al formulario, mensaje y botón de submit
  const form = document.getElementById('registerForm');
  const submitButton = form?.querySelector('button[type="submit"]');

  // Se verifica que el formulario y el botón existan
  if (!form || !submitButton) return;

  // Expresión regular para validar la contraseña
  const passwordRegex1 = /^(?=.*[A-Z])/;
  const passwordRegex2 = /^(?=.*\d)/;
  const passwordRegex3 = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
  const passwordRegex4 = /^[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

  // Referencias a los elementos del DOM relacionados con la contraseña
  const passwordInput = document.getElementById("password");
  const passwordTip1 = document.getElementById("password-tip1");
  const passwordTip2 = document.getElementById("password-tip2");
  const passwordTip3 = document.getElementById("password-tip3");
  const passwordTip4 = document.getElementById("password-tip4");

  // Configuramos atributos de accesibilidad para el mensaje de la contraseña
  passwordTip1.setAttribute("role", "tooltip"); // Indica que es un tooltip (mensaje informativo flotante para usuarios con lectores de pantalla)
  passwordTip1.setAttribute("aria-live", "polite"); // Indica que los cambios en este elemento deben ser anunciados de forma no intrusiva
  passwordTip2.setAttribute("role", "tooltip");
  passwordTip2.setAttribute("aria-live", "polite");
  passwordTip3.setAttribute("role", "tooltip");
  passwordTip3.setAttribute("aria-live", "polite");
  passwordTip4.setAttribute("role", "tooltip");
  passwordTip4.setAttribute("aria-live", "polite");

  // Escuchar el evento de entrada en el campo de contraseña para validar en tiempo real (manejo de mensajes)
  passwordInput.addEventListener("input", () => {
    if (!passwordRegex4.test(passwordInput.value)) {
      passwordTip4.classList.add("show");
      passwordTip1.classList.remove("show");
      passwordTip2.classList.remove("show");
      passwordTip3.classList.remove("show");
    } else if (!passwordRegex2.test(passwordInput.value)) {
      passwordTip2.classList.add("show");
      passwordTip1.classList.remove("show");
      passwordTip3.classList.remove("show");
      passwordTip4.classList.remove("show");
    } else if (!passwordRegex3.test(passwordInput.value)) {
      passwordTip3.classList.add("show");
      passwordTip1.classList.remove("show");
      passwordTip2.classList.remove("show");
      passwordTip4.classList.remove("show");
    } else if (!passwordRegex1.test(passwordInput.value)) {
      passwordTip1.classList.add("show");
      passwordTip2.classList.remove("show");
      passwordTip3.classList.remove("show");
      passwordTip4.classList.remove("show");
    } else {
      passwordTip1.classList.remove("show");
      passwordTip2.classList.remove("show");
      passwordTip3.classList.remove("show");
      passwordTip4.classList.remove("show");
    }
  });

  // Referencias a los elementos del DOM relacionados con la edad (input, mensaje)
  const ageInput = document.getElementById("age");
  const ageTip = document.getElementById("age-tip");

  // Configuramos atributos de accesibilidad para el mensaje de la edad
  ageTip.setAttribute("role", "tooltip");
  ageTip.setAttribute("aria-live", "polite");

  // Escuchar el evento de entrada en el campo de edad para validar en tiempo real (manejo de mensajes)
  ageInput.addEventListener("input", () => {
    if (!/^\d+$/.test(ageInput.value) || Number(ageInput.value) < 13) {
      ageTip.classList.add("show");
    } else {
      ageTip.classList.remove("show");
    }
  });

  // Referencias a los elementos del DOM relacionados con la confirmación de la contraseña
  const confirmInput = document.getElementById("confirmPassword");
  const passwordConfirmTip = document.getElementById("passwordConfirm-tip");

  // Configuramos atributos de accesibilidad para el mensaje de confirmación de contraseña
  passwordConfirmTip.setAttribute("role", "tooltip");
  passwordConfirmTip.setAttribute("aria-live", "polite");

  // Escuchar el evento de entrada en el campo de confirmación de contraseña para validar en tiempo real (manejo de mensajes)
  confirmInput.addEventListener("input", () => {
    if (confirmInput.value !== passwordInput.value) {
      passwordConfirmTip.classList.add("show");
    } else {
      passwordConfirmTip.classList.remove("show");
    }
  });

  document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

  document.getElementById("togglePassword2").addEventListener("click", function () {
    const passwordInput = document.getElementById("confirmPassword");
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

  // Función para validar todos los campos del formulario
  function validateForm(data) {
    const errors = [];

    // Validar nombre y apellido (no vacíos)
    if (!data.firstName || data.firstName.length === 0) {
      errors.push("El nombre es obligatorio");
    }
    if (!data.lastName || data.lastName.length === 0) {
      errors.push("El apellido es obligatorio");
    }

    // Validar edad
    if (!data.age || data.age < 13) {
      errors.push("La edad debe ser mayor o igual a 13 años");
    }

    // Validar email (formato básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push("El email debe tener un formato válido");
    }

    // Validar contraseña con todas las reglas
    if (!passwordRegex1.test(data.password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula");
    }
    if (!passwordRegex2.test(data.password)) {
      errors.push("La contraseña debe contener al menos un número");
    }
    if (!passwordRegex3.test(data.password)) {
      errors.push("La contraseña debe contener al menos un carácter especial");
    }
    if (!passwordRegex4.test(data.password)) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }

    // Validar confirmación de contraseña
    if (data.password !== data.confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }

    return errors;
  }

  // Manejar el envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();  // Esto previene el comportamiento por defecto del formulario (que recarga la página)

    // Extraer datos del formulario
    const formData = new FormData(form);
    const data = {
      firstName: formData.get('firstName')?.trim(),
      lastName: formData.get('lastName')?.trim(),
      age: Number(formData.get('age')),
      email: formData.get('email')?.trim(),
      password: formData.get('password')?.trim(),
      confirmPassword: formData.get('confirmPassword')?.trim(),
    };

    // Validar todos los campos antes de enviar
    const validationErrors = validateForm(data);

    if (validationErrors.length > 0) {
      // Si hay errores, mostrar el primer error y no enviar el formulario
      showToast(validationErrors[0], "error");
      return; // Detener la ejecución aquí
    }

    // Si llegamos aquí, todas las validaciones pasaron
    submitButton.disabled = true;

    // Mostrar spinner en el botón (máx 3s)
    submitButton.innerHTML = `<span class="spinner"></span>`;

    // Llamar al servicio registerUser para registrar el usuario
    try {
      await registerUser(data);
      showToast("Cuenta creada con éxito", "success");
      setTimeout(() => (location.hash = '#/login'), 400);
    } catch (err) {
      showToast(err.message || "Error al registrar", "error");
    } finally {
      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = "Registrarse";
      }, 3000); // spinner máx 3s
    }
  });
}

// Función para mostrar mensajes tipo toast
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

// Función para mostrar mensajes tipo toast mas cortos
function showToast2(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 900);
}

// Función para inicializar la vista de login
async function initLogin() {
  // Obtenemos referencias al formulario y al contenedor de mensajes
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMsg');
  if (!form) return;

  // Configuramos atributos de accesibilidad para el mensaje de login
  msg.setAttribute("role", "tooltip"); // Indica que es un tooltip (mensaje informativo flotante para usuarios con lectores de pantalla)
  msg.setAttribute("aria-live", "polite"); // Indica que los cambios en este elemento deben ser anunciados de forma no intrusiva

  // Referencias a los inputs
  const correoInput = document.getElementById('email');
  const passInput = document.getElementById('password');

  // Tomamos el evento submit del formulario
  form.addEventListener('submit', async (e) => {
    // Prevenimos el comportamiento por defecto del formulario (que recarga la página)
    e.preventDefault();

    // Limpiamos mensajes previos
    msg.textContent = '';

    // Extraemos los valores de los inputs
    const correo = correoInput?.value.trim();
    const password = passInput?.value.trim();

    // Validamos que no estén vacíos
    if (!correo || !password) {
      msg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    // Deshabilitamos el botón de submit para evitar múltiples envíos
    form.querySelector('button[type="submit"]').disabled = true;

    // Mostrar spinner en el botón (máx 3s)
    form.querySelector('button[type="submit"]').innerHTML = `<span class="spinner"></span>`;

    // Llamamos al servicio loginUser para iniciar sesión
    try {
      const data = await loginUser({ email: correo, password });
      setTimeout(() => (location.hash = '#/tasks'), 400);
    } catch (err) {
      // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
      msg.textContent = `No se pudo iniciar sesión: ${err.message}`;
    } finally {
      // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
      setTimeout(() => {
        form.querySelector('button[type="submit"]').disabled = false;
        form.querySelector('button[type="submit"]').innerHTML = "Iniciar sesión";
      }, 2000); // spinner máx 2s
    }
  });
}

function initLogout() {
  const logoutBtn = document.getElementById('logout');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      await logoutUser();
      showToast2("Sesión cerrada correctamente", "success");
      setTimeout(() => (location.hash = '#/home'), 400);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
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

    // Mostrar spinner en el botón (máx 3s)
    form.querySelector('button[type="submit"]').innerHTML = `<span class="spinner"></span>`;

    try {
      const data = await sendRecoveryEmail(correo);
      showToast("Revisa tu correo para continuar", "success");
      setTimeout(() => (location.hash = '#/login'), 400);
    } catch (err) {
      // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
      msg.textContent = `No se pudo registrar: ${err.message}`;
    } finally {
      // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
      setTimeout(() => {
        form.querySelector('button[type="submit"]').disabled = false;
        form.querySelector('button[type="submit"]').innerHTML = "Iniciar sesión";
      }, 2000); // spinner máx 2s
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

    if (!token || !email) {
      console.error('Token y email son requeridos');
      return;
    }

    if (!password || !confirmPassword) {
      showToast("Por favor completa todos los campos.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }

    form.querySelector('button[type="submit"]').disabled = true;

    try {
      const data = await resetPassword({ token, email, password, confirmPassword });
      showToast("Contraseña actualizada con éxito", "success");
      setTimeout(() => (location.hash = '#/login'), 400);
    } catch (err) {
      // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
      showToast("Token invalido o expirado, por favor solicita uno nuevo.", "error");
      setTimeout(() => (location.hash = '#/send-email'), 400);
    } finally {
      // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });
}

async function initProfile() {
  console.log("Vista perfil cargada ✅");
  const userInfoContainer = document.getElementById('profile-info');
  const backButton = document.getElementById('backToTasks');
  const editInfoButton = document.getElementById('editInfoBtn');


  if (!userInfoContainer) return;

  try {
    // Llama al servicio getLoggedUser para obtener la información del usuario
    const user = await getLoggedUser();
    const fecha = new Date(user.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    userInfoContainer.innerHTML = `
            <p><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Edad:</strong> ${user.age}</p>
            <p><strong>Miembro desde:</strong> ${fecha}</p>
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

  const deleteAccountButton = document.getElementById('deleteAccountBtn');
  const confirmDelete = document.getElementById('confirmDelete');
  const cancelDelete = document.getElementById('cancelDelete');
  const confirmText = document.getElementById('confirmText');
  const passwordInput = document.getElementById('password');

  deleteAccountButton.addEventListener('click', async () => {
    deleteModal.classList.remove('hidden');
  });

  cancelDelete.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
    confirmText.textContent = '';
    passwordInput.value = '';
  });

  confirmDelete.addEventListener('click', async () => {
    const text = confirmText.value.trim();
    const password = passwordInput.value.trim();

    if (text !== 'ELIMINAR') {
      showToast("Debes escribir exactamente 'ELIMINAR'", "error");
      return;
    }

    if (!password) {
      showToast("Debes ingresar tu contraseña", "error");
      return;
    }

    try {
      const response = await deleteLoggedUser(password);
      showToast("Cuenta eliminada con éxito", "success");
      setTimeout(() => (location.hash = '#/home'), 400);
      console.log(response);
    } catch (err) {
      showToast(err.message || "No se pudo eliminar la cuenta", "error");
    } finally {
      deleteModal.classList.add('hidden');
      confirmText.value = '';
      passwordInput.value = '';
    }
  });
}

// Función para inicializar la vista de tareas
async function initTasks() {
  // Obtenemos referencias al tablero y al nombre de usuario
  const board = document.getElementById('kanban-board');
  const userNameDisplay = document.getElementById('user-name');
  if (!board) return;

  // Limpiar contenido actual
  board.querySelectorAll('.kanban-tasks').forEach(container => (container.innerHTML = ''));

  try {
    // Obtenemos el usuario logueado para mostrar su nombre
    const user = await getLoggedUser();
    if (userNameDisplay) {
      userNameDisplay.textContent = `¡Hola, ${user.firstName}!`;
    }

    // Obtenemos las tareas desde el backend
    const tasks = await getTasks();

    // Mapear las tareas a las columnas correspondientes
    tasks.forEach(task => {
      const columnId = getColumnIdByStatus(task.status);
      const columnContainer = document.getElementById(columnId);

      if (columnContainer) {
        const taskCard = createTaskCard(task);
        columnContainer.appendChild(taskCard);
      }
      console.log(`Asignando tarea "${task.title}" al contenedor "${columnId}"`);
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

  const formattedDate = task.date
    ? new Date(task.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : 'Sin fecha';

  taskCard.innerHTML = `
    <div class="task-actions">
      <button class="task-action-btn" onclick="location.hash = '#/edit-task?id=${task._id}'">✏️</button>
      <button class="task-action-btn" onclick="location.hash = '#/delete-task?id=${task._id}'">🗑️</button>
    </div>
    <div class="task-title">${task.title || 'Sin título'}</div>
    <div class="task-description">${task.details || 'Sin descripción'}</div>
    <div class="task-date">📅 ${formattedDate}</div>
    <div class="task-time">${task.time || 'Sin hora'}</div>

  `;

  return taskCard;
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

      /* if (taskElement) {
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
          } */


      if (taskElement) {
        try {
          // Actualizar el estado de la tarea en el backend
          await updateTaskStatus(taskId, newStatus);

          // Mover la tarea visualmente
          const tasksContainer = column.querySelector('.kanban-tasks');
          tasksContainer.appendChild(taskElement);
        } catch (error) {
          console.error('Error al actualizar estado de tarea:', error.message);
          // Podrías mostrar una notificación de error aquí
        }
      }
    });
  });
}

// Función global para eliminar tarea desde el tablero
/* window.deleteTaskFromBoard = async function(taskId) {
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
 */
/* window.deleteTaskFromBoard = async function(taskId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    try {
      const response = await deleteTask(taskId);
      console.log('Respuesta del backend:', response);

      // Remover elemento visual
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        taskElement.remove();
        console.log(`Tarea con ID ${taskId} eliminada del tablero.`);
      } else {
        console.warn(`No se encontró el elemento visual para la tarea con ID ${taskId}.`);
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error.message);
      alert('No se pudo eliminar la tarea. Inténtalo de nuevo.');
    }
  }
}; */

window.deleteTaskFromBoard = async function (taskId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    location.hash = `#/delete-task?id=${taskId}`;
  }
};

// Función global para editar tarea
window.editTask = function (taskId) {
  // Redirigir a la página de edición con el ID de la tarea
  location.hash = `#/edit-task?id=${taskId}`;
};




async function initEditProfile() {
  console.log("Vista editar perfil cargada ✅");

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
        console.log('Perfil actualizado:', updatedUser);
        alert('Perfil actualizado exitosamente');
        location.hash = '#/profile'; // Redirige a la vista del perfil
      } catch (error) {
        console.error('Error al actualizar el perfil:', error.message);
        alert('Error al actualizar el perfil');
      }
    });
  } catch (error) {
    console.error('Error al cargar la información del usuario:', error.message);
    alert('Error al cargar la información del usuario');
  }

  // Manejar el botón para volver al perfil
  backButton.addEventListener('click', () => {
    location.hash = '#/profile';
  });
}

async function initCreateTask() {
  console.log("Vista crear tarea cargada ✅");

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
      console.error('Error al crear la tarea:', error.message);
      alert('Error al crear la tarea');
    }
  });

  // Manejar el botón de cancelar
  cancelButton.addEventListener('click', () => {
    location.hash = '#/tasks';
  });
}

async function initEditTask() {
  console.log("Vista editar tarea cargada ✅");

  const form = document.getElementById('edit-task-form');
  const cancelButton = document.getElementById('cancelEditTask');

  if (!form) return;

  // Obtén el ID de la tarea desde la URL
  const params = new URLSearchParams(location.hash.split('?')[1]);
  const taskId = params.get('id');

  if (!taskId) {
    console.error('No se proporcionó un ID de tarea para editar.');
    alert('No se pudo cargar la tarea para editar.');
    location.hash = '#/tasks';
    return;
  }

  try {
    // Obtén la información de la tarea desde el backend
    const task = await getTask(taskId);

    if (!task) {
      console.error('No se encontró la tarea con el ID proporcionado.');
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
        console.log('Tarea actualizada:', updatedTask);
        alert('Tarea actualizada exitosamente');
        location.hash = '#/tasks'; // Redirige a la vista de tareas
      } catch (error) {
        console.error('Error al actualizar la tarea:', error.message);
        alert('Error al actualizar la tarea');
      }
    });
  } catch (error) {
    console.error('Error al cargar la tarea:', error.message);
    alert('Error al cargar la tarea');
    location.hash = '#/tasks';
  }

  // Manejar el botón de cancelar
  cancelButton.addEventListener('click', () => {
    location.hash = '#/tasks';
  });
}
async function initDeleteTask() {
  console.log("Eliminando tarea ✅");
  // Obtén el ID de la tarea desde la URL
  const params = new URLSearchParams(location.hash.split('?')[1]);
  const taskId = params.get('id');
  if (!taskId) {
    console.error('No se proporcionó un ID de tarea para eliminar.');
    alert('No se pudo eliminar la tarea.');
    location.hash = '#/tasks';
    return;
  }

  try {
    // Llama a la función para eliminar la tarea
    await deleteTask(taskId);
    console.log(`Tarea con ID ${taskId} eliminada exitosamente.`);
    //alert('Tarea eliminada exitosamente.');

    // Recarga la vista de tareas
    location.hash = '#/tasks';
    initTasks(); // Llama a initTasks para actualizar el tablero
  } catch (error) {
    console.error('Error al eliminar la tarea:', error.message);
    //alert('Error al eliminar la tarea.');
    location.hash = '#/tasks'; // Redirige a la vista de tareas
  }
}

// Agrega estas funciones al final de tu route.js, después de initTasks()

// Función para abrir modal de nueva tarea
/* function openTaskModal(status) {
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
} */

// Función para manejar envío de nueva tarea
/* async function handleTaskSubmit(e) {
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
*/