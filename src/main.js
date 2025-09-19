// ===== Importar estilos =====
import './styles/base.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/login.css';
import './styles/register.css';
import './styles/recover.css';
import './styles/task.css';   
import './styles/kanban.css';
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
