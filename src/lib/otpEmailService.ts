import nodemailer from "nodemailer";

const BRAND_NAME = "Luxury Essentials";
const BRAND_COLOR = "#b89d72";
const DARK_COLOR = "#2c2c2c";

// ── Gmail SMTP transporter (dedicated OTP account, separate from Brevo/Resend) ──
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.OTP_GMAIL_USER,
      pass: process.env.OTP_GMAIL_APP_PASSWORD, // Gmail App Password (not account password)
    },
  });
}

function wrapOtpEmail(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #ede5d8;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:${DARK_COLOR};padding:28px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#ffffff;letter-spacing:0.05em;line-height:1;">Luxury</div>
            <div style="font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:${BRAND_COLOR};margin-top:4px;font-weight:600;">Essentials</div>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#faf7f2;padding:20px 40px;border-top:1px solid #ede5d8;text-align:center;">
            <p style="font-size:11px;color:#a09990;margin:0;letter-spacing:0.06em;">
              © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
            </p>
            <p style="font-size:10px;color:#c5bdb7;margin:6px 0 0;">
              This is an automated email. Please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a 6-digit OTP email to the user via Gmail SMTP.
 * Uses a dedicated Gmail account — completely separate from Brevo (orders) and Resend (admin).
 */
export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  if (!process.env.OTP_GMAIL_USER || !process.env.OTP_GMAIL_APP_PASSWORD) {
    console.warn("[OTP Email] OTP_GMAIL_USER or OTP_GMAIL_APP_PASSWORD not set in .env.local. Skipping OTP email.");
    return;
  }

  const html = wrapOtpEmail(`
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:${DARK_COLOR};margin:0 0 12px;">
      Verify your email address
    </h1>
    <p style="font-size:13px;color:#6b6560;line-height:1.8;margin:0 0 28px;">
      Hi <strong style="color:${DARK_COLOR};">${name}</strong>,<br/>
      Use the verification code below to complete your registration.
      This code expires in <strong>10 minutes</strong>.
    </p>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:10px;padding:28px;text-align:center;margin-bottom:28px;">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#a09990;margin-bottom:12px;font-weight:600;">
        Your verification code
      </div>
      <div style="font-family:monospace;font-size:40px;font-weight:700;letter-spacing:0.25em;color:${DARK_COLOR};">
        ${otp}
      </div>
    </div>

    <p style="font-size:12px;color:#a09990;line-height:1.7;margin:0;">
      If you did not create an account with ${BRAND_NAME}, you can safely ignore this email.
    </p>
  `);

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${process.env.OTP_GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your ${BRAND_NAME} verification code`,
      html,
    });
    console.log(`[OTP Email] ✓ OTP sent to ${email}`);
  } catch (err) {
    console.error("[OTP Email] ✗ Failed to send OTP email:", err);
    // Non-fatal: caller will handle the absence of OTP
    throw err;
  }
}

