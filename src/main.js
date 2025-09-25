// ===== Importar estilos =====
import './styles/base.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/login.css';
import './styles/register.css';
import './styles/recover.css';
import './styles/task.css';
import './styles/create-task.css';
import './styles/edit-task.css';
import './styles/profile.css';
import './styles/edit-profile.css';

import { initRouter } from './routes/route.js';

// Inicializar el router
initRouter();

// ===== Navbar con delegación de eventos =====
document.addEventListener("click", (e) => {
  const navToggle = e.target.closest("#nav-toggle");
  const navContent = document.getElementById("nav-content");

  // Si se hizo clic en el botón hamburguesa
  if (navToggle && navContent) {
    navContent.classList.toggle("active");
    navToggle.classList.toggle("open");
    return; // evita que siga al resto
  }

  // Si se hizo clic en un enlace dentro del menú
  if (e.target.closest("#nav-content a")) {
    navContent?.classList.remove("active");
    document.getElementById("nav-toggle")?.classList.remove("open");
    return;
  }

  // ===== Toggle "ojitos" en Login y Registro =====
  const eye = e.target.closest(".toggle-icon");
  if (eye) {
    // 1) Preferencia: usar data-target explícito
    const selector = eye.getAttribute("data-target");
    let input = selector ? document.querySelector(selector) : null;

    // 2) Fallback: buscar dentro del wrapper correspondiente
    if (!input) {
      const wrapper = eye.closest(
        ".input-wrapper, .input-wrapper-login, .input-wrapper-register"
      );
      input = wrapper?.querySelector(
        'input[type="password"], input[type="text"]'
      );
    }

    // 3) Alternar tipo de input
    if (input) {
      input.type = input.type === "password" ? "text" : "password";

      // Cambiar icono FontAwesome
      eye.classList.toggle("fa-eye");
      eye.classList.toggle("fa-eye-slash");
    }

    return; // evita que se propaguen otros handlers
  }
});
