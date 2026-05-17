  import asyncHandler from "express-async-handler";
  import House from "../models/houseModel.js";
  import https from "https";

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
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};

    // By default show only published
    filter.status = status || "published";

    if (listingType) filter.listingType = listingType;
    if (state) filter.state = state;
    if (lga) filter.lga = lga;
    if (propertyType) filter.propertyType = propertyType;
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const houses = await House.find(filter)
      .populate("user", "name email phone")
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

    // Whitelist allowed updates (no file changes via this endpoint for simplicity)
    const allowedFields = [
      "title", "description", "propertyType", "price",
      "bedrooms", "bathrooms", "size", "yearBuilt",
      "furnishing", "leaseTerm", "securityDeposit", "serviceCharge",
      "availability", "utilityTerms", "petPolicy",
      "ownershipType", "state", "lga", "address",
      "features", "otherFeatures",
      "contactName", "contactEmail", "contactPhone", "contactAlternatePhone",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        house[field] = req.body[field];
      }
    });

    // If features is a string, parse it to array
    if (req.body.features && typeof req.body.features === "string") {
      house.features = JSON.parse(req.body.features);
    }

    const updatedHouse = await house.save();

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
  };