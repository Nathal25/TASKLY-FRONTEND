import { http } from "../api/http.js";

/**
 * Servicio para gestionar tareas
 */

/**
 * Obtener todas las tareas del usuario actual
 * @returns {Promise<Array>} Lista de tareas
 */
export async function getTasks() {
  return http.get('/api/v1/tasks');
}

/**
 * Obtener una tarea específica por ID
 * @param {number} taskId - ID de la tarea
 * @returns {Promise<Object>} Datos de la tarea
 */
export async function getTask(taskId) {
  return http.get(`/api/v1/tasks/${taskId}`);
}

/**
 * Crear una nueva tarea
 * @param {Object} taskData - Datos de la tarea
 * @param {string} taskData.title - Título de la tarea
 * @param {string} [taskData.description] - Descripción de la tarea
 * @param {string} [taskData.status] - Estado de la tarea (Pending, In-progress, Completed)
 * @param {string} [taskData.dueDate] - Fecha límite
 * @param {string} [taskData.priority] - Prioridad (low, medium, high)
 * @param {number} [taskData.listId] - ID de la lista asociada
 * @returns {Promise<Object>} Tarea creada
 */
export async function createTask(taskData) {
  return http.post('/api/v1/tasks', taskData);
}

/**
 * Actualizar una tarea existente
 * @param {number} taskId - ID de la tarea
 * @param {Object} taskData - Datos actualizados de la tarea
 * @returns {Promise<Object>} Tarea actualizada
 */
export async function updateTask(taskId, taskData) {
  return http.put(`/api/v1/tasks/${taskId}`, taskData);
}

/**
 * Actualizar el estado de una tarea
 * @param {number} taskId - ID de la tarea
 * @param {string} newStatus - Nuevo estado (Pending, In-progress, Completed)
 * @returns {Promise<Object>} Tarea actualizada
 */
export async function updateTaskStatus(taskId, newStatus) {
  return http.put(`/api/v1/tasks/${taskId}/status`, { status: newStatus });
}

/**
 * Eliminar una tarea
 * @param {number} taskId - ID de la tarea a eliminar
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  return http.del(`/api/v1/tasks/${taskId}`);
}

/**
 * Marcar una tarea como completada
 * @param {number} taskId - ID de la tarea
 * @returns {Promise<Object>} Tarea actualizada
 */
export async function completeTask(taskId) {
  return updateTaskStatus(taskId, 'Completed');
}

/**
 * Obtener tareas filtradas por estado
 * @param {string} status - Estado a filtrar (Pending, In-progress, Completed)
 * @returns {Promise<Array>} Tareas filtradas
 */
export async function getTasksByStatus(status) {
  return http.get(`/api/v1/tasks?status=${encodeURIComponent(status)}`);
}

/**
 * Obtener tareas de una lista específica
 * @param {number} listId - ID de la lista
 * @returns {Promise<Array>} Tareas de la lista
 */
export async function getTasksByList(listId) {
  return http.get(`/api/v1/tasks?listId=${listId}`);
}