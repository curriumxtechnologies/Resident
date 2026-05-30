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
} from "../controllers/houseController.js";

const router = Router();

// Public routes
router.get("/", getHouses);
router.get("/locations", getLocations);
router.get("/search", searchHouses);
router.get("/featured", getFeaturedHouses);
router.get("/verify-payment", verifyPayment);
router.get("/seller/:sellerId", getSellerListings);

// Protected routes
router.use(protect);

router.post("/", uploadHouseFiles, createHouseListing);
router.get("/my-listings", getMyListings);
router.post("/initiate-payment", initiatePayment);

// Routes with :id
router.get("/:id", getHouseById);
router.put("/:id", uploadHouseFiles, updateHouse); // ADD uploadHouseFiles middleware
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteHouse);

export default router;