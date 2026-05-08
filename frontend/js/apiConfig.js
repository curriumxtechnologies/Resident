// apiConfig.js
import { getStoredToken } from "./tokenStorage.js";

const BASE_URL = "http://localhost:8000/api"; // adjust to your backend

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
    const errorData = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(errorData.message || "Request failed");
  }

  return response.json();
}