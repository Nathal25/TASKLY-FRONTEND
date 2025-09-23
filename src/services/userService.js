import { http } from "../api/http.js";

export async function sendRecoveryEmail(email) {
  return http.post('/api/v1/users/forgot-password', { email });
}

export async function resetPassword({token, email, password, confirmPassword}) {
  return http.post('/api/v1/users/reset-password', { token, email, password, confirmPassword });
}

export async function loginUser({ email, password }) {
  return http.post('/api/v1/users/login', { email, password });

  // Guarda el token en las cookies
  //document.cookie = `token=${response.token}; path=/;`;

  //return response;
}

export async function logoutUser() {
  return http.post('/api/v1/users/logout');
}

export async function registerUser(data) {
  return http.post('/api/v1/users/', data);
}

export async function getLoggedUser() {
  return http.get('/api/v1/users/me');
}

export async function editLoggedUser(updatedUser) {
  return http.put('/api/v1/users/edit-me', updatedUser);
}

export async function checkIfTokenIsValid() {
  return http.get('/api/v1/users/check-token');
}