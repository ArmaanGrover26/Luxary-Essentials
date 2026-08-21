import { Resend } from "resend";

// ─── Resend client (For Admin Emails) ─────────────────────────────────────────
// Set RESEND_API_KEY in .env.local — get it from https://resend.com/api-keys
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Config ───────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "luxaryessentials24@gmail.com";
const BRAND_NAME = "Luxury Essentials";
const BRAND_COLOR = "#b89d72";
const DARK_COLOR = "#2c2c2c";

// Resend sender address for admin email
const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function wrapEmail(content: string): string {
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
      <table width="100%" style="max-width:580px;background:#ffffff;border-radius:12px;border:1px solid #ede5d8;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:${DARK_COLOR};padding:32px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#ffffff;letter-spacing:0.05em;line-height:1;">Luxury</div>
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

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: "cod" | "online";
}

// ─── Items table ──────────────────────────────────────────────────────────────
function itemsTable(items: OrderEmailData["items"]): string {
  const rows = items
    .map(
      (i) => `
    <tr style="border-bottom:1px solid #ede5d8;">
      <td style="padding:10px 12px;font-size:13px;color:${DARK_COLOR};">${i.name}</td>
      <td style="padding:10px 12px;font-size:13px;color:#6b6560;text-align:center;">×${i.quantity}</td>
      <td style="padding:10px 12px;font-size:13px;color:${DARK_COLOR};text-align:right;font-weight:600;">${formatINR(i.quantity * i.price)}</td>
    </tr>`
    )
    .join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede5d8;border-radius:8px;overflow:hidden;margin:20px 0;">
    <thead>
      <tr style="background:#faf7f2;">
        <th style="padding:10px 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#a09990;text-align:left;">Product</th>
        <th style="padding:10px 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#a09990;text-align:center;">Qty</th>
        <th style="padding:10px 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#a09990;text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ─── User: COD email ──────────────────────────────────────────────────────────
function userCodHtml(d: OrderEmailData): string {
  return wrapEmail(`
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:${DARK_COLOR};margin:0 0 8px;">
      Thank you for your order! 🎉
    </h1>
    <p style="font-size:13px;color:#6b6560;margin:0 0 24px;line-height:1.7;">
      Dear <strong style="color:${DARK_COLOR};">${d.customerName}</strong>, we've received your order and it's now being processed.
    </p>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#a09990;margin-bottom:4px;">Order Reference</div>
      <div style="font-family:monospace;font-size:20px;font-weight:700;color:${DARK_COLOR};">#${d.orderId.slice(-6).toUpperCase()}</div>
    </div>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:700;color:#b45309;margin-bottom:6px;">📦 Cash on Delivery — What happens next?</div>
      <p style="font-size:13px;color:#92400e;line-height:1.7;margin:0;">
        Our team will <strong>contact you soon</strong> at <strong>${d.shippingAddress.phone}</strong> to collect the payment.
        Once payment is confirmed, your order will be <strong>packed and shipped</strong> right away!
      </p>
    </div>

    ${itemsTable(d.items)}

    <div style="text-align:right;margin-bottom:20px;">
      <span style="font-family:Georgia,serif;font-size:22px;color:${BRAND_COLOR};font-weight:700;">${formatINR(d.totalAmount)}</span>
      <span style="font-size:11px;color:#a09990;margin-left:6px;">Cash on Delivery</span>
    </div>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_COLOR};margin-bottom:8px;font-weight:700;">Delivering To</div>
      <div style="font-size:13px;color:${DARK_COLOR};line-height:1.9;">
        <strong>${d.shippingAddress.name}</strong><br/>
        ${d.shippingAddress.address}, ${d.shippingAddress.city} — ${d.shippingAddress.pincode}<br/>
        📞 ${d.shippingAddress.phone}
      </div>
    </div>

    <p style="font-size:13px;color:#6b6560;margin:24px 0 0;line-height:1.7;">
      Questions? Reach us at <a href="mailto:${ADMIN_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${ADMIN_EMAIL}</a>
    </p>
  `);
}

// ─── User: Online email ───────────────────────────────────────────────────────
function userOnlineHtml(d: OrderEmailData): string {
  return wrapEmail(`
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:${DARK_COLOR};margin:0 0 8px;">
      Order Confirmed! ✨
    </h1>
    <p style="font-size:13px;color:#6b6560;margin:0 0 24px;line-height:1.7;">
      Dear <strong style="color:${DARK_COLOR};">${d.customerName}</strong>, your payment was successful and your order is confirmed!
    </p>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#a09990;margin-bottom:4px;">Order Reference</div>
      <div style="font-family:monospace;font-size:20px;font-weight:700;color:${DARK_COLOR};">#${d.orderId.slice(-6).toUpperCase()}</div>
    </div>

    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:13px;font-weight:700;color:#047857;margin-bottom:6px;">🚚 Your order is on its way!</div>
      <p style="font-size:13px;color:#065f46;line-height:1.7;margin:0;">
        Your order has been confirmed and will be <strong>carefully packed and shipped</strong> to your address within <strong>5–7 business days</strong>.
      </p>
    </div>

    ${itemsTable(d.items)}

    <div style="text-align:right;margin-bottom:20px;">
      <span style="font-family:Georgia,serif;font-size:22px;color:${BRAND_COLOR};font-weight:700;">${formatINR(d.totalAmount)}</span>
      <span style="font-size:11px;color:#a09990;margin-left:6px;">Online Payment</span>
    </div>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_COLOR};margin-bottom:8px;font-weight:700;">Delivering To</div>
      <div style="font-size:13px;color:${DARK_COLOR};line-height:1.9;">
        <strong>${d.shippingAddress.name}</strong><br/>
        ${d.shippingAddress.address}, ${d.shippingAddress.city} — ${d.shippingAddress.pincode}<br/>
        📞 ${d.shippingAddress.phone}
      </div>
    </div>
  `);
}

// ─── Admin notification email ─────────────────────────────────────────────────
function adminHtml(d: OrderEmailData): string {
  const badge =
    d.paymentMethod === "cod"
      ? `<span style="background:#fffbeb;color:#b45309;border:1px solid #fde68a;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">CASH ON DELIVERY</span>`
      : `<span style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">ONLINE PAYMENT</span>`;

  return wrapEmail(`
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:${DARK_COLOR};margin:0 0 4px;">🛍️ New Order Received</h1>
    <p style="font-size:13px;color:#6b6560;margin:0 0 20px;">A new order has just been placed.</p>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:10px;color:#a09990;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Order ID</div>
            <div style="font-family:monospace;font-size:20px;font-weight:700;color:${DARK_COLOR};">#${d.orderId.slice(-6).toUpperCase()}</div>
          </td>
          <td style="text-align:right;vertical-align:top;">${badge}</td>
        </tr>
      </table>
    </div>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#a09990;margin-bottom:8px;font-weight:700;">Customer</div>
      <div style="font-size:13px;color:${DARK_COLOR};line-height:1.9;">
        <strong>${d.customerName}</strong><br/>
        📧 ${d.customerEmail}<br/>
        📞 ${d.shippingAddress.phone}
      </div>
    </div>

    ${itemsTable(d.items)}

    <div style="text-align:right;margin-bottom:20px;">
      <span style="font-family:Georgia,serif;font-size:24px;color:${BRAND_COLOR};font-weight:700;">${formatINR(d.totalAmount)}</span>
    </div>

    <div style="background:#faf7f2;border:1px solid #ede5d8;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_COLOR};margin-bottom:8px;font-weight:700;">Ship To</div>
      <div style="font-size:13px;color:${DARK_COLOR};line-height:1.9;">
        ${d.shippingAddress.name}<br/>
        ${d.shippingAddress.address}, ${d.shippingAddress.city} — ${d.shippingAddress.pincode}
      </div>
    </div>

    ${
      d.paymentMethod === "cod"
        ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;">
            <strong style="font-size:13px;color:#b45309;">⚠️ Action Required:</strong>
            <p style="font-size:13px;color:#92400e;margin:6px 0 0;line-height:1.6;">
              This is a COD order. Call the customer at <strong>${d.shippingAddress.phone}</strong> to collect payment before shipping.
            </p>
          </div>`
        : `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 18px;">
            <strong style="font-size:13px;color:#047857;">✅ Payment Received</strong>
            <p style="font-size:13px;color:#065f46;margin:6px 0 0;line-height:1.6;">
              Online payment confirmed. Please pack and ship the order.
            </p>
          </div>`
    }
  `);
}

// ─── Brevo API Client (For Customer Emails - No Domain Required) ─────────────
async function sendCustomerEmailViaBrevo(
  customerEmail: string,
  customerName: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey || brevoApiKey === "brevo_placeholder") {
    console.warn(
      "[Brevo] BREVO_API_KEY not set in .env.local. Skipping customer email."
    );
    return;
  }

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "luxaryessentials24@gmail.com";

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: BRAND_NAME,
          email: senderEmail,
        },
        to: [
          {
            email: customerEmail,
            name: customerName,
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[Brevo] ✗ Failed to send customer email:", data);
    } else {
      console.log(`[Brevo] ✓ Customer email sent to ${customerEmail}`);
    }
  } catch (err) {
    console.error("[Brevo] ✗ Error calling Brevo API:", err);
  }
}

// ─── Main exported function ───────────────────────────────────────────────────
export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const shortId = `#${data.orderId.slice(-6).toUpperCase()}`;

  // 1. Send Admin Email via Resend
  const isResendSet =
    process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder";

  if (isResendSet) {
    const adminSubject = `🛍️ New ${data.paymentMethod.toUpperCase()} Order ${shortId} — ${data.customerName}`;
    resend.emails
      .send({
        from: FROM_ADDRESS,
        to: ADMIN_EMAIL,
        subject: adminSubject,
        html: adminHtml(data),
      })
      .then((res) => {
        if (res.error) {
          console.error("[Resend] ✗ Failed to send admin email:", res.error);
        } else {
          console.log(`[Resend] ✓ Admin notified for order ${shortId}`);
        }
      })
      .catch((err) => {
        console.error("[Resend] ✗ Error sending admin email:", err);
      });
  } else {
    console.warn("[Resend] RESEND_API_KEY not set. Skipping admin email.");
  }

  // 2. Send Customer Confirmation Email via Brevo (Sends to any customer email without custom domain)
  const userSubject =
    data.paymentMethod === "cod"
      ? `Your Order ${shortId} is Confirmed — ${BRAND_NAME}`
      : `Order Confirmed ✨ ${shortId} — ${BRAND_NAME}`;

  const userHtml =
    data.paymentMethod === "cod" ? userCodHtml(data) : userOnlineHtml(data);

  await sendCustomerEmailViaBrevo(
    data.customerEmail,
    data.customerName,
    userSubject,
    userHtml
  );
}
