// slices/userService.js
import { apiRequest, uploadRequest } from "../js/apiConfig.js";

// ---------- Profile (logged-in user) ----------
export async function getUserProfile() {
  const data = await apiRequest("/users/profile");
  return data.user; // { _id, name, email, username, phone, ... }
}

export async function updateUserProfile(userData) {
  // If userData is FormData → file upload (multipart)
  if (userData instanceof FormData) {
    const data = await uploadRequest("/users/profile", userData, "PUT");
    return data.user;
  }
  // Otherwise, normal JSON update
  const data = await apiRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
  return data.user;
}

// ---------- Admin: user management ----------
export async function getUsers(queryParams = {}) {
  const query = new URLSearchParams(queryParams).toString();
  const data = await apiRequest(`/users${query ? `?${query}` : ""}`);
  return data; // { users, total, page, pages }
}

export async function getUserById(userId) {
  const data = await apiRequest(`/users/${userId}`);
  return data.user;
}

export async function updateUser(userId, userData) {
  const data = await apiRequest(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
  return data.user;
}

export async function deleteUser(userId) {
  await apiRequest(`/users/${userId}`, { method: "DELETE" });
  return userId;
}