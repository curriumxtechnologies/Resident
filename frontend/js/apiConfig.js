// js/apiConfig.js
import { getStoredToken } from "./tokenStorage.js";

// Dynamically set the base URL based on the current environment
const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api" // Local development backend
    : "https://resident-azkm.onrender.com/api"; // Deployed production backend

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
    credentials: "include", // if you use httpOnly cookies
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Request failed",
    }));
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
}