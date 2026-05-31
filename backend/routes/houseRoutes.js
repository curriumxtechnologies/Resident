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

// Public routes (no auth required)
router.get("/", getHouses);
router.get("/locations", getLocations);
router.get("/search", searchHouses);
router.get("/featured", getFeaturedHouses);
router.get("/verify-payment", verifyPayment);
router.get("/seller/:sellerId", getSellerListings);
router.post("/:id/inquiry", sendInquiry);

// Protected routes (auth required)
router.use(protect);

router.post("/", uploadHouseFiles, createHouseListing);
router.get("/my-listings", getMyListings);
router.get("/my-houses", getMyHouses);
router.get("/my-receipts", getMyReceipts);
router.post("/initiate-payment", initiatePayment);

// Routes with :id (must be AFTER specific routes)
router.get("/receipt/:receiptId/download", downloadReceipt);
router.get("/transaction/:id", getTransactionById);
router.get("/:id", getHouseById);
router.put("/:id", uploadHouseFiles, updateHouse);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteHouse);

export default router;