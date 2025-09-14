import { registerUser } from '../services/userService.js';
import { sendRecoveryEmail } from '../services/userService.js';
import { resetPassword } from '../services/userService.js';
import { loginUser } from '../services/userService.js';
import { logoutUser } from '../services/userService.js';
import { getTasks } from '../services/taskService.js';
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
  const known = ['home', 'login', 'register', 'send-email', 'recover-password', 'recover-code', 'tasks'];
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

async function initTasks() {
  const board = document.getElementById('kanban-board');
  if (!board) return;

  board.querySelectorAll('.kanban-tasks').forEach(container => (container.innerHTML = ''));

  try {
    const data = await getTasks();
    if (!data) throw new Error('Error al cargar tareas desde el servidor');

    data.forEach(task => {
      let columnContainer;
      switch (task.status) {
        case 'Pending':
          columnContainer = board.querySelector('.kanban-column:nth-child(1) .kanban-tasks');
          break;
        case 'In-progress':
          columnContainer = board.querySelector('.kanban-column:nth-child(2) .kanban-tasks');
          break; 
        case 'Completed':
          columnContainer = board.querySelector('.kanban-column:nth-child(3) .kanban-tasks');
          break;
        default:
          console.warn('Estado de tarea desconocido:', task.status);
          return; // saltar esta tarea
      }

      const taskCard = document.createElement('div');
      taskCard.classList.add('kanban-task');
      taskCard.textContent = task.title;
      if (task.completed) taskCard.classList.add('completed');
      columnContainer.appendChild(taskCard);
    });
  } catch (err) {
    console.error(err);
    board.innerHTML = `<p style="color:#ffb4b4">No se pudieron cargar las tareas.</p>`;
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