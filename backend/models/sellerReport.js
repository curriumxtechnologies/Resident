import mongoose from "mongoose";

const sellerReportSchema = new mongoose.Schema(
  {
    reportedSeller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
    adminNote: { type: String, default: "" },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const SellerReport = mongoose.model("SellerReport", sellerReportSchema);
export default SellerReport;