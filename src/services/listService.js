import { http } from "../api/http.js";

/**
 * Servicio para gestionar listas de tareas
 */

/**
 * Obtener todas las listas del usuario actual
 * @returns {Promise<Array>} Lista de listas del usuario
 */
export async function getLists() {
  return http.get('/api/v1/lists');
}

/**
 * Crear una nueva lista
 * @param {Object} listData - Datos de la lista
 * @param {string} listData.name - Nombre de la lista
 * @param {string} [listData.description] - Descripción de la lista
 * @returns {Promise<Object>} Lista creada
 */
export async function createList(listData) {
  return http.post('/api/v1/lists', listData);
}

/**
 * Actualizar una lista existente
 * @param {number} listId - ID de la lista
 * @param {Object} listData - Datos actualizados de la lista
 * @returns {Promise<Object>} Lista actualizada
 */
export async function updateList(listId, listData) {
  return http.put(`/api/v1/lists/${listId}`, listData);
}

/**
 * Eliminar una lista
 * @param {number} listId - ID de la lista a eliminar
 * @returns {Promise<void>}
 */
export async function deleteList(listId) {
  return http.del(`/api/v1/lists/${listId}`);
}

/**
 * Obtener tareas de una lista específica
 * @param {number} listId - ID de la lista
 * @returns {Promise<Array>} Tareas de la lista
 */
export async function getListTasks(listId) {
  return http.get(`/api/v1/lists/${listId}/tasks`);
}
