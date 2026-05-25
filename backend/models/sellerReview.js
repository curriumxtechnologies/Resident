import mongoose from "mongoose";

const sellerReviewSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    isVerifiedPurchase: { type: Boolean, default: false }, // set if buyer actually purchased/rented
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One review per reviewer per seller
sellerReviewSchema.index({ seller: 1, reviewer: 1 }, { unique: true });

const SellerReview = mongoose.model("SellerReview", sellerReviewSchema);
export default SellerReview;