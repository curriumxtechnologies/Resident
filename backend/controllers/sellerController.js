import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import SellerApplication from "../models/sellerApplicationModel.js";

// @desc    Submit seller application (landlord or agency)
// @route   POST /api/sellers/register
// @access  Private (any logged-in user)
const registerSeller = asyncHandler(async (req, res) => {
  const {
    sellerType,
    fullName,
    email,
    phone,
    alternatePhone,
    address,
    businessName,
    ownerName,
    officeAddress,
    tin,
  } = req.body;
  const user = req.user;

  if (!sellerType || !["landlord", "agency"].includes(sellerType)) {
    res.status(400);
    throw new Error("Valid sellerType (landlord or agency) is required");
  }

  const existingApp = await SellerApplication.findOne({ user: user._id });
  if (existingApp) {
    res.status(400);
    throw new Error("You already submitted a seller application");
  }

  const appData = {
    user: user._id,
    sellerType,
    fullName: fullName || user.name,
    email: email || user.email,
    phone: phone || user.phone || "",
    alternatePhone: alternatePhone || user.alternatePhone || "",
  };

  if (sellerType === "landlord") {
    if (!address || !req.files?.proofOfAddress || !req.files?.ninCard) {
      res.status(400);
      throw new Error(
        "Landlord requires address, proof of address, and NIN card"
      );
    }
    appData.address = address;
    appData.proofOfAddressUrl = req.files.proofOfAddress[0].path;
    appData.ninCardUrl = req.files.ninCard[0].path;
  }

  if (sellerType === "agency") {
    if (
      !businessName ||
      !ownerName ||
      !officeAddress ||
      !req.files?.cacCertificate ||
      !req.files?.proofOfAddress
    ) {
      res.status(400);
      throw new Error(
        "Agency requires business name, owner name, office address, CAC certificate, and proof of address"
      );
    }
    appData.businessName = businessName;
    appData.ownerName = ownerName;
    appData.officeAddress = officeAddress;
    appData.cacCertificateUrl = req.files.cacCertificate[0].path;
    appData.tin = tin || "";
    appData.proofOfAddressUrl = req.files.proofOfAddress[0].path;
  }

  const application = await SellerApplication.create(appData);

  if (phone) {
    user.phone = phone;
    if (alternatePhone) user.alternatePhone = alternatePhone;
    await user.save();
  }

  res.status(201).json({
    message: "Seller application submitted successfully. Awaiting admin review.",
    application,
  });
});

// @desc    Get all seller applications (admin only)
// @route   GET /api/sellers/applications
// @access  Private/Admin
const getSellerApplications = asyncHandler(async (req, res) => {
  // Admin role check
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const { status } = req.query;
  const filter = status ? { status } : {};
  const applications = await SellerApplication.find(filter)
    .populate("user", "name email username")
    .sort("-createdAt");
  res.json(applications);
});

// @desc    Review a seller application (admin only)
// @route   PUT /api/sellers/applications/:id/review
// @access  Private/Admin
const reviewSellerApplication = asyncHandler(async (req, res) => {
  // Admin role check
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  const { status, adminNote } = req.body;

  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const application = await SellerApplication.findById(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  application.status = status;
  application.adminNote = adminNote || "";

  if (status === "approved") {
    const user = await User.findById(application.user);
    if (user) {
      user.role = "seller";
      user.sellerType = application.sellerType;
      user.sellerVerified = true;
      if (application.phone) user.phone = application.phone;
      if (application.alternatePhone)
        user.alternatePhone = application.alternatePhone;
      await user.save();
    }
  }

  await application.save();

  res.json({
    message: `Application ${status} successfully`,
    application,
  });
});

// Add to sellerController.js
const getMyApplication = asyncHandler(async (req, res) => {
  const application = await SellerApplication.findOne({ user: req.user._id });
  if (!application) {
    res.status(404).json({ message: "No application found" });
    return;
  }
  res.json(application);
});
// And add route: router.get("/my-application", protect, getMyApplication);

export { registerSeller, getSellerApplications, reviewSellerApplication,  getMyApplication};