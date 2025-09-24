import { http } from "../api/http.js";

/**
 * Sends a password recovery email to the user.
 * @param {string} email - The email address of the user.
 * @returns {Promise<Object>} The response from the API.
 */
export async function sendRecoveryEmail(email) {
  return http.post('/api/v1/users/forgot-password', { email });
}

/** Resets the user's password using the provided token and new password.
 * @param {Object} params - The parameters for resetting the password.
 * @param {string} params.token - The password reset token.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.password - The new password.
 * @param {string} params.confirmPassword - The confirmation of the new password.
 * @returns {Promise<Object>} The response from the API.
 * */
export async function resetPassword({token, email, password, confirmPassword}) {
  return http.post('/api/v1/users/reset-password', { token, email, password, confirmPassword });
}
/**
 * Logs in a user with the provided email and password.
 * @param {Object} params - The login parameters.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<Object>} The response from the API.
 * */
export async function loginUser({ email, password }) {
  const response = await http.post('/api/v1/users/login', { email, password });

  // Guarda el token en las cookies
  document.cookie = `token=${response.token}; path=/;`;

  return response;
}

/**
 * Logs out the current user.
 * @returns {Promise<Object>} The response from the logout API.
 */
export async function logoutUser() {
  return http.post('/api/v1/users/logout');
}

/**
 * Registers a new user with the provided data.
 * @param {Object} data - The registration data.
 * @param {string} data.name - The user's name.
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's password.
 * @returns {Promise<Object>} The response from the registration API.
 * */
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

/**
 * Fetches the currently logged-in user's information.
 * @returns {Promise<Object>} The response from the API.
 */
export async function getLoggedUser() {
  return http.get('/api/v1/users/me');
}

/** Edits the currently logged-in user's information.
 * @param {Object} updatedUser - The updated user data.
 * @returns {Promise<Object>} The response from the API.
 */
export async function editLoggedUser(updatedUser) {
  return http.put('/api/v1/users/edit-me', updatedUser);
}