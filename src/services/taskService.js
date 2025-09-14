import { http } from "../api/http.js";

export async function getTasks() {
    return http.get('/api/v1/tasks');
}