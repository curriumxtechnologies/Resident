// scripts/seedNewHouses.cjs
// Run with: node scripts/seedNewHouses.cjs

const BASE_URL = "http://localhost:3000/api";
const EMAIL = "homes@rezidenthomes.com";

const readline = require("readline");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function login() {
  console.log(`\n📧 Sending OTP to ${EMAIL}...`);
  
  const response = await fetch(`${BASE_URL}/auth/signin/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }
  
  console.log("✅ OTP sent! Check your email.");
  
  const otp = await askQuestion("Enter the 6-digit OTP from your email: ");
  
  const verifyRes = await fetch(`${BASE_URL}/auth/signin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: data.userId, otp: otp.trim() }),
  });
  
  const verifyData = await verifyRes.json();
  
  if (!verifyRes.ok) {
    throw new Error(verifyData.message || "Failed to verify OTP");
  }
  
  console.log("✅ Login successful!\n");
  return verifyData.token;
}

const houses = [
  {
    // House 1: RENT - Studio Apartment in D-Line
    listingType: "rent",
    title: "Fully Serviced Studio Apartment in D-Line",
    description: "Modern studio apartment in the heart of D-Line, perfect for young professionals. Features an open-plan layout with premium finishes, built-in wardrobes, and a sleek kitchenette. Building amenities include a rooftop lounge, gym, and laundry service. Walking distance to Port Harcourt Mall and major bus stops.",
    propertyType: "Studio Apartment",
    price: 110,
    bedrooms: 1,
    bathrooms: 1,
    size: "65",
    yearBuilt: 2024,
    furnishing: "Furnished",
    leaseTerm: "6 Months",
    securityDeposit: "1 month rent",
    serviceCharge: "₦30,000/month",
    availability: "Available immediately",
    utilityTerms: "Prepaid meter",
    petPolicy: "Not allowed",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "5 Bende Street, D-Line, Port Harcourt, Rivers State",
    features: ["Rooftop Lounge", "Gym", "Laundry Service", "CCTV", "Elevator", "24/7 Power", "Intercom", "Furnished"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&fm=jpg"
    ]
  },
  {
    // House 2: RENT - Duplex in Old GRA
    listingType: "rent",
    title: "Luxury 5-Bedroom Duplex in Old GRA",
    description: "Exceptional 5-bedroom duplex in the serene Old GRA neighborhood. This grand residence features a double-volume living room, formal dining area, home office, and a modern kitchen with breakfast nook. The master suite includes a walk-in closet and spa-like bathroom. Staff quarters and mature garden complete this premium offering.",
    propertyType: "Duplex",
    price: 110,
    bedrooms: 5,
    bathrooms: 5,
    size: "450",
    yearBuilt: 2021,
    furnishing: "Unfurnished",
    leaseTerm: "2 Years",
    securityDeposit: "2 months rent",
    serviceCharge: "Included in rent",
    availability: "Available from August 2026",
    utilityTerms: "Not included",
    petPolicy: "Allowed",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "23 Evo Road, Old GRA, Port Harcourt, Rivers State",
    features: ["Staff Quarters", "Home Office", "Mature Garden", "Double Living Room", "Walk-in Closet", "Security House", "Water Fountain", "CCTV"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&fm=jpg"
    ]
  },
  {
    // House 3: SALE - Bungalow in Ada George
    listingType: "sale",
    title: "Newly Built 3-Bedroom Bungalow in Ada George",
    description: "Brand new contemporary bungalow in the fast-developing Ada George area. Sitting on a 500sqm plot with room for expansion, this home features an open-plan living area, modern kitchen with island, 3 spacious bedrooms with en-suites, and a lovely veranda. Perfect for first-time home buyers or investors looking for growth potential.",
    propertyType: "Bungalow",
    price: 110,
    bedrooms: 3,
    bathrooms: 3,
    size: "200",
    yearBuilt: 2025,
    furnishing: "Semi-Furnished",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "17 Mgbuoba Road, Ada George, Port Harcourt, Rivers State",
    features: ["New Building", "Open Plan", "Modern Kitchen", "En-suite Rooms", "Veranda", "Large Plot", "Paved Compound", "Borehole"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&fm=jpg"
    ]
  },
  {
    // House 4: SALE - Townhouse in GRA Phase 1
    listingType: "sale",
    title: "Elegant 4-Bedroom Townhouse in GRA Phase 1",
    description: "Sophisticated 4-bedroom townhouse in a secure gated community in GRA Phase 1. This tri-level residence offers refined living with a ground-floor guest suite, open-plan second floor with living/dining/kitchen, and three bedrooms on the top floor including a luxurious master suite. Community amenities include a pool, tennis court, and children's playground.",
    propertyType: "Townhouse",
    price: 110,
    bedrooms: 4,
    bathrooms: 4,
    size: "280",
    yearBuilt: 2024,
    furnishing: "Furnished",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "Townhouse 12, Riviera Gardens Estate, GRA Phase 1, Port Harcourt, Rivers State",
    features: ["Gated Community", "Swimming Pool", "Tennis Court", "Guest Suite", "Tri-level", "Smart Home", "Underground Parking", "Children's Playground"],
    images: [
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1556909174-54557c7e4fb7?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&fm=jpg"
    ]
  }
];

async function downloadImageBuffer(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let contentType = response.headers.get("content-type") || "image/jpeg";
    
    // Force JPEG content type regardless of what server returns
    const outputType = "image/jpeg";
    const extension = ".jpg";
    
    // Log if the server returned something other than JPEG
    if (!contentType.includes("jpeg") && !contentType.includes("jpg")) {
      console.log(`  ⚠️ Server returned ${contentType}, forcing JPEG format`);
    }
    
    const filename = `house-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;
    
    return {
      buffer: buffer,
      name: filename,
      type: outputType
    };
  } catch (err) {
    console.error("  ⚠️ Failed to download:", imageUrl.substring(0, 50) + "...");
    console.error(`     Error: ${err.message}`);
    return null;
  }
}

async function createHouse(houseData, token) {
  const boundary = "----FormBoundary" + Math.random().toString(36).substring(2);
  const CRLF = "\r\n";
  const parts = [];
  
  const fields = { ...houseData };
  delete fields.images;
  delete fields.features;
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      parts.push(Buffer.from(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}${value}${CRLF}`
      ));
    }
  });
  
  if (houseData.features) {
    houseData.features.forEach((f, i) => {
      parts.push(Buffer.from(
        `--${boundary}${CRLF}Content-Disposition: form-data; name="features[${i}]"${CRLF}${CRLF}${f}${CRLF}`
      ));
    });
  }
  
  console.log("  📥 Downloading images...");
  const imageBuffers = [];
  for (const imageUrl of houseData.images) {
    const img = await downloadImageBuffer(imageUrl);
    if (img) imageBuffers.push(img);
  }
  
  if (imageBuffers.length === 0) {
    throw new Error("No images could be downloaded");
  }
  
  console.log(`  ✓ Downloaded ${imageBuffers.length} images`);
  
  for (const img of imageBuffers) {
    parts.push(Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="images"; filename="${img.name}"${CRLF}Content-Type: ${img.type}${CRLF}${CRLF}`
    ));
    parts.push(img.buffer);
    parts.push(Buffer.from(CRLF));
  }
  
  const docImg = imageBuffers[0];
  
  if (houseData.listingType === "rent") {
    parts.push(Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="proofOfOwnership"; filename="proof-${docImg.name}"${CRLF}Content-Type: ${docImg.type}${CRLF}${CRLF}`
    ));
    parts.push(docImg.buffer);
    parts.push(Buffer.from(CRLF));
    console.log("  📄 Added proof of ownership");
  }
  
  if (houseData.listingType === "sale") {
    parts.push(Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="titleDocument"; filename="title-${docImg.name}"${CRLF}Content-Type: ${docImg.type}${CRLF}${CRLF}`
    ));
    parts.push(docImg.buffer);
    parts.push(Buffer.from(CRLF));
    
    const surveyImg = imageBuffers.length > 1 ? imageBuffers[1] : imageBuffers[0];
    parts.push(Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="surveyPlan"; filename="survey-${surveyImg.name}"${CRLF}Content-Type: ${surveyImg.type}${CRLF}${CRLF}`
    ));
    parts.push(surveyImg.buffer);
    parts.push(Buffer.from(CRLF));
    console.log("  📄 Added title document & survey plan");
  }
  
  parts.push(Buffer.from(`--${boundary}--${CRLF}`));
  
  const finalBody = Buffer.concat(parts);
  
  console.log("  📤 Uploading to server...");
  const response = await fetch(`${BASE_URL}/houses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body: finalBody,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to create house");
  }
  
  return data;
}

async function seed() {
  console.log("\n🏠 Rezident Homes - New Houses Seeder\n");
  console.log(`Using email: ${EMAIL}\n`);
  
  let token;
  try {
    token = await login();
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    process.exit(1);
  }

  const results = [];
  
  for (let i = 0; i < houses.length; i++) {
    const house = houses[i];
    console.log(`\n[${i + 1}/${houses.length}] Creating: ${house.listingType.toUpperCase()} - ${house.title}...`);
    
    try {
      const result = await createHouse(house, token);
      results.push(result);
      console.log(`✅ Created! ID: ${result.house?._id}`);
      console.log(`   ${house.listingType === "rent" ? "RENT" : "SALE"} - ₦${house.price.toLocaleString()}`);
      console.log(`   Images: ${result.house?.images?.length || 0} uploaded to Cloudinary`);
      
      if (i < houses.length - 1) {
        console.log("   ⏳ Waiting 2 seconds before next house...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
      results.push({ error: err.message, title: house.title });
    }
  }

  console.log("\n📊 Seeding Summary:");
  console.log("═══════════════════");
  console.log(`Total houses: ${houses.length}`);
  console.log(`Successfully created: ${results.filter(r => !r.error).length}`);
  console.log(`Failed: ${results.filter(r => r.error).length}`);
  
  if (results.some(r => r.error)) {
    console.log("\n❌ Failed listings:");
    results.filter(r => r.error).forEach(r => {
      console.log(`   - ${r.title}: ${r.error}`);
    });
  }

  console.log("\n🎉 Done!\n");
}

seed().catch(console.error);