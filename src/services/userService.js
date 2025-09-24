import { http } from "../api/http.js";

/**
 * Sends a password recovery email to the user.
 * @param {string} email - The user's email address.
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

/** Logs in a user with the provided email and password.
 * @param {Object} params - The login parameters.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<Object>} The response from the API.
 * */
export async function loginUser({ email, password }) {
  return http.post('/api/v1/users/login', { email, password });

  // Guarda el token en las cookies
  //document.cookie = `token=${response.token}; path=/;`;

  //return response;
}

/** Logs out the current user.
 * @returns {Promise<Object>} The response from the logout API.
 */
export async function logoutUser() {
  return http.post('/api/v1/users/logout');
}

/** Registers a new user with the provided data.
 * @param {Object} data - The registration data.
 * @param {string} data.name - The user's name. 
 * @param {string} data.email - The user's email address.
 * @param {string} data.password - The user's password.
 * @returns {Promise<Object>} The response from the registration API.
 * */
export async function registerUser(data) {
  return http.post('/api/v1/users/', data);
}

/**
 * Gets the currently logged-in user's information.
 * @returns {Promise<Object>} The logged-in user's data.
 */
export async function getLoggedUser() {
  return http.get('/api/v1/users/me');
}

/** Edits the currently logged-in user's information.
 * @param {Object} updatedUser - The updated user data.
 * @param {string} [updatedUser.name] - The user's new name.
 * @param {string} [updatedUser.email] - The user's new email address.
 * @param {string} [updatedUser.password] - The user's new password.
 * @returns {Promise<Object>} The updated user data.
 * */
export async function editLoggedUser(updatedUser) {
  return http.put('/api/v1/users/edit-me', updatedUser);
}

/** Checks if the current authentication token is valid.
 * @returns {Promise<Object>} The response from the API indicating token validity.
 * */
export async function checkIfTokenIsValid() {
  return http.get('/api/v1/users/check-token');
}

/**
 * Deletes the currently logged-in user's account.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The response from the API.
 */
export async function deleteLoggedUser(password) {
  return http.del('/api/v1/users/me', { password });
}