import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const type = req.body.sellerType || "landlord";
    const folder = `Resident/Sellers/${type}`;
    return {
      folder,
      allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
    };
  },
});

export const uploadSellerDocs = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).fields([
  { name: "proofOfAddress", maxCount: 1 },
  { name: "ninCard", maxCount: 1 },
  { name: "cacCertificate", maxCount: 1 },
  { name: "logo", maxCount: 1 }, // ← NEW: agency logo
]);