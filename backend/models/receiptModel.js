import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentPlan: {
      type: String,
      enum: ["30%", "50%", "100%"],
      required: true,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    fullPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentReference: {
      type: String,
      required: true,
    },
    paystackReference: {
      type: String,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    propertyLocation: {
      type: String,
    },
    buyerName: {
      type: String,
    },
    buyerEmail: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Receipt = mongoose.model("Receipt", receiptSchema);
export default Receipt;