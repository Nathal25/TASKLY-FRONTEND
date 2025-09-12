import taskList from "./data/mockData.js";

const board = document.getElementById("kanban-board");

function renderKanban() {
    const board = document.getElementById("kanban-board");
  if (!board) return; // seguridad por si no existe el div todavía
  board.innerHTML = ""; // limpiar antes de pintar

  taskList.forEach(list => {
    // Crear columna
    const column = document.createElement("div");
    column.classList.add("kanban-column");
    column.innerHTML = `<h3>${list.title}</h3>`;

    // Contenedor de tareas
    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("kanban-tasks");

    list.tasks.forEach(task => {
      const taskCard = document.createElement("div");
      taskCard.classList.add("kanban-task");
      taskCard.textContent = task.text;

      if (task.completed) {
        taskCard.classList.add("completed");
      }

      tasksContainer.appendChild(taskCard);
    });

    column.appendChild(tasksContainer);
    board.appendChild(column);
  });
}

// Espera que el DOM esté listo antes de renderizar
document.addEventListener("DOMContentLoaded", renderKanban);