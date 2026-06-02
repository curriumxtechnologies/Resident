// backend/routes/houseRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadHouseFiles } from "../config/cloudinaryHouse.js";
import {
  createHouseListing,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse,
  getMyListings,
  toggleStatus,
  initiatePayment,
  verifyPayment,
  getLocations,
  searchHouses,
  getFeaturedHouses,
  getSellerListings,
  sendInquiry,
  getMyHouses,
  getTransactionById,
  downloadReceipt,
  getMyReceipts,
} from "../controllers/houseController.js";

const router = Router();

// ========== PUBLIC ROUTES (NO AUTH REQUIRED) ==========
router.get("/", getHouses);
router.get("/locations", getLocations);
router.get("/search", searchHouses);
router.get("/featured", getFeaturedHouses);
router.get("/verify-payment", verifyPayment);
router.get("/seller/:sellerId", getSellerListings);
router.post("/:id/inquiry", sendInquiry);
router.get("/:id", getHouseById);  // ✅ MOVE THIS HERE - PUBLIC!

// ========== PROTECTED ROUTES (AUTH REQUIRED) ==========
router.use(protect);

// House management
router.post("/", uploadHouseFiles, createHouseListing);
router.put("/:id", uploadHouseFiles, updateHouse);
router.delete("/:id", deleteHouse);
router.patch("/:id/status", toggleStatus);

// User specific
router.get("/my-listings", getMyListings);
router.get("/my-houses", getMyHouses);
router.get("/my-receipts", getMyReceipts);

// Payment
router.post("/initiate-payment", initiatePayment);

// Receipts and transactions
router.get("/receipt/:receiptId/download", downloadReceipt);
router.get("/transaction/:id", getTransactionById);

export default router;