// Quick test: verifies Gmail SMTP credentials and sends a test OTP email
// Run with: node scripts/testOtpEmail.mjs <recipient@email.com>
import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const user = env["OTP_GMAIL_USER"];
const pass = env["OTP_GMAIL_APP_PASSWORD"];
const recipient = process.argv[2] || user; // send to self by default

if (!user || !pass) {
  console.error("❌ OTP_GMAIL_USER or OTP_GMAIL_APP_PASSWORD not set in .env.local");
  process.exit(1);
}

console.log(`\n📧 Testing Gmail SMTP...`);
console.log(`   From : ${user}`);
console.log(`   To   : ${recipient}\n`);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log("✅ SMTP connection verified — credentials are correct!\n");

  const testOtp = "482951";
  await transporter.sendMail({
    from: `"Luxury Essentials" <${user}>`,
    to: recipient,
    subject: `${testOtp} is your Luxury Essentials verification code (TEST)`,
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:480px;">
        <h2 style="color:#2c2c2c;">OTP Test Email ✅</h2>
        <p>Your test verification code is:</p>
        <div style="font-family:monospace;font-size:36px;font-weight:700;letter-spacing:0.2em;color:#2c2c2c;background:#f5f0e8;padding:16px;border-radius:8px;text-align:center;">
          ${testOtp}
        </div>
        <p style="color:#888;font-size:12px;margin-top:16px;">
          This is a test email from your development environment.
        </p>
      </div>
    `,
  });

  console.log(`✅ Test OTP email sent to: ${recipient}`);
  console.log("   Check your inbox (and spam folder if not there).\n");
} catch (err) {
  console.error("❌ SMTP test failed:", err.message);
  console.error("\nCommon fixes:");
  console.error("  • Make sure 2-Step Verification is enabled on the Gmail account");
  console.error("  • Use an App Password (not your regular Gmail password)");
  console.error("  • Check OTP_GMAIL_USER and OTP_GMAIL_APP_PASSWORD in .env.local\n");
  process.exit(1);
}
