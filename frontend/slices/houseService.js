// slices/houseService.js
import { apiRequest, uploadRequest } from "../js/apiConfig.js";

// ---------- Public routes ----------
export async function getHouses(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return await apiRequest(`/houses${query ? `?${query}` : ""}`);
}

export async function getHouseById(houseId) {
  const data = await apiRequest(`/houses/${houseId}`);
  return data.house;
}

// ---------- Protected routes (multipart) ----------
export async function createHouseListing(formData) {
  return await uploadRequest("/houses", formData, "POST");
}

export async function updateHouse(houseId, updates) {
  const data = await apiRequest(`/houses/${houseId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.house;
}

export async function deleteHouse(houseId) {
  await apiRequest(`/houses/${houseId}`, { method: "DELETE" });
  return houseId;
}

export async function getMyListings() {
  const data = await apiRequest("/houses/my-listings");
  return data.houses;
}

export async function toggleHouseStatus(houseId, status) {
  const data = await apiRequest(`/houses/${houseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data.house;
}

// ---------- Payment ----------
export async function initiatePayment({ houseId, amount, email }) {
  return await apiRequest("/houses/initiate-payment", {
    method: "POST",
    body: JSON.stringify({ houseId, amount, email }),
  });
}

export async function verifyPayment(reference) {
  return await apiRequest(`/houses/verify-payment?reference=${reference}`);
}