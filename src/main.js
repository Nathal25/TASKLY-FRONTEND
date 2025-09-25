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
  }

  // Si se hizo clic en un enlace dentro del menú
  if (e.target.closest("#nav-content a")) {
    navContent.classList.remove("active");
    document.getElementById("nav-toggle")?.classList.remove("open");
  }
});

// ====== Toggle "ojito" en Login ======
document.addEventListener("click", (e) => {
  const togglePassword = e.target.closest("#togglePasswordLogin");
  if (togglePassword) {
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Cambiar icono
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    }
  }
});

// ====== Toggle "ojitos" en Registro ======
document.addEventListener("click", (e) => {
  // Contraseña
  const toggle1 = e.target.closest("#togglePassword");
  if (toggle1) {
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      toggle1.classList.toggle("fa-eye");
      toggle1.classList.toggle("fa-eye-slash");
    }
  }

  // Confirmar contraseña
  const toggle2 = e.target.closest("#togglePassword2");
  if (toggle2) {
    const confirmInput = document.getElementById("confirmPassword");
    if (confirmInput) {
      const type = confirmInput.getAttribute("type") === "password" ? "text" : "password";
      confirmInput.setAttribute("type", type);

      toggle2.classList.toggle("fa-eye");
      toggle2.classList.toggle("fa-eye-slash");
    }
  }
});
