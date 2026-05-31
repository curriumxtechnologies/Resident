import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    type: {
      type: String,
      enum: ["purchase", "rental"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentPlan: {
      type: String,
      enum: ["30%", "50%", "100%"],
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    fullPrice: {
      type: Number,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    leaseStartDate: {
      type: Date,
    },
    leaseEndDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;