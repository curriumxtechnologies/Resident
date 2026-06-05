import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadUserProfile } from "../config/cloudinaryUser.js";
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,    // Import new functions
  deleteAccount,
  getSecurityInfo,
} from "../controllers/userController.js";

const router = Router();

router.use(protect);

// Security routes (place BEFORE /:id to avoid conflicts)
router.get("/security", getSecurityInfo);
router.put("/password", changePassword);
router.delete("/account", deleteAccount);

// Profile routes
router.get("/profile", getUserProfile);
router.put("/profile", uploadUserProfile, updateUserProfile);

// Admin routes
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;