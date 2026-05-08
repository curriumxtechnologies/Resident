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
    setAuthData(data.token, {
      _id: data._id,
      name: data.name,
      email: data.email,
      username: data.username,
      role: data.role,
      profile: data.profile,
      authMethod: data.authMethod,
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
    setAuthData(data.token, {
      _id: data._id,
      name: data.name,
      email: data.email,
      username: data.username,
      role: data.role,
      profile: data.profile,
      authMethod: data.authMethod,
    });
    return data;
  },

  // --- Google OAuth ---
  async googleAuth(token) {
    const data = await apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    setAuthData(data.token, {
      _id: data._id,
      name: data.name,
      email: data.email,
      profile: data.profile,
      authMethod: data.authMethod,
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