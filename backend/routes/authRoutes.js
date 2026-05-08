  import { Router } from "express";
  import {
    googleAuth,
    logoutUser,
    sendSignupOTP,
    verifySignupOTP,
    sendSigninOTP,
    verifySigninOTP,
    resendOTP,
  } from "../controllers/authController.js";

  const router = Router();

  // Google OAuth
  router.post("/google", googleAuth);

  // Local OTP-based signup
  router.post("/signup/send-otp", sendSignupOTP);
  router.post("/signup/verify", verifySignupOTP);

  // Local OTP-based signin
  router.post("/signin/send-otp", sendSigninOTP);
  router.post("/signin/verify", verifySigninOTP);

  // Resend OTP (works for both flows)
  router.post("/resend-otp", resendOTP);

  // Logout
  router.post("/logout", logoutUser);

  export default router;