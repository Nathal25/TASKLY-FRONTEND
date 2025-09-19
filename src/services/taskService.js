import { http } from "../api/http.js";

export async function getTasks() {
    return http.get('/api/v1/tasks');
}

export async function createTask(taskData) {
    return http.post('/api/v1/tasks', taskData);
}

export async function updateTask(taskId, taskData) {
    return http.put(`/api/v1/tasks/${taskId}`, taskData);
}

export async function deleteTask(taskId) {
    return http.del(`/api/v1/tasks/${taskId}`);
}

export async function updateTaskStatus(taskId, newStatus) {
    return http.put(`/api/v1/tasks/${taskId}`, { status: newStatus });
}