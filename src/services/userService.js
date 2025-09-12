import { http } from '../api/http.js';

/**
 * Register a new user in the system.
 *
 * Sends a POST request to the backend API (`/api/v1/users`)
 * with the provided username and password.
 *
 * @async
 * @function registerUser
 * @param {Object} params - User registration data.
 * @param {string} params.username - The username of the new user.
 * @param {string} params.password - The password of the new user.
 * @returns {Promise<Object>} The created user object returned by the API.
 * @throws {Error} If the API responds with an error status or message.
 *
 * @example
 * try {
 *   const user = await registerUser({ username: "alice", password: "secret" });
 *   console.log("User created:", user);
 * } catch (err) {
 *   console.error("Registration failed:", err.message);
 * }
 */
const URL='https://taskly-2h0c.onrender.com';
export async function registerUser(data) {
  const res = await fetch(`${URL}/api/v1/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error en el registro');
  }

  return res.json();
}