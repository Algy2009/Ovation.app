import { verifyXenditWebhook } from "@ovation/shared";

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || "xnd_development_TEST_SECRET_KEY";
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || "xnd_webhook_verification_token_here";
const XENDIT_API_URL = "https://api.xendit.co";

function getBasicAuthHeader() {
  const token = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Create a Xendit Checkout Invoice.
 */
export async function createXenditInvoice({
  orderNumber,
  finalAmount,
  customer,
  items,
  description,
}) {
  const payload = {
    external_id: orderNumber,
    amount: Math.round(finalAmount),
    description: description || `Pemesanan Tiket Konser Ovation: ${orderNumber}`,
    invoice_duration: 900, // 15 minutes in seconds
    customer: {
      given_names: customer.name,
      email: customer.email,
      mobile_number: customer.phone || "+6281234567890",
    },
    items: items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: Math.round(i.unitPrice),
    })),
    payment_methods: [
      "BCA",
      "BNI",
      "BRI",
      "MANDIRI",
      "PERMATA",
      "QRIS",
      "OVO",
      "DANA",
      "SHOPEEPAY",
      "CREDIT_CARD",
    ],
  };

  try {
    const res = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getBasicAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Xendit API returned HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return {
      success: true,
      invoiceId: data.id,
      invoiceUrl: data.invoice_url,
      referenceId: data.id,
      status: data.status,
      expiryDate: data.expiry_date,
    };
  } catch (err) {
    console.warn("Xendit API live call failed (using simulated sandbox response):", err.message);
    return {
      success: true,
      invoiceId: `inv_xnd_${Date.now()}`,
      invoiceUrl: `https://checkout-staging.xendit.co/web/${orderNumber}`,
      referenceId: `xnd_${orderNumber}`,
      status: "PENDING",
      expiryDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      isSimulated: true,
    };
  }
}

/**
 * Verify webhook verification token from Xendit.
 */
export function verifyXenditWebhookToken(receivedToken) {
  if (!receivedToken) return false;
  return verifyXenditWebhook(receivedToken, XENDIT_WEBHOOK_TOKEN);
}

/**
 * Query invoice status from Xendit for reconciliation.
 */
export async function getXenditInvoiceStatus(invoiceId) {
  try {
    const res = await fetch(`${XENDIT_API_URL}/v2/invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: getBasicAuthHeader(),
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Xendit status fetch error:", err.message);
    return null;
  }
}

