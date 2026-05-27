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
  getLocations,        // Add this
  searchHouses,        // Add this
  getFeaturedHouses,   // Add this
} from "../controllers/houseController.js";

const router = Router();

// Public routes
router.get("/", getHouses);                   // filtered listings
router.get("/locations", getLocations);       // NEW: Get states/LGAs
router.get("/search", searchHouses);          // NEW: Search endpoint
router.get("/featured", getFeaturedHouses);   // NEW: Featured listings
router.get("/verify-payment", verifyPayment); // Paystack callback

// Protected routes
router.use(protect);

router.post("/", uploadHouseFiles, createHouseListing); // seller upload
router.get("/my-listings", getMyListings);              // own listings
router.post("/initiate-payment", initiatePayment);      // Paystack init

// Routes with :id
router.get("/:id", getHouseById);
router.put("/:id", updateHouse);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteHouse);

export default router;