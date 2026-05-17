import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingType: {
      type: String,
      enum: ["rent", "sale"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    bedrooms: Number,
    bathrooms: Number,
    size: String,
    yearBuilt: Number,

    // Rent‑specific fields
    furnishing: String,
    leaseTerm: String,
    securityDeposit: String,
    serviceCharge: String,
    availability: String,
    utilityTerms: String,
    petPolicy: String,

    // Sale‑specific fields
    ownershipType: String,

    // Location
    state: { type: String, required: true },
    lga: { type: String, required: true },
    address: { type: String, required: true },

    // Features
    features: [String], // from checkboxes + comma‑separated extra
    otherFeatures: String, // raw text

    // Images (array of cloudinary objects)
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    // Documents (rent: proof of ownership / agency authorisation)
    proofOfOwnership: {
      url: String,
      public_id: String,
    },

    // Sale documents
    titleDocument: {
      url: String,
      public_id: String,
    },
    surveyPlan: {
      url: String,
      public_id: String,
    },

    // Seller contact (auto‑filled from user or overridden)
    contactName: String,
    contactEmail: String,
    contactPhone: String,
    contactAlternatePhone: String,

    // Listing status
    status: {
      type: String,
      enum: ["published", "draft", "sold", "rented", "inactive"],
      default: "published",
    },
  },
  { timestamps: true }
);

const House = mongoose.model("House", houseSchema);
export default House;