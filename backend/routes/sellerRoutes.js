import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSellerDocs } from "../config/cloudinary.js";
import {
  registerSeller,
  getSellerApplications,
  reviewSellerApplication,
  getMyApplication,
} from "../controllers/sellerController.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/register", uploadSellerDocs, registerSeller);
router.get("/my-application", protect, getMyApplication);
router.get("/applications", getSellerApplications);          // admin check inside
router.put("/applications/:id/review", reviewSellerApplication); // admin check inside

export default router;