// scripts/seedNewHouses.cjs
// Run with: node scripts/seedNewHouses.cjs

const BASE_URL = "http://localhost:3000/api";
const EMAIL = "sorochijoshua22@gmail.com";

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
  // ==========================================
  // RENT LISTINGS (6 Houses)
  // ==========================================
  {
    listingType: "rent",
    title: "Fully Serviced Studio Apartment in D-Line",
    description: "Modern studio apartment in the heart of D-Line, perfect for young professionals. Features an open-plan layout with premium finishes, built-in wardrobes, and a sleek kitchenette. Building amenities include a rooftop lounge, gym, and laundry service.",
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
    features: ["Rooftop Lounge", "Gym", "Laundry Service", "CCTV", "Elevator", "24/7 Power"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&fm=jpg"
    ]
  },
  {
    listingType: "rent",
    title: "Luxury 5-Bedroom Duplex in Old GRA",
    description: "Exceptional 5-bedroom duplex in the serene Old GRA neighborhood. This grand residence features a double-volume living room, formal dining area, home office, and a modern kitchen. Staff quarters and mature garden complete this premium offering.",
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
    features: ["Staff Quarters", "Home Office", "Mature Garden", "Double Living Room", "Walk-in Closet", "CCTV"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&fm=jpg"
    ]
  },
  {
    listingType: "rent",
    title: "Charming 3-Bedroom Apartment in Peter Odili",
    description: "Beautifully presented 3-bedroom apartment located in a highly sought-after estate along Peter Odili Road. Offers spacious en-suite rooms, a massive kitchen with custom cabinets, and stable security structures.",
    propertyType: "Apartment",
    price: 110,
    bedrooms: 3,
    bathrooms: 3,
    size: "180",
    yearBuilt: 2023,
    furnishing: "Semi-Furnished",
    leaseTerm: "1 Year",
    securityDeposit: "₦100,000",
    serviceCharge: "₦15,000/month",
    availability: "Immediate",
    utilityTerms: "Shared prepaid",
    petPolicy: "Cats only",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "Waterlines Estate, Peter Odili Road, Port Harcourt, Rivers State",
    features: ["24/7 Security", "Water Treatment", "Paved Compound", "Balcony", "En-suite"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fm=jpg"
    ]
  },
  {
    listingType: "rent",
    title: "Cozy 2-Bedroom Flat near NTA Road",
    description: "Affordable and perfectly located 2-bedroom flat just off NTA Road. Easy access to local transportation, shopping plazas, and schools. Secure gated compound with adequate vehicle parking space.",
    propertyType: "Flat",
    price: 110,
    bedrooms: 2,
    bathrooms: 2,
    size: "120",
    yearBuilt: 2022,
    furnishing: "Unfurnished",
    leaseTerm: "1 Year",
    securityDeposit: "None",
    serviceCharge: "₦10,000/month",
    availability: "Ready to move in",
    utilityTerms: "Individual Meter",
    petPolicy: "Not allowed",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "44 Mgbuoba Link, Off NTA Road, Port Harcourt, Rivers State",
    features: ["Gated Compound", "Gated Security", "Borehole", "Wardrobes", "Pop Ceiling"],
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&fm=jpg"
    ]
  },
  {
    listingType: "rent",
    title: "Executive 1-Bedroom Mini-Flat in Woji",
    description: "A premium mini-flat offering a vast living area and an expansive bedroom layout. Situated in a serene, flood-free residential street in Woji. Perfect for students or upwardly mobile singles.",
    propertyType: "Mini-Flat",
    price: 110,
    bedrooms: 1,
    bathrooms: 1,
    size: "80",
    yearBuilt: 2025,
    furnishing: "Unfurnished",
    leaseTerm: "1 Year",
    securityDeposit: "1 month rent",
    serviceCharge: "₦5,000/month",
    availability: "Available instantly",
    utilityTerms: "Prepaid",
    petPolicy: "Allowed",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "12 Alcon Road, Woji, Port Harcourt, Rivers State",
    features: ["Flood Free Area", "Clean Water", "Prepaid Meter", "Fenced Yard"],
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?w=800&fm=jpg"
    ]
  },
  {
    listingType: "rent",
    title: "Serviced 4-Bedroom Terrace in Eliozu",
    description: "Exquisite 4-bedroom terrace property with premium fittings. Features automated lighting, a state-of-the-art kitchen, and spacious family lounges. Located in a family-friendly security estate.",
    propertyType: "Terrace",
    price: 110,
    bedrooms: 4,
    bathrooms: 4,
    size: "310",
    yearBuilt: 2024,
    furnishing: "Semi-Furnished",
    leaseTerm: "2 Years",
    securityDeposit: "₦200,000",
    serviceCharge: "₦25,000/month",
    availability: "Next Week",
    utilityTerms: "Central Generator",
    petPolicy: "Allowed",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "Plot 8, Chief G.U. Ake Road, Eliozu, Port Harcourt, Rivers State",
    features: ["Family Lounge", "Inverter System", "Uniformed Security", "Water Heater"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fm=jpg"
    ]
  },

  // ==========================================
  // SALE LISTINGS (6 Houses)
  // ==========================================
  {
    listingType: "sale",
    title: "Newly Built 3-Bedroom Bungalow in Ada George",
    description: "Brand new contemporary bungalow in the fast-developing Ada George area. Sitting on a 500sqm plot with room for expansion, this home features an open-plan living area, modern kitchen with island, and 3 spacious en-suite bedrooms.",
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
    features: ["New Building", "Open Plan", "Modern Kitchen", "En-suite Rooms", "Large Plot", "Borehole"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&fm=jpg"
    ]
  },
  {
    listingType: "sale",
    title: "Elegant 4-Bedroom Townhouse in GRA Phase 1",
    description: "Sophisticated 4-bedroom townhouse in a secure gated community in GRA Phase 1. This tri-level residence offers refined living with a ground-floor guest suite and top floor master layouts.",
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
    features: ["Gated Community", "Swimming Pool", "Tennis Court", "Smart Home", "Underground Parking"],
    images: [
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&fm=jpg"
    ]
  },
  {
    listingType: "sale",
    title: "Contemporary 4-Bedroom Detached Duplex in Rumuibekwe",
    description: "Stunning ultra-modern smart mansion. Features cinema room, automated fittings, high ceilings, custom carpentry, fitted kitchen appliances, and concrete stamped floors.",
    propertyType: "Duplex",
    price: 110,
    bedrooms: 4,
    bathrooms: 5,
    size: "400",
    yearBuilt: 2026,
    furnishing: "Unfurnished",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "Avenue 3, Rumuibekwe Housing Estate, Port Harcourt, Rivers State",
    features: ["Smart Automation", "Home Cinema", "Stamped Concrete", "Fully Fitted Kitchen", "Boy's Quarters"],
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&fm=jpg"
    ]
  },
  {
    listingType: "sale",
    title: "Brand New 2-Bedroom Block of Flats in Choba",
    description: "Excellent high-yield real estate investment setup. Clean structural multi-family development located right near UniPort university gate. High rental demand guarantees passive income.",
    propertyType: "Apartment Block",
    price: 110,
    bedrooms: 8,
    bathrooms: 8,
    size: "600",
    yearBuilt: 2025,
    furnishing: "Unfurnished",
    state: "Rivers",
    lga: "Obio-Akpor",
    address: "Uniport Gate Link Road, Choba, Port Harcourt, Rivers State",
    features: ["Investment Property", "High Rental Yield", "Dedicated Transformer", "Spacious Parking"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&fm=jpg"
    ]
  },
  {
    listingType: "sale",
    title: "Massive 6-Bedroom Mansion on Airport Road",
    description: "Sprawling estate block sitting across two full plots of land. Includes detached security post, swimming pool framework, massive storage houses, and industrial capacity boreholes.",
    propertyType: "Mansion",
    price: 110,
    bedrooms: 6,
    bathrooms: 7,
    size: "900",
    yearBuilt: 2023,
    furnishing: "Unfurnished",
    state: "Rivers",
    lga: "Ikwerre",
    address: "Kilometer 4, Airport Road, Omagwa, Port Harcourt, Rivers State",
    features: ["2 Plots Land", "Swimming Pool Space", "Security Outpost", "Industrial Borehole", "Penthouse Suite"],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800&fm=jpg"
    ]
  },
  {
    listingType: "sale",
    title: "Premium 3-Bedroom Terrace Duplex in Trans Amadi",
    description: "Located within an exclusive residential block inside Trans Amadi industrial layout. Highly secure perimeter fencing with standard multi-layered security gates.",
    propertyType: "Terrace Duplex",
    price: 110,
    bedrooms: 3,
    bathrooms: 4,
    size: "240",
    yearBuilt: 2024,
    furnishing: "Semi-Furnished",
    state: "Rivers",
    lga: "Port Harcourt",
    address: "Nkpogu Road, Trans Amadi, Port Harcourt, Rivers State",
    features: ["Industrial Grid Power", "Tarred Access Road", "Corporate Security", "Fitted Kitchen Wardrobes"],
    images: [
      "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=800&fm=jpg",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&fm=jpg"
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
    const outputType = "image/jpeg";
    const extension = ".jpg";
    
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
    console.error(`      Error: ${err.message}`);
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