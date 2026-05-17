// slices/sellerService.js
import { apiRequest, getBaseURL } from "../js/apiConfig.js";

/**
 * Submit seller application with file uploads (multipart/form-data)
 */
export async function registerSeller(formData) {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${getBaseURL()}/sellers/register`, {
    method: "POST",
    body: formData,
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Seller application failed");
  }

  const data = await response.json();
  return data.application;
}

/**
 * Get logged‑in user's own application (returns null if none)
 */
export async function getMyApplication() {
  try {
    const data = await apiRequest("/sellers/my-application");
    return data;
  } catch (error) {
    if (error.message.includes("404")) return null;
    throw error;
  }
}

// Admin functions (unchanged) – they use apiRequest for JSON
export async function getSellerApplications(statusFilter = "") {
  const url = statusFilter ? `/sellers/applications?status=${statusFilter}` : "/sellers/applications";
  return await apiRequest(url);
}

export async function reviewSellerApplication(applicationId, status, adminNote = "") {
  return await apiRequest(`/sellers/applications/${applicationId}/review`, {
    method: "PUT",
    body: JSON.stringify({ status, adminNote }),
  });
}