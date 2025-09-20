import { http } from "../api/http.js";

export async function sendRecoveryEmail(email) {
  return http.post('/api/v1/users/forgot-password', { email });
}

export async function resetPassword({token, email, password, confirmPassword}) {
  return http.post('/api/v1/users/reset-password', { token, email, password, confirmPassword });
}

export async function loginUser({ email, password }) {
  const response = await http.post('/api/v1/users/login', { email, password });

  // Guarda el token en las cookies
  document.cookie = `token=${response.token}; path=/;`;

  return response;
}

export async function logoutUser() {
  return http.post('/api/v1/users/logout');
}

export async function getLoggedUser() {
  return http.get('/api/v1/users/me');
}

export async function registerUser(data) {
  try {
    const res = await fetch('https://taskly-2h0c.onrender.com/api/v1/users/', {
    //const res = await fetch('http://localhost:8080/api/v1/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // Intenta capturar el error y parsearlo correctamente
      const error = await res.text();  // Cambié a `.text()` para evitar errores si no es JSON
      console.error('Error en el servidor:', error); // Ver qué devuelve el servidor
      throw new Error(error || 'Error en el registro');
    }

    return res.json();  // Parsear el JSON de respuesta
  } catch (err) {
    console.error('Error al registrar:', err);  // Imprimir error general
    throw err;  // Relanzar el error para que se maneje en el frontend
  }
}

export async function getLoggedUser() {
  return http.get('/api/v1/users/me');
}

export async function editLoggedUser(updatedUser) {
  return http.put('/api/v1/users/edit-me', updatedUser);
}