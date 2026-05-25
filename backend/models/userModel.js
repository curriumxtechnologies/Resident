import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    profile: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },
    // SELLER FIELDS
    sellerType: {
      type: String,
      enum: ["landlord", "agency"],
      default: null,
    },
    sellerVerified: {
      type: Boolean,
      default: false,
    },
    // OTP fields (hidden from queries by default)
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },

    // ---------- NEW MODERATION FEATURES ----------
    // Suspension (admin can suspend a seller)
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: "",
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Verification badge (admin‑granted, visible to buyers)
    verificationBadge: {
      type: Boolean,
      default: false,
    },
    verificationBadgeGrantedAt: {
      type: Date,
    },
    verificationBadgeGrantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Report counter – increments when users report this seller
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;