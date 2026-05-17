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
    const listingType = req.body.listingType || "rent";
    const userId = req.user?._id?.toString() || "unknown";
    let folder = `Resident/Houses/${listingType}/${userId}`;

    // Separate subfolders for documents
    if (file.fieldname === "proofOfOwnership") {
      folder += "/proof";
    } else if (file.fieldname === "titleDocument") {
      folder += "/title";
    } else if (file.fieldname === "surveyPlan") {
      folder += "/survey";
    }

    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "pdf"],
      // No transformation – keep original
    };
  },
});

export const uploadHouseFiles = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
}).fields([
  { name: "images", maxCount: 10 },          // multiple property images
  { name: "proofOfOwnership", maxCount: 1 }, // for rent
  { name: "titleDocument", maxCount: 1 },    // for sale
  { name: "surveyPlan", maxCount: 1 },       // optional, for sale
]);