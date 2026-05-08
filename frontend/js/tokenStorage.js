// tokenStorage.js
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function storeUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAuthData() {
  storeToken(null);
  storeUser(null);
}