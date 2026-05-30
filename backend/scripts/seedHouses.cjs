// scripts/seedOneHouse.cjs
// Run with: node scripts/seedOneHouse.cjs

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

const house = {
  listingType: "rent",
  title: "Serviced 2-Bedroom Penthouse in Oniru Victoria Island",
  description: "Stunning penthouse in the prestigious Oniru area with panoramic views of the Atlantic Ocean and Lagos skyline. This serviced apartment features floor-to-ceiling windows, a private rooftop terrace with jacuzzi, and high-end furnishings throughout. Building offers 24/7 power, water treatment plant, and premium security. Walking distance to Landmark Beach and top restaurants.",
  propertyType: "Penthouse",
  price: 15000000,
  bedrooms: 2,
  bathrooms: 2,
  size: "220",
  yearBuilt: 2024,
  furnishing: "Furnished",
  leaseTerm: "1 Year",
  securityDeposit: "2 months rent (refundable)",
  serviceCharge: "₦1,200,000/year (includes cleaning & maintenance)",
  availability: "Available immediately",
  utilityTerms: "Included in rent",
  petPolicy: "Not allowed",
  state: "Lagos",
  lga: "Eti-Osa",
  address: "Penthouse 7, Oniru Private Estate, Victoria Island, Lagos",
  features: ["Rooftop Terrace", "Jacuzzi", "Ocean View", "Concierge", "24/7 Power", "Underground Parking", "Smart Home", "Laundry Service", "Elevator"],
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
  ]
};

async function downloadImageBuffer(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      name: `house-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`,
      type: "image/jpeg"
    };
  } catch (err) {
    console.error("  ⚠️ Failed to download:", imageUrl.substring(0, 50) + "...");
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
  console.log("\n🏠 Rezident Homes - Single House Seeder\n");
  console.log(`Using email: ${EMAIL}\n`);
  
  let token;
  try {
    token = await login();
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    process.exit(1);
  }

  console.log(`Creating: ${house.listingType.toUpperCase()} - ${house.title}...\n`);
  
  try {
    const result = await createHouse(house, token);
    console.log(`✅ Created! ID: ${result.house?._id}`);
    console.log(`   ${house.listingType === "rent" ? "RENT" : "SALE"} - ₦${house.price.toLocaleString()}`);
    console.log(`   Images: ${result.house?.images?.length || 0} uploaded to Cloudinary\n`);
  } catch (err) {
    console.error(`❌ Failed: ${err.message}\n`);
  }

  console.log("🎉 Done!\n");
}

seed().catch(console.error);