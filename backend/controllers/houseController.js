  import asyncHandler from "express-async-handler";
  import House from "../models/houseModel.js";
  import https from "https";
import User from "../models/userModel.js";

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
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  // Base filter – only published listings by default
  const filter = { status: status || "published" };

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

  // 🔥 EXCLUDE HOUSES FROM SUSPENDED SELLERS
  const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
  if (suspendedSellers.length) {
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

    // Only the listing owner can update
    if (house.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this listing");
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
      // If field is NOT in the request body at all, don't touch it
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
        
        // Filter out removed images
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
      
      // Combine with existing images (or the filtered ones)
      const existingImages = updateData.images || house.images;
      updateData.images = [...existingImages, ...newImages];
    }

    // Use findByIdAndUpdate to ensure atomic update
    const updatedHouse = await House.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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

    if (house.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this listing");
    }

    // Optional: also delete Cloudinary images here using public_id
    // For brevity we skip actual Cloudinary deletion; you can add later.

    await house.remove();

    res.json({ success: true, message: "House deleted" });
  });

  // -------------------------------------------------------------------
  //  GET – /api/houses/my-listings (seller’s own listings)
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

    // Only owner or admin can change status
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
    const { houseId, amount, email } = req.body;

    if (!houseId || !amount || !email) {
      res.status(400);
      throw new Error("Please provide houseId, amount, and email");
    }

    const house = await House.findById(houseId);
    if (!house) {
      res.status(404);
      throw new Error("House not found");
    }

    const params = JSON.stringify({
      email,
      amount: Math.round(Number(amount) * 100), // Paystack works in kobo
      metadata: {
        houseId,
        buyerUserId: req.user ? req.user._id : null,
      },
    });

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
        const response = JSON.parse(data);
        if (response.status) {
          res.json({
            success: true,
            authorization_url: response.data.authorization_url,
            reference: response.data.reference,
          });
        } else {
          res.status(400).json({ success: false, message: response.message });
        }
      });
    });

    paystackReq.on("error", (error) => {
      res.status(500).json({ success: false, message: error.message });
    });

    paystackReq.write(params);
    paystackReq.end();
  });

  // backend/controllers/houseController.js

  // @desc    Get all unique states and their LGAs from published houses
  // @route   GET /api/houses/locations
  // @access  Public
  const getLocations = asyncHandler(async (req, res) => {
    try {
      // Get all published houses (excluding suspended sellers)
      const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
      
      const filter = { status: "published" };
      if (suspendedSellers.length) {
        filter.user = { $nin: suspendedSellers };
      }
      
      const houses = await House.find(filter, 'state lga');
      
      // Create a map of unique states and their LGAs
      const statesMap = new Map();
      
      houses.forEach(house => {
        if (house.state && house.lga) {
          if (!statesMap.has(house.state)) {
            statesMap.set(house.state, new Set());
          }
          statesMap.get(house.state).add(house.lga);
        }
      });
      
      // Convert to the required format
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

  // @desc    Search houses with filters (enhanced for homepage)
  // @route   GET /api/houses/search
  // @access  Public
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
    
    // Base filter - only published listings
    const filter = { status: "published" };
    
    // Apply filters
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
    
    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice && !isNaN(parseFloat(maxPrice))) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Exclude houses from suspended sellers
    const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
    if (suspendedSellers.length) {
      filter.user = { $nin: suspendedSellers };
    }
    
    // Fetch houses with seller details
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

  // @desc    Get featured/trending houses for homepage
  // @route   GET /api/houses/featured
  // @access  Public
  const getFeaturedHouses = asyncHandler(async (req, res) => {
    const { listingType, limit = 6 } = req.query;
    
    const filter = { status: "published" };
    
    if (listingType && ['rent', 'sale'].includes(listingType)) {
      filter.listingType = listingType;
    }
    
    // Exclude suspended sellers
    const suspendedSellers = await User.find({ isSuspended: true, role: "seller" }).distinct("_id");
    if (suspendedSellers.length) {
      filter.user = { $nin: suspendedSellers };
    }
    
    // Get newest listings as featured (you can modify this logic)
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
      .get(options, (paystackRes) => {
        let data = "";
        paystackRes.on("data", (chunk) => (data += chunk));
        paystackRes.on("end", () => {
          const response = JSON.parse(data);
          if (response.status && response.data.status === "success") {
            // Payment successful – you can update House status or create an order record here
            res.json({ success: true, data: response.data });
          } else {
            res
              .status(400)
              .json({
                success: false,
                message: "Payment verification failed",
                data: response.data,
              });
          }
        });
      })
      .on("error", (error) => {
        res.status(500).json({ success: false, message: error.message });
      });
  });

  // -------------------------------------------------------------------
  //  READ – GET /api/houses/seller/:sellerId (public, get all listings by a seller)
  // -------------------------------------------------------------------
  const getSellerListings = asyncHandler(async (req, res) => {
    const { sellerId } = req.params;
    const { status, listingType, page = 1, limit = 12 } = req.query;

    // Build filter
    const filter = { user: sellerId };
    
    // Optional filters
    if (status) filter.status = status;
    if (listingType) filter.listingType = listingType;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch houses with seller details
    const houses = await House.find(filter)
      .populate("user", "name email phone profile verificationBadge sellerType sellerVerified isSuspended")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await House.countDocuments(filter);

    // Get stats for the seller
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
    getSellerListings,  // Add this
  };