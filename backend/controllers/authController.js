import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { sendOTPEmail } from "../services/emailService.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ----------------------------------------------------------------
//  HELPER: Fetch user info from Google via access token
// ----------------------------------------------------------------
const getUserInfoFromAccessToken = async (accessToken) => {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info from Google");
  }

  return response.json();
};

// ----------------------------------------------------------------
//  HELPER: Generate a 6‑digit OTP
// ----------------------------------------------------------------
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ----------------------------------------------------------------
//  GOOGLE AUTH
// ----------------------------------------------------------------
const googleAuth = asyncHandler(async (req, res) => {
  const { token: googleToken } = req.body;

  if (!googleToken) {
    res.status(400);
    throw new Error("Google token is required");
  }

  let googleId, email, name, picture;

  // Try as ID token first
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    googleId = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch {
    // Fallback: treat as access token
    const userInfo = await getUserInfoFromAccessToken(googleToken);
    googleId = userInfo.sub || `google-${userInfo.email}`;
    email = userInfo.email;
    name = userInfo.name;
    picture = userInfo.picture;
  }

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    const baseUsername = (email?.split("@")[0] || name || "user")
      .toLowerCase()
      .replace(/\s+/g, "");

    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter++}`;
    }

    user = await User.create({
      googleId,
      name: name || "",
      username,
      email,
      profile: picture || "",
      password: `google-auth-${googleId}`,
      isVerified: true,
      authMethod: "google",
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isVerified = true;
    await user.save();
  }

  const token = generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
  });
});

// ----------------------------------------------------------------
//  LOGOUT
// ----------------------------------------------------------------
const logoutUser = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// ----------------------------------------------------------------
//  SIGNUP – Step 1: Send OTP
// ----------------------------------------------------------------
const sendSignupOTP = asyncHandler(async (req, res) => {
  const { name, username, email, password, phone, alternatePhone } = req.body;

  // Basic validation
  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error("All fields (name, username, email, password) are required");
  }

  // Check if user already exists and is verified
  const existingUser = await User.findOne({ email, isVerified: true });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Remove previous unverified attempt with the same email
  await User.deleteOne({ email, isVerified: false });

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    name,
    username,
    email,
    password,
    phone: phone || "",
    alternatePhone: alternatePhone || "",
    otp,
    otpExpires,
    isVerified: false,
  });

  // Send OTP email
  await sendOTPEmail(email, otp);

  res.status(201).json({
    message: "OTP sent to email. Please verify to complete signup.",
    userId: user._id,
  });
});

// ----------------------------------------------------------------
//  SIGNUP – Step 2: Verify OTP & complete signup
// ----------------------------------------------------------------
const verifySignupOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    res.status(400);
    throw new Error("userId and OTP are required");
  }

  const user = await User.findById(userId).select("+otp +otpExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  if (user.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  if (user.otpExpires < new Date()) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
  });
});

// ----------------------------------------------------------------
//  SIGNIN – Step 1: Send OTP to verified email
// ----------------------------------------------------------------
const sendSigninOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email, isVerified: true });

  if (!user) {
    res.status(404);
    throw new Error("No verified account found with this email");
  }

  if (user.authMethod !== "local") {
    res.status(400);
    throw new Error(`Please sign in with ${user.authMethod}`);
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOTPEmail(email, otp);

  res.status(200).json({
    message: "OTP sent to email. Please verify to sign in.",
    userId: user._id,
  });
});

// ----------------------------------------------------------------
//  SIGNIN – Step 2: Verify OTP and log in
// ----------------------------------------------------------------
const verifySigninOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    res.status(400);
    throw new Error("userId and OTP are required");
  }

  const user = await User.findById(userId).select("+otp +otpExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  if (user.otpExpires < new Date()) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    profile: user.profile,
    authMethod: user.authMethod,
    token,
  });
});

// ----------------------------------------------------------------
//  RESEND OTP (for signup or signin flows)
// ----------------------------------------------------------------
const resendOTP = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const user = await User.findById(userId).select("+otp +otpExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified && user.authMethod === "local") {
    // Allow resend for sign-in flow
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOTPEmail(user.email, otp);

  res.status(200).json({ message: "New OTP sent successfully" });
});

export {
  googleAuth,
  logoutUser,
  sendSignupOTP,
  verifySignupOTP,
  sendSigninOTP,
  verifySigninOTP,
  resendOTP,
};