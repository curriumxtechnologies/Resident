import mongoose from "mongoose";

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    sellerType: { type: String, enum: ["landlord", "agency"], required: true },
    fullName: { type: String, trim: true },
    email: { type: String, lowercase: true },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },

    // Landlord specific
    address: { type: String, trim: true },
    proofOfAddressUrl: { type: String },
    ninCardUrl: { type: String },

    // Agency specific
    businessName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    officeAddress: { type: String, trim: true },
    cacCertificateUrl: { type: String },
    tin: { type: String, trim: true, default: "" },
    logoUrl: { type: String }, // NEW

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

const SellerApplication = mongoose.model("SellerApplication", sellerApplicationSchema);
export default SellerApplication;