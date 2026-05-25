import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSellerDocs } from "../config/cloudinary.js";
import {
  registerSeller,
  getSellerApplications,
  reviewSellerApplication,
  getMyApplication,
  getSellerDetails,
  addSellerReview,
  reportSeller,
  getReports,
  resolveReport,
  suspendSeller,
  submitAppeal,
  reviewAppeal,
  grantVerificationBadge,
  requestVerificationBadge,
} from "../controllers/sellerController.js";

const router = Router();

router.use(protect); // all routes require auth

// ✅ Single‑segment routes (must come BEFORE /:id)
router.post("/register", uploadSellerDocs, registerSeller);
router.post("/request-verification", requestVerificationBadge);
router.post("/grant-verification", grantVerificationBadge);
router.post("/appeal", submitAppeal);
router.post("/review-appeal", reviewAppeal);
router.post("/resolve-report", resolveReport);
router.post("/suspend", suspendSeller);
router.get("/my-application", getMyApplication);
router.get("/applications", getSellerApplications);   // ✅ now works
router.get("/reports", getReports);

// ✅ Multi‑segment routes (fine after /:id, but keep before for clarity)
router.put("/applications/:id/review", reviewSellerApplication);
router.post("/:id/review", addSellerReview);
router.post("/:id/report", reportSeller);

// ✅ Wildcard route – must be LAST
router.get("/:id", getSellerDetails);

export default router;