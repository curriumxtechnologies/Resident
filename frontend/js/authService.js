// authService.js
import { apiRequest } from "./apiConfig.js";
import {
  getStoredToken,
  storeToken,
  getStoredUser,
  storeUser,
  clearAuthData,
} from "./tokenStorage.js";

// Simple event emitter for auth changes
class AuthEventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach((cb) => cb(data));
  }
}

const authEvents = new AuthEventEmitter();

function setAuthData(token, user) {
  storeToken(token);
  storeUser(user);
  authEvents.emit("authChange", { token, user });
}

// Re-export getStoredToken and getStoredUser if needed elsewhere (optional)
export { getStoredToken, getStoredUser };

export const authService = {
  onAuthChange(callback) {
    authEvents.on("authChange", callback);
  },

  getAuthState() {
    return {
      token: getStoredToken(),
      user: getStoredUser(),
    };
  },

  // --- Signup flow ---
  async sendSignupOTP({ name, username, email, password, phone, alternatePhone }) {
    const data = await apiRequest("/auth/signup/send-otp", {
      method: "POST",
      body: JSON.stringify({ name, username, email, password, phone, alternatePhone }),
    });
    return data; // { message, userId }
  },

  async verifySignupOTP({ userId, otp }) {
    const data = await apiRequest("/auth/signup/verify", {
      method: "POST",
      body: JSON.stringify({ userId, otp }),
    });
    
    // Handle nested user data (API may return { token, user: { ... } } or flat { token, _id, ... })
    const userData = data.user || data;
    
    setAuthData(data.token, {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role || userData.userRole || userData.accountType || "user",
      profile: userData.profile,
      authMethod: userData.authMethod,
    });
    return data;
  },

  // --- Signin flow ---
  async sendSigninOTP({ email }) {
    const data = await apiRequest("/auth/signin/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return data; // { message, userId }
  },

  async verifySigninOTP({ userId, otp }) {
    const data = await apiRequest("/auth/signin/verify", {
      method: "POST",
      body: JSON.stringify({ userId, otp }),
    });
    
    // Handle nested user data
    const userData = data.user || data;
    
    setAuthData(data.token, {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role || userData.userRole || userData.accountType || "user",
      profile: userData.profile,
      authMethod: userData.authMethod,
    });
    return data;
  },

  // --- Google OAuth ---
  async googleAuth(token) {
    const data = await apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    
    // Handle nested user data
    const userData = data.user || data;
    
    setAuthData(data.token, {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role || userData.userRole || userData.accountType || "user",
      profile: userData.profile,
      authMethod: userData.authMethod,
    });
    return data;
  },

  // --- Resend OTP ---
  async resendOTP({ userId }) {
    return await apiRequest("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  // --- Logout ---
  async logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    clearAuthData();
  },
};