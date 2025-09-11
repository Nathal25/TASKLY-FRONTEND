/**
 * Entry point of the application.
 * 
 * - Imports the global base CSS styles.
 * - Imports and initializes the router to handle hash-based navigation.
 */

import './styles/base.css';
import { initRouter } from './routes/route.js';
import { taskList } from "./data/mockData.js";
const taskListContainer = document.getElementById("task-List");

function renderTasksList() {
  taskListContainer.innerHTML = ""; // limpiar antes de pintar
  taskList.forEach(list => {
    const listDiv = document.createElement("div");
    listDiv.classList = "task-list";
    const title = document.createElement("h3");
    title.textContent = list.title;
    listDiv.appendChild(title);

    const ul = document.createElement("ul");
    list.tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task.text;

        if (task.completed) {
            li.style.textDecoration = "line-through";
        }
        ul.appendChild(li);
    });

    listDiv.appendChild(ul);
    taskListContainer.appendChild(listDiv);
    });
}

renderTasksList();
/**
 * Initialize the client-side router.
 * This sets up listeners and renders the correct view on app start.
 */
initRouter();