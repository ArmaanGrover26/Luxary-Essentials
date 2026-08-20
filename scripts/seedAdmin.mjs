import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Simple env loader for .env.local
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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/luxury-essentials";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@luxuryessentials.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";
const ADMIN_NAME = "System Administrator";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = hashedPassword;
      admin.role = "admin";
      await admin.save();
      console.log(`✅ Admin account updated successfully!`);
    } else {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`✅ Default Admin account created successfully!`);
    }

    console.log(`\n🔑 Admin Credentials:`);
    console.log(`──────────────────────────────────────────`);
    console.log(` Portal URL : http://localhost:3000/admin/login`);
    console.log(` Email      : ${ADMIN_EMAIL}`);
    console.log(` Password   : ${ADMIN_PASSWORD}`);
    console.log(` Role       : admin`);
    console.log(`──────────────────────────────────────────\n`);
  } catch (err) {
    console.error("❌ Error seeding admin user:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
