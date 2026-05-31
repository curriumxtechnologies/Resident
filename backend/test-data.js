import mongoose from "mongoose";
import Transaction from "./models/transactionModel.js";
import Receipt from "./models/receiptModel.js";

const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URL || process.env.DATABASE_URL;

if (!MONGO_URL) {
  console.error("❌ No MongoDB URL found in environment variables");
  console.log("Available env vars:", Object.keys(process.env).filter(k => k.includes("MONGO") || k.includes("DATABASE")));
  process.exit(1);
}

console.log("Connecting to MongoDB...");

mongoose.connect(MONGO_URL).then(async () => {
  console.log("✅ Connected to MongoDB");
  
  const transactions = await Transaction.find({}).limit(10);
  console.log(`\n📊 Total transactions (first 10): ${transactions.length}`);
  transactions.forEach(t => console.log(`  - ${t._id}: ${t.type} | Status: ${t.status} | Amount: ₦${t.amount?.toLocaleString()}`));
  
  const receipts = await Receipt.find({}).limit(10);
  console.log(`\n📄 Total receipts (first 10): ${receipts.length}`);
  receipts.forEach(r => console.log(`  - ${r.receiptNumber}: ${r.paymentPlan} | Status: ${r.paymentStatus}`));
  
  await mongoose.connection.close();
  process.exit(0);
}).catch(err => {
  console.error("❌ Connection error:", err.message);
  process.exit(1);
});