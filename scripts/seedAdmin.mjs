import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local if present
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      process.env[key.trim()] = values.join("=").trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "System Administrator";

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Error: Both ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
  console.error("   Example: ADMIN_EMAIL=owner@luxuryessentials.com ADMIN_PASSWORD=StrongPass123! node scripts/seedAdmin.mjs");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 10) {
  console.error("❌ Error: ADMIN_PASSWORD must be at least 10 characters long.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

    let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.emailVerified = true;
      await admin.save();
      console.log(`✅ Admin account updated successfully!`);
    } else {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase().trim(),
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
      });
      console.log(`✅ Admin account created successfully!`);
    }

    console.log(`\n🔑 Admin Account Configured:`);
    console.log(`──────────────────────────────────────────`);
    console.log(` Email      : ${admin.email}`);
    console.log(` Role       : ${admin.role}`);
    console.log(` Password   : [PROTECTED / NOT PRINTED IN LOGS]`);
    console.log(`──────────────────────────────────────────\n`);
  } catch (err) {
    console.error("❌ Error seeding admin user:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
