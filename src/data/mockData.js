// src/data/mockData.js

const taskLists = [
  {
    id: 'list-1',
    title: 'Tareas del hogar',
    tasks: [
      { id: 'task-1', text: 'Limpiar la cocina', completed: false },
      { id: 'task-2', text: 'Sacar la basura', completed: true },
      { id: 'task-3', text: 'Hacer el mercado', completed: false },
    ],
  },
  {
    id: 'list-2',
    title: 'Proyecto de desarrollo',
    tasks: [
      { id: 'task-4', text: 'Configurar el entorno', completed: true },
      { id: 'task-5', text: 'Crear maqueta de datos', completed: false },
      { id: 'task-6', text: 'Implementar el menú', completed: false },
    ],
  },
  {
    id: 'list-3',
    title: 'Ideas de viaje',
    tasks: [
      { id: 'task-7', text: 'Investigar vuelos', completed: false },
      { id: 'task-8', text: 'Reservar hotel', completed: false },
    ],
  },
];

export default taskLists;