import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// ----------------------------------------------------------------
//  GET PROFILE – /api/users/profile
// ----------------------------------------------------------------
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      alternatePhone: user.alternatePhone,
      profile: user.profile,
      role: user.role,
      sellerType: user.sellerType,
      sellerVerified: user.sellerVerified,
      isVerified: user.isVerified,
      authMethod: user.authMethod,
      createdAt: user.createdAt,
    },
  });
});

// ----------------------------------------------------------------
//  UPDATE PROFILE – /api/users/profile
// ----------------------------------------------------------------
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Text fields
  const { name, username, phone, alternatePhone } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (alternatePhone !== undefined) user.alternatePhone = alternatePhone;

  // Username uniqueness
  if (username && username !== user.username) {
    const existingUsername = await User.findOne({ username, _id: { $ne: user._id } });
    if (existingUsername) {
      res.status(400);
      throw new Error("Username already taken");
    }
    user.username = username;
  }

  // Profile picture – multer-storage-cloudinary already uploaded, just get the URL
  if (req.file) {
    user.profile = req.file.path; // Cloudinary URL
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: "Profile updated",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      alternatePhone: updatedUser.alternatePhone,
      profile: updatedUser.profile,
      role: updatedUser.role,
    },
  });
});

// … other functions (getUserProfile, getUsers, etc.) remain unchanged

// ----------------------------------------------------------------
//  ADMIN: GET ALL USERS – /api/users
// ----------------------------------------------------------------
const getUsers = asyncHandler(async (req, res) => {
  // Role check – only admin
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const { page = 1, limit = 20, search, role, sellerType, isVerified } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (sellerType) filter.sellerType = sellerType;
  if (isVerified !== undefined) filter.isVerified = isVerified === "true";

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const users = await User.find(filter)
    .select("-password -otp -otpExpires")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    users,
  });
});

// ----------------------------------------------------------------
//  ADMIN: GET SINGLE USER – /api/users/:id
// ----------------------------------------------------------------
const getUserById = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const user = await User.findById(req.params.id).select(
    "-password -otp -otpExpires"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, user });
});

// ----------------------------------------------------------------
//  ADMIN: UPDATE USER – /api/users/:id
// ----------------------------------------------------------------
const updateUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const {
    name,
    username,
    email,
    phone,
    alternatePhone,
    role,
    sellerType,
    sellerVerified,
    isVerified,
    profile,
  } = req.body;

  if (name) user.name = name;
  if (username) user.username = username;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (alternatePhone !== undefined) user.alternatePhone = alternatePhone;
  if (role) user.role = role;
  if (sellerType) user.sellerType = sellerType;
  if (sellerVerified !== undefined) user.sellerVerified = sellerVerified;
  if (isVerified !== undefined) user.isVerified = isVerified;
  if (profile) user.profile = profile;

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: "User updated",
    user: updatedUser,
  });
});

// ----------------------------------------------------------------
//  ADMIN: DELETE USER – /api/users/:id
// ----------------------------------------------------------------
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.remove();

  res.json({ success: true, message: "User deleted successfully" });
});

export {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};