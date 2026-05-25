// slices/sellerService.js
import { apiRequest, getBaseURL } from "../js/apiConfig.js";

// ========================
// SELLER APPLICATION (existing)
// ========================

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

// ========================
// ADMIN: APPLICATION MANAGEMENT
// ========================

/**
 * Get all seller applications (admin only)
 */
export async function getSellerApplications(statusFilter = "") {
  const url = statusFilter ? `/sellers/applications?status=${statusFilter}` : "/sellers/applications";
  return await apiRequest(url);
}

/**
 * Review a seller application (admin only)
 */
export async function reviewSellerApplication(applicationId, status, adminNote = "") {
  return await apiRequest(`/sellers/applications/${applicationId}/review`, {
    method: "PUT",
    body: JSON.stringify({ status, adminNote }),
  });
}

// ========================
// PUBLIC SELLER DETAILS & REVIEWS
// ========================

/**
 * Get full seller details (public) – includes reviews, average rating, seller info
 */
export async function getSellerDetails(sellerId) {
  const data = await apiRequest(`/sellers/${sellerId}`);
  return data; // { seller, reviews, averageRating, etc. }
}

/**
 * Add a review for a seller (logged‑in user)
 */
export async function addSellerReview(sellerId, rating, comment, isVerifiedPurchase = false) {
  return await apiRequest(`/sellers/${sellerId}/review`, {
    method: "POST",
    body: JSON.stringify({ sellerId, rating, comment, isVerifiedPurchase }),
  });
}

/**
 * Report a seller (logged‑in user)
 */
export async function reportSeller(sellerId, reason) {
  return await apiRequest(`/sellers/${sellerId}/report`, {
    method: "POST",
    body: JSON.stringify({ sellerId, reason }),
  });
}

// ========================
// SUSPENSION & APPEALS
// ========================

/**
 * Submit an appeal after being suspended (seller only)
 */
export async function submitAppeal(reason) {
  return await apiRequest("/sellers/appeal", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

/**
 * Admin: review an appeal
 */
export async function reviewAppeal(appealId, decision, adminResponse = "") {
  return await apiRequest("/sellers/review-appeal", {
    method: "POST",
    body: JSON.stringify({ appealId, decision, adminResponse }),
  });
}

/**
 * Admin: suspend or unsuspend a seller
 */
export async function suspendSeller(sellerId, suspend, reason = "") {
  return await apiRequest("/sellers/suspend", {
    method: "POST",
    body: JSON.stringify({ sellerId, suspend, reason }),
  });
}

// ========================
// VERIFICATION BADGE
// ========================

/**
 * Request a verification badge (seller only)
 */
export async function requestVerificationBadge() {
  return await apiRequest("/sellers/request-verification", {
    method: "POST",
  });
}

/**
 * Admin: grant or remove verification badge
 */
export async function grantVerificationBadge(sellerId, grant) {
  return await apiRequest("/sellers/grant-verification", {
    method: "POST",
    body: JSON.stringify({ sellerId, grant }),
  });
}

// ========================
// ADMIN: REPORT MANAGEMENT
// ========================

/**
 * Get all reports (admin only)
 */
export async function getReports() {
  return await apiRequest("/sellers/reports");
}

/**
 * Resolve a report and optionally suspend the seller
 */
export async function resolveReport(reportId, action, adminNote = "") {
  return await apiRequest("/sellers/resolve-report", {
    method: "POST",
    body: JSON.stringify({ reportId, action, adminNote }),
  });
}