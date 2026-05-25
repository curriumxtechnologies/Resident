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
    return {
      folder: "Resident/Profiles",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    };
  },
});

export const uploadUserProfile = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("profile"); // field name must be 'profile'