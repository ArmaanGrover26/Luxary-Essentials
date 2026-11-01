/**
 * WhatsApp Cloud API Service (Meta)
 *
 * Sends automated WhatsApp order confirmation messages to customers
 * and notification alerts to the store administrator.
 *
 * Required environment variables in .env.local:
 *   WHATSAPP_PHONE_NUMBER_ID - Meta WhatsApp Phone Number ID
 *   WHATSAPP_ACCESS_TOKEN    - System User Access Token / Permanent Token
 *
 * Optional environment variables:
 *   WHATSAPP_TEMPLATE_NAME   - Name of approved template (e.g. order_confirmation)
 *   WHATSAPP_TEMPLATE_LANG   - Language code (default: en)
 *   ADMIN_WHATSAPP_NUMBER    - Admin phone number to receive new order alerts (e.g. 919876543210)
 */

export interface OrderWhatsAppItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderWhatsAppAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface OrderWhatsAppPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: OrderWhatsAppItem[];
  totalAmount: number;
  shippingAddress: OrderWhatsAppAddress;
  paymentMethod: "cod" | "online";
}

/**
 * Normalizes phone numbers to Meta's expected E.164 format without leading '+' or '0'.
 * Defaults 10-digit Indian numbers to '91' prefix.
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Formats a clean, readable text message for order confirmation.
 */
export function formatOrderWhatsAppMessage(d: OrderWhatsAppPayload): string {
  const shortId = d.orderId.slice(-6).toUpperCase();
  const itemsText = d.items
    .map((item) => `• ${item.name} × ${item.quantity} (₹${(item.quantity * item.price).toLocaleString("en-IN")})`)
    .join("\n");

  const formattedTotal = `₹${d.totalAmount.toLocaleString("en-IN")}`;

  return `🛍️ *Order Confirmed!*

Dear *${d.customerName}*, thank you for placing your order with *Luxury Essentials*.

📋 *Order ID:* #${shortId}
💳 *Payment:* Pay by WhatsApp

*Items Ordered:*
${itemsText}

💰 *Subtotal:* ${formattedTotal}
📍 *Delivering to:*
${d.shippingAddress.name}
${d.shippingAddress.address}, ${d.shippingAddress.city} – ${d.shippingAddress.pincode}

📦 *Important Note on Shipping:*
Shipping charges will be communicated by our admin team according to the weight of your items and your delivery location prior to dispatch.

Our team will coordinate with you directly on this chat to confirm your order and provide payment details. Thank you for shopping with us! ✨`;
}

/**
 * Sends a WhatsApp message using Meta Cloud API.
 */
async function sendMetaWhatsAppMessage(
  recipientPhone: string,
  messageBody: string,
  templateData?: {
    name: string;
    lang?: string;
    params?: string[];
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken || phoneNumberId === "placeholder" || accessToken === "placeholder") {
    console.log("[WhatsApp] API credentials not configured in .env.local. Skipping message delivery.");
    return { success: false, error: "Credentials not configured" };
  }

  const cleanPhone = normalizeWhatsAppNumber(recipientPhone);
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  // Payload: Either pre-approved Meta Template OR Text Message
  let payload: Record<string, any>;

  if (templateData && templateData.name) {
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: templateData.name,
        language: { code: templateData.lang || "en" },
        components: templateData.params && templateData.params.length > 0 ? [
          {
            type: "body",
            parameters: templateData.params.map((text) => ({ type: "text", text })),
          },
        ] : undefined,
      },
    };
  } else {
    payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "text",
      text: { body: messageBody },
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[WhatsApp] Meta API Error:", data);
      return { success: false, error: data?.error?.message || "Failed to send message" };
    }

    console.log(`[WhatsApp] ✓ Message successfully sent to ${cleanPhone} (Message ID: ${data?.messages?.[0]?.id || "ok"})`);
    return { success: true, data };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[WhatsApp] Network exception calling Meta API:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Main function called upon order creation.
 * Sends confirmation to customer and notification to store admin.
 */
export async function sendOrderWhatsApp(data: OrderWhatsAppPayload): Promise<void> {
  const shortId = data.orderId.slice(-6).toUpperCase();
  const customerPhone = data.customerPhone || data.shippingAddress.phone;
  const messageBody = formatOrderWhatsAppMessage(data);

  // 1. Prepare Template data if configured
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "en";

  const templateParams = [
    data.customerName,
    shortId,
    data.items.map((i) => `${i.name} (x${i.quantity})`).join(", "),
    `₹${data.totalAmount.toLocaleString("en-IN")}`,
    `${data.shippingAddress.city}, ${data.shippingAddress.pincode}`,
  ];

  const templateConfig = templateName
    ? { name: templateName, lang: templateLang, params: templateParams }
    : undefined;

  // 2. Send to Customer
  const customerPromise = sendMetaWhatsAppMessage(customerPhone, messageBody, templateConfig);

  // 3. Send Alert to Store Admin (if configured)
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
  let adminPromise = Promise.resolve();

  if (adminPhone && adminPhone !== "placeholder") {
    const adminAlertText = `🔔 *New Order Received #${shortId}!*\n\nCustomer: *${data.customerName}* (${customerPhone})\nAmount: ₹${data.totalAmount.toLocaleString("en-IN")}\nMethod: ${data.paymentMethod === "cod" ? "Pay by WhatsApp" : "Online"}\nCity: ${data.shippingAddress.city}\n\n👉 Check Admin Portal to calculate shipping charges and connect with the customer.`;

    adminPromise = sendMetaWhatsAppMessage(adminPhone, adminAlertText).then(() => {});
  }

  // Settle both without blocking
  await Promise.allSettled([customerPromise, adminPromise]);
}

