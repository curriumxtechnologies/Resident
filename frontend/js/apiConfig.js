// js/apiConfig.js
import { getStoredToken } from "./tokenStorage.js";

// Dynamically set the base URL based on the current environment
export function getBaseURL() {
  return window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "https://resident-h51j.onrender.com/api";
}

// JSON requests (GET, POST, PUT, DELETE with JSON body)
export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include",
  };

  const response = await fetch(`${getBaseURL()}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Request failed",
    }));
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
}

// Multipart/form-data uploads (for files)
export async function uploadRequest(endpoint, formData, method = "POST") {
  const token = getStoredToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseURL()}${endpoint}`, {
    method,
    body: formData,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Upload failed");
  }

  return response.json();
}