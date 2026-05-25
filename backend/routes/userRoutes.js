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
} from "../controllers/userController.js";

const router = Router();

router.use(protect);

// Profile routes – now accepts multipart/form-data with file field 'profile'
router.get("/profile", getUserProfile);
router.put("/profile", uploadUserProfile, updateUserProfile);

// Admin routes
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;