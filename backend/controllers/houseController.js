import asyncHandler from "express-async-handler";
import House from "../models/houseModel.js";
import https from "https";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import Receipt from "../models/receiptModel.js";
import { sendReceiptEmail } from "../services/emailService.js";
import PDFDocument from "pdfkit";

// -------------------------------------------------------------------
//  CREATE – POST /api/houses
// -------------------------------------------------------------------
const createHouseListing = asyncHandler(async (req, res) => {
  const {
    listingType,
    title,
    description,
    propertyType,
    price,
    bedrooms,
    bathrooms,
    size,
    yearBuilt,
    furnishing,
    leaseTerm,
    securityDeposit,
    serviceCharge,
    availability,
    utilityTerms,
    petPolicy,
    ownershipType,
    state,
    lga,
    address,
    features,
    otherFeatures,
    contactName,
    contactEmail,
    contactPhone,
    contactAlternatePhone,
  } = req.body;

  // Seller check
  if (req.user.role !== "seller") {
    res.status(403);
    throw new Error("Only approved sellers can create listings");
  }

  // Basic required fields
  if (!listingType || !["rent", "sale"].includes(listingType) || !title || !description || !propertyType || !price || !state || !lga || !address) {
    res.status(400);
    throw new Error("Missing required fields (listingType, title, description, propertyType, price, state, lga, address)");
  }

  const isRent = listingType === "rent";
  const isSale = listingType === "sale";

  // File validation
  if (!req.files?.images || req.files.images.length === 0) {
    res.status(400);
    throw new Error("At least one property image is required");
  }
  if (isRent && !req.files?.proofOfOwnership) {
    res.status(400);
    throw new Error("Proof of ownership is required for rent listings");
  }
  if (isSale && !req.files?.titleDocument) {
    res.status(400);
    throw new Error("Title document is required for sale listings");
  }

  const houseData = {
    user: req.user._id,
    listingType,
    title,
    description,
    propertyType,
    price: Number(price),
    bedrooms: bedrooms ? Number(bedrooms) : undefined,
    bathrooms: bathrooms ? Number(bathrooms) : undefined,
    size,
    yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
    furnishing: isRent ? furnishing : undefined,
    leaseTerm: isRent ? leaseTerm : undefined,
    securityDeposit: isRent ? securityDeposit : undefined,
    serviceCharge: isRent ? serviceCharge : undefined,
    availability: isRent ? availability : undefined,
    utilityTerms: isRent ? utilityTerms : undefined,
    petPolicy: isRent ? petPolicy : undefined,
    ownershipType: isSale ? ownershipType : undefined,
    state,
    lga,
    address,
    features: features ? (Array.isArray(features) ? features : JSON.parse(features)) : [],
    otherFeatures,
    contactName: contactName || req.user.name,
    contactEmail: contactEmail || req.user.email,
    contactPhone: contactPhone || req.user.phone,
    contactAlternatePhone: contactAlternatePhone || req.user.alternatePhone || "",
  };

  // Images
  houseData.images = req.files.images.map((file) => ({
    url: file.path,
    public_id: file.filename,
  }));

  // Documents
  if (isRent && req.files.proofOfOwnership) {
    houseData.proofOfOwnership = {
      url: req.files.proofOfOwnership[0].path,
      public_id: req.files.proofOfOwnership[0].filename,
    };
  }
  if (isSale && req.files.titleDocument) {
    houseData.titleDocument = {
      url: req.files.titleDocument[0].path,
      public_id: req.files.titleDocument[0].filename,
    };
    if (req.files.surveyPlan) {
      houseData.surveyPlan = {
        url: req.files.surveyPlan[0].path,
        public_id: req.files.surveyPlan[0].filename,
      };
    }
  }

  const house = await House.create(houseData);

  res.status(201).json({
    success: true,
    message: "House listed successfully",
    house,
  });
});

// -------------------------------------------------------------------
//  READ – GET /api/houses (public, with filters)
// -------------------------------------------------------------------
const getHouses = asyncHandler(async (req, res) => {
  const {
    listingType,
    state,
    lga,
    propertyType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    status,
    search,
    user, // ✅ ADDED: filter by specific seller/user
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  // ✅ FIX: Only filter by status if explicitly provided
  const filter = {};
  
  // ✅ ADDED: Filter by user/seller ID if provided
  if (user) {
    filter.user = user;
  }
  
  // If status is provided, use it; otherwise show ALL statuses
  if (status) {
    filter.status = status;
  }
  // When no status is specified, filter.status is undefined
  // and MongoDB returns houses with ANY status

  // Apply filters
  if (listingType) filter.listingType = listingType;
  if (state) filter.state = state;
  if (lga) filter.lga = lga;
  if (propertyType) filter.propertyType = propertyType;
  if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
  if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Text search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  // EXCLUDE HOUSES FROM SUSPENDED SELLERS
  const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
  if (suspendedSellers.length) {
    // If filtering by specific user and that user is suspended, return empty
    if (filter.user && suspendedSellers.some(id => id.toString() === filter.user.toString())) {
      return res.json({
        success: true,
        count: 0,
        total: 0,
        page: Number(page),
        pages: 0,
        houses: [],
      });
    }
    filter.user = { $nin: suspendedSellers };
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Fetch houses with FULL seller details (logo, badge, seller type, etc.)
  const houses = await House.find(filter)
    .populate("user", "name email phone profile verificationBadge sellerType sellerVerified isSuspended")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await House.countDocuments(filter);

  res.json({
    success: true,
    count: houses.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    houses,
  });
});

// -------------------------------------------------------------------
//  READ – GET /api/houses/:id (single listing)
// -------------------------------------------------------------------
const getHouseById = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id).populate(
    "user",
    "name email phone"
  );

  if (!house) {
    res.status(404);
    throw new Error("House not found");
  }

  res.json({ success: true, house });
});

// -------------------------------------------------------------------
//  UPDATE – PUT /api/houses/:id (owner only)
// -------------------------------------------------------------------
const updateHouse = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    res.status(404);
    throw new Error("House not found");
  }

  // ✅ NEW CODE - Allow owner OR admin to delete
  if (
    house.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this listing");
  }

  // Build update object
  const updateData = {};

  // Handle numeric fields - ONLY update if explicitly provided and not empty
  const numericFields = ["price", "bedrooms", "bathrooms", "size", "yearBuilt"];
  numericFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
      const numValue = Number(req.body[field]);
      if (!isNaN(numValue)) {
        updateData[field] = numValue;
      }
    }
  });

  // Handle text fields
  const textFields = [
    "title", "description", "propertyType",
    "furnishing", "leaseTerm", "securityDeposit", "serviceCharge",
    "availability", "utilityTerms", "petPolicy",
    "ownershipType", "state", "lga", "address",
    "status", "listingType",
    "contactName", "contactEmail", "contactPhone", "contactAlternatePhone",
  ];
  
  textFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== "") {
      updateData[field] = req.body[field];
    }
  });

  // Handle features
  if (req.body.features) {
    try {
      const parsedFeatures = JSON.parse(req.body.features);
      if (Array.isArray(parsedFeatures)) {
        updateData.features = parsedFeatures.filter(f => f && f.trim() !== "");
      }
    } catch (e) {
      const features = [];
      Object.keys(req.body).forEach(key => {
        if (key.startsWith("features[") && key.endsWith("]")) {
          const value = req.body[key];
          if (value && value.trim() !== "") {
            features.push(value.trim());
          }
        }
      });
      if (features.length > 0) {
        updateData.features = features;
      }
    }
  }

  // Handle removed images
  if (req.body.removedImages) {
    try {
      const removedIds = JSON.parse(req.body.removedImages);
      
      for (const publicId of removedIds) {
        try {
          const cloudinary = (await import("cloudinary")).v2;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", publicId);
        }
      }
      
      const remainingImages = house.images.filter(img => {
        const imgId = img.public_id || img._id?.toString();
        return !removedIds.includes(imgId);
      });
      updateData.images = remainingImages;
    } catch (err) {
      console.error("Error processing removedImages:", err);
    }
  }

  // Handle new images
  if (req.files?.images && req.files.images.length > 0) {
    const newImages = req.files.images.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
    
    const existingImages = updateData.images || house.images;
    updateData.images = [...existingImages, ...newImages];
  }

  const updatedHouse = await House.findByIdAndUpdate(
    req.params.id,
    updateData,
    { returnDocument: 'after', runValidators: true }
  );

  res.json({
    success: true,
    message: "House updated successfully",
    house: updatedHouse,
  });
});

// -------------------------------------------------------------------
//  DELETE – DELETE /api/houses/:id (owner only)
// -------------------------------------------------------------------
const deleteHouse = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    res.status(404);
    throw new Error("House not found");
  }

  // ✅ Allow owner OR admin
  if (
    house.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this listing");
  }

  // Delete images from Cloudinary
  if (house.images && house.images.length > 0) {
    const cloudinary = (await import("cloudinary")).v2;
    for (const image of house.images) {
      if (image.public_id) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (err) {
          console.warn("Failed to delete image from Cloudinary:", image.public_id);
        }
      }
    }
  }

  // Delete documents from Cloudinary
  const docFields = ["proofOfOwnership", "titleDocument", "surveyPlan"];
  for (const field of docFields) {
    if (house[field] && house[field].public_id) {
      try {
        const cloudinary = (await import("cloudinary")).v2;
        await cloudinary.uploader.destroy(house[field].public_id);
      } catch (err) {
        console.warn(`Failed to delete ${field} from Cloudinary`);
      }
    }
  }

  await House.deleteOne({ _id: house._id });

  res.json({ success: true, message: "House deleted" });
});

// -------------------------------------------------------------------
//  GET – /api/houses/my-listings (seller's own listings)
// -------------------------------------------------------------------
const getMyListings = asyncHandler(async (req, res) => {
  const houses = await House.find({ user: req.user._id }).sort("-createdAt");

  res.json({ success: true, count: houses.length, houses });
});

// -------------------------------------------------------------------
//  PATCH – /api/houses/:id/status (owner or admin toggle)
// -------------------------------------------------------------------
const toggleStatus = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    res.status(404);
    throw new Error("House not found");
  }

  if (
    house.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { status } = req.body;
  if (!["published", "draft", "inactive", "sold", "rented"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  house.status = status;
  await house.save();

  res.json({ success: true, message: `Status updated to ${status}`, house });
});

// -------------------------------------------------------------------
//  PAYSTACK PAYMENT INITIALIZATION (for rent / buy)
// -------------------------------------------------------------------
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const initiatePayment = asyncHandler(async (req, res) => {
  const { houseId, amount, email, metadata } = req.body;

  if (!houseId || !amount || !email) {
    res.status(400);
    throw new Error("Please provide houseId, amount, and email");
  }

  const house = await House.findById(houseId);
  if (!house) {
    res.status(404);
    throw new Error("House not found");
  }

  const amountInKobo = Math.round(Number(amount) * 100);
  
  const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5501/frontend";
  const callbackUrl = `${frontendUrl}/payment-callback.html`;

  const payload = {
    email,
    amount: amountInKobo,
    metadata: {
      houseId: houseId.toString(),
      buyerUserId: req.user ? req.user._id.toString() : null,
      buyerEmail: email,
      buyerName: metadata?.buyerName || req.user?.name || "Guest Buyer",  // ✅ Get buyer name
      paymentPlan: metadata?.paymentPlan || "100%",
      fullPrice: metadata?.fullPrice || house.price,
      propertyTitle: metadata?.propertyTitle || house.title,
    },
    callback_url: callbackUrl,
  };

  console.log("🔍 Sending to Paystack:", JSON.stringify(payload, null, 2));

  const params = JSON.stringify(payload);

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  const paystackReq = https.request(options, (paystackRes) => {
    let data = "";
    paystackRes.on("data", (chunk) => (data += chunk));
    paystackRes.on("end", () => {
      console.log("🔍 Paystack Response:", data);
      
      try {
        const response = JSON.parse(data);
        
        if (response.status) {
          console.log("✅ Payment initialized:", response.data.reference);
          res.json({
            success: true,
            authorization_url: response.data.authorization_url,
            reference: response.data.reference,
          });
        } else {
          console.error("❌ Paystack Error:", response.message);
          res.status(400).json({ 
            success: false, 
            message: response.message || "Failed to initialize payment" 
          });
        }
      } catch (parseErr) {
        console.error("❌ Failed to parse Paystack response:", parseErr);
        console.error("Raw response:", data);
        res.status(500).json({ 
          success: false, 
          message: "Invalid response from payment provider" 
        });
      }
    });
  });

  paystackReq.on("error", (error) => {
    console.error("❌ Paystack Request Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to connect to payment provider" 
    });
  });

  paystackReq.write(params);
  paystackReq.end();
});

// -------------------------------------------------------------------
//  GET LOCATIONS – /api/houses/locations
// -------------------------------------------------------------------
const getLocations = asyncHandler(async (req, res) => {
  try {
    const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
    
    const filter = { status: "published" };
    if (suspendedSellers.length) {
      filter.user = { $nin: suspendedSellers };
    }
    
    const houses = await House.find(filter, 'state lga');
    
    const statesMap = new Map();
    
    houses.forEach(house => {
      if (house.state && house.lga) {
        if (!statesMap.has(house.state)) {
          statesMap.set(house.state, new Set());
        }
        statesMap.get(house.state).add(house.lga);
      }
    });
    
    const states = Array.from(statesMap.keys()).sort();
    const lgAs = {};
    
    statesMap.forEach((lgas, state) => {
      lgAs[state] = Array.from(lgas).sort();
    });
    
    res.status(200).json({
      success: true,
      data: { states, lgAs }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
});

// -------------------------------------------------------------------
//  SEARCH HOUSES – /api/houses/search
// -------------------------------------------------------------------
const searchHouses = asyncHandler(async (req, res) => {
  const {
    state,
    lga,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    limit = 9,
  } = req.query;
  
  const filter = { status: "published" };
  
  if (listingType && ['rent', 'sale'].includes(listingType)) {
    filter.listingType = listingType;
  }
  
  if (state && state !== '') {
    filter.state = { $regex: new RegExp(`^${state}$`, 'i') };
  }
  
  if (lga && lga !== '') {
    filter.lga = { $regex: new RegExp(`^${lga}$`, 'i') };
  }
  
  if (bedrooms && !isNaN(parseInt(bedrooms))) {
    filter.bedrooms = { $gte: parseInt(bedrooms) };
  }
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !isNaN(parseFloat(minPrice))) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice && !isNaN(parseFloat(maxPrice))) filter.price.$lte = parseFloat(maxPrice);
  }
  
  const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
  if (suspendedSellers.length) {
    filter.user = { $nin: suspendedSellers };
  }
  
  const houses = await House.find(filter)
    .populate("user", "name email phone profile verificationBadge sellerType sellerVerified isSuspended")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    count: houses.length,
    data: houses
  });
});

// -------------------------------------------------------------------
//  GET FEATURED – /api/houses/featured
// -------------------------------------------------------------------
const getFeaturedHouses = asyncHandler(async (req, res) => {
  const { listingType, limit = 6 } = req.query;
  
  const filter = { status: "published" };
  
  if (listingType && ['rent', 'sale'].includes(listingType)) {
    filter.listingType = listingType;
  }
  
  const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
  if (suspendedSellers.length) {
    filter.user = { $nin: suspendedSellers };
  }
  
  const houses = await House.find(filter)
    .populate("user", "name email phone profile verificationBadge sellerType sellerVerified")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: houses
  });
});

// -------------------------------------------------------------------
//  PAYSTACK VERIFY PAYMENT (after callback)
// -------------------------------------------------------------------
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    res.status(400);
    throw new Error("Transaction reference is required");
  }

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
    },
  };

  https
    .get(options, async (paystackRes) => {
      let data = "";
      paystackRes.on("data", (chunk) => (data += chunk));
      paystackRes.on("end", async () => {
        try {
          const response = JSON.parse(data);
          
          if (response.status && response.data.status === "success") {
            const metadata = response.data.metadata;
            const house = await House.findById(metadata.houseId);
            
            if (house) {
              // 🔥 FIX: Try to find user from metadata email
              let user = req.user;
              
              if (!user && metadata.buyerEmail) {
                // Find user by email from metadata
                user = await User.findOne({ email: metadata.buyerEmail });
              }
              
              const paymentPlan = metadata.paymentPlan || "100%";
              const fullPrice = metadata.fullPrice || house.price;
              const amountPaid = response.data.amount / 100;
              const remainingBalance = fullPrice - amountPaid;

              // Check if transaction already exists
              let existingTransaction = await Transaction.findOne({ reference: reference });
              
              let transaction = existingTransaction;
              let receipt = null;
              
              if (!existingTransaction && user) {
                // Create transaction record
                transaction = await Transaction.create({
                  user: user._id,
                  house: house._id,
                  type: house.listingType === "sale" ? "purchase" : "rental",
                  amount: amountPaid,
                  paymentPlan: paymentPlan,
                  remainingBalance: remainingBalance > 0 ? remainingBalance : 0,
                  fullPrice: fullPrice,
                  reference: reference,
                  status: "completed",
                  paymentDate: new Date(),
                });

                // Generate receipt number
                const receiptNumber = `RZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

                // Create receipt record
                receipt = await Receipt.create({
                  user: user._id,
                  transaction: transaction._id,
                  house: house._id,
                  receiptNumber,
                  amount: amountPaid,
                  paymentPlan,
                  remainingBalance: remainingBalance > 0 ? remainingBalance : 0,
                  fullPrice,
                  paymentStatus: "completed",
                  paymentReference: reference,
                  paystackReference: response.data.reference,
                  propertyTitle: house.title,
                  propertyLocation: `${house.lga}, ${house.state}`,
                  buyerName: user.name,
                  buyerEmail: user.email,
                });

                // Send receipt email
                try {
                  await sendReceiptEmail(user.email, {
                    receiptNumber,
                    buyerName: user.name,
                    propertyTitle: house.title,
                    propertyLocation: `${house.lga}, ${house.state}`,
                    amountPaid,
                    paymentPlan,
                    remainingBalance,
                    fullPrice,
                    date: new Date(),
                  });
                } catch (emailErr) {
                  console.error("Failed to send receipt email:", emailErr);
                }

                // Update house status if full payment
                if (paymentPlan === "100%") {
                  house.status = house.listingType === "sale" ? "sold" : "rented";
                  await house.save();
                }
              } else if (existingTransaction) {
                // Get existing receipt
                receipt = await Receipt.findOne({ transaction: existingTransaction._id });
              }

              res.json({
                success: true,
                data: {
                  transaction,
                  receipt,
                  paymentPlan,
                  remainingBalance,
                  fullPrice,
                },
              });
            } else {
              res.status(404).json({
                success: false,
                message: "Property not found",
              });
            }
          } else {
            res.status(400).json({
              success: false,
              message: "Payment verification failed",
              data: response.data,
            });
          }
        } catch (error) {
          console.error("Verification processing error:", error);
          res.status(500).json({ success: false, message: error.message });
        }
      });
    })
    .on("error", (error) => {
      console.error("Paystack verification error:", error);
      res.status(500).json({ success: false, message: error.message });
    });
});

// -------------------------------------------------------------------
//  DOWNLOAD RECEIPT – GET /api/houses/receipt/:receiptId/download
// -------------------------------------------------------------------
const downloadReceipt = asyncHandler(async (req, res) => {
  const { receiptId } = req.params;
  
  const receipt = await Receipt.findById(receiptId)
    .populate("house", "title address lga state")
    .populate("user", "name email");

  if (!receipt) {
    res.status(404);
    throw new Error("Receipt not found");
  }

  // Only the buyer or admin can download
  if (receipt.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Generate PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
    res.send(pdfBuffer);
  });

  // PDF Content
  doc.fontSize(24).font("Helvetica-Bold").text("REZIDENT HOMES", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Luxury Real Estate", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text("PAYMENT RECEIPT", { align: "center" });
  doc.moveDown();

  // Receipt details
  doc.fontSize(8).font("Helvetica");
  doc.text(`Receipt No: ${receipt.receiptNumber}`);
  doc.text(`Date: ${new Date(receipt.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}`);
  doc.text(`Payment Reference: ${receipt.paymentReference}`);
  doc.moveDown();

  // Buyer & Property Info
  doc.fontSize(10).font("Helvetica-Bold").text("Buyer Information");
  doc.fontSize(8).font("Helvetica");
  doc.text(`Name: ${receipt.buyerName || receipt.user.name}`);
  doc.text(`Email: ${receipt.buyerEmail || receipt.user.email}`);
  doc.moveDown();

  doc.fontSize(10).font("Helvetica-Bold").text("Property Details");
  doc.fontSize(8).font("Helvetica");
  doc.text(`Property: ${receipt.propertyTitle}`);
  doc.text(`Location: ${receipt.propertyLocation}`);
  doc.moveDown();

  // Payment Details
  doc.fontSize(10).font("Helvetica-Bold").text("Payment Summary");
  doc.fontSize(8).font("Helvetica");
  doc.text(`Payment Plan: ${receipt.paymentPlan}`);
  doc.text(`Full Price: ₦${receipt.fullPrice.toLocaleString()}`);
  doc.text(`Amount Paid: ₦${receipt.amount.toLocaleString()}`);
  
  if (receipt.remainingBalance > 0) {
    doc.fontSize(10).font("Helvetica-Bold").fillColor("red");
    doc.text(`Remaining Balance: ₦${receipt.remainingBalance.toLocaleString()} (${Math.round((receipt.remainingBalance / receipt.fullPrice) * 100)}% remaining)`);
    doc.fillColor("black");
  } else {
    doc.fontSize(10).font("Helvetica-Bold").fillColor("green");
    doc.text("FULL PAYMENT MADE");
    doc.fillColor("black");
  }
  
  doc.moveDown();
  doc.fontSize(8).font("Helvetica").fillColor("gray");
  doc.text("This is a computer-generated receipt and does not require a signature.", { align: "center" });
  doc.text("For inquiries, contact: support@rezidenthomes.com | +234 800 000 0000", { align: "center" });

  doc.end();
});

// -------------------------------------------------------------------
//  GET USER'S RECEIPTS – GET /api/houses/my-receipts
// -------------------------------------------------------------------
const getMyReceipts = asyncHandler(async (req, res) => {
  const receipts = await Receipt.find({ user: req.user._id })
    .populate("house", "title images")
    .sort("-createdAt");

  res.json({
    success: true,
    count: receipts.length,
    receipts,
  });
});

// -------------------------------------------------------------------
//  GET SELLER LISTINGS – /api/houses/seller/:sellerId
// -------------------------------------------------------------------
const getSellerListings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status, listingType, page = 1, limit = 12 } = req.query;

  const filter = { user: sellerId };
  
  if (status) filter.status = status;
  if (listingType) filter.listingType = listingType;

  const skip = (Number(page) - 1) * Number(limit);

  const houses = await House.find(filter)
    .populate("user", "name email phone profile verificationBadge sellerType sellerVerified isSuspended")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await House.countDocuments(filter);

  const stats = {
    totalListings: total,
    activeListings: await House.countDocuments({ user: sellerId, status: "published" }),
    soldListings: await House.countDocuments({ user: sellerId, status: { $in: ["sold", "rented"] } }),
    rentListings: await House.countDocuments({ user: sellerId, listingType: "rent" }),
    saleListings: await House.countDocuments({ user: sellerId, listingType: "sale" }),
  };

  res.json({
    success: true,
    count: houses.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    stats,
    houses,
  });
});

// -------------------------------------------------------------------
//  INQUIRY – POST /api/houses/:id/inquiry
// -------------------------------------------------------------------
const sendInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  const houseId = req.params.id;

  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("Name, email, and phone are required");
  }

  const house = await House.findById(houseId).populate("user", "name email phone");

  if (!house) {
    res.status(404);
    throw new Error("House not found");
  }

  const seller = house.user;

  if (!seller || !seller.email) {
    res.status(500);
    throw new Error("Seller email not found");
  }

  const inquiryData = {
    buyerName: name,
    buyerEmail: email,
    buyerPhone: phone,
    message: message || "No message provided",
    propertyTitle: house.title,
    propertyPrice: house.price,
    propertyLocation: `${house.lga}, ${house.state}`,
  };

  if (house.listingType === "rent") {
    const { sendRentInquiryEmail } = await import("../services/emailService.js");
    await sendRentInquiryEmail(seller.email, inquiryData);
  } else {
    const { sendSaleInquiryEmail } = await import("../services/emailService.js");
    await sendSaleInquiryEmail(seller.email, inquiryData);
  }

  res.json({
    success: true,
    message: "Inquiry sent successfully! The seller will contact you shortly.",
  });
});

// -------------------------------------------------------------------
//  GET USER'S HOUSES (bought/rented) – GET /api/houses/my-houses
// -------------------------------------------------------------------
const getMyHouses = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;

  const filter = { 
    user: req.user._id,
    status: "completed"
  };

  if (type && ["purchase", "rental"].includes(type)) {
    filter.type = type;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const transactions = await Transaction.find(filter)
    .populate({
      path: "house",
      populate: {
        path: "user",
        select: "name email phone profile verificationBadge"
      }
    })
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));

  const total = await Transaction.countDocuments(filter);

  const totalBought = await Transaction.countDocuments({
    user: req.user._id,
    type: "purchase",
    status: "completed"
  });

  const totalRented = await Transaction.countDocuments({
    user: req.user._id,
    type: "rental",
    status: "completed"
  });

  res.json({
    success: true,
    count: transactions.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    summary: {
      bought: totalBought,
      rented: totalRented,
      total: totalBought + totalRented
    },
    transactions,
  });
});

// -------------------------------------------------------------------
//  GET SINGLE TRANSACTION – GET /api/houses/transaction/:id
// -------------------------------------------------------------------
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate({
      path: "house",
      populate: {
        path: "user",
        select: "name email phone profile verificationBadge"
      }
    });

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  if (
    transaction.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json({
    success: true,
    transaction,
  });
});

export {
  createHouseListing,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse,
  getMyListings,
  toggleStatus,
  initiatePayment,
  verifyPayment,
  getLocations,
  searchHouses,
  getFeaturedHouses,
  getSellerListings,
  sendInquiry,
  getMyHouses,
  getTransactionById,
  downloadReceipt,
  getMyReceipts,
};