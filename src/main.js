import home from "./views/home.html?raw";
import login from "./views/login.html?raw";
import register from "./views/register.html?raw";

const routes = {
  "/home": home,
  "/login": login,
  "/register": register,
};

function router() {
  const hash = window.location.hash.replace("#", "") || "/home";
  const app = document.getElementById("app");
  app.innerHTML = routes[hash] || "<h1>404 - Not Found</h1>";
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
