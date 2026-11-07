/**
 * ==============================================================================
 * OVATION WHATSAPP NOTIFICATION & OTP SERVICE
 * ==============================================================================
 * Modul pengiriman notifikasi WhatsApp & OTP resmi.
 * Mendukung multi-provider:
 * 1. Fonnte API (Provider lokal Indonesia terpopuler)
 * 2. Twilio WhatsApp API (Standar Global)
 * 3. Simulated Logger (Mode dev & sandbox agar testing berjalan tanpa biaya pulsa)
 * ==============================================================================
 */

const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

/**
 * Format nomor HP Indonesia menjadi format internasional 628xxx
 */
export function formatIndonesianPhone(phone) {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  return clean;
}

/**
 * Dispatcher pengiriman pesan WhatsApp
 */
async function sendWhatsAppMessage(toPhone, messageText) {
  const formattedNumber = formatIndonesianPhone(toPhone);

  // 1. Fonnte Integration (Jika FONNTE_TOKEN tersedia)
  if (FONNTE_TOKEN) {
    try {
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: FONNTE_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: formattedNumber,
          message: messageText,
        }),
      });
      const data = await res.json();
      return { success: true, provider: "FONNTE", response: data };
    } catch (err) {
      console.error("Fonnte WhatsApp send error:", err);
    }
  }

  // 2. Twilio WhatsApp Integration (Jika TWILIO_SID tersedia)
  if (TWILIO_SID && TWILIO_AUTH_TOKEN) {
    try {
      const basicAuth = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
      const body = new URLSearchParams({
        From: TWILIO_PHONE,
        To: `whatsapp:+${formattedNumber}`,
        Body: messageText,
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      return { success: true, provider: "TWILIO", sid: data.sid };
    } catch (err) {
      console.error("Twilio WhatsApp send error:", err);
    }
  }

  // 3. Fallback: Simulated WhatsApp Dispatcher (Zero Cost Sandbox)
  console.log(`\n💬 [WHATSAPP SIMULATOR] Sent to +${formattedNumber}:`);
  console.log(`   "${messageText.replace(/\n/g, "\n   ")}"\n`);

  return {
    success: true,
    provider: "SIMULATED_LOCAL",
    recipient: formattedNumber,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Kirim Kode OTP Verifikasi Akun / WhatsApp
 */
export async function sendWhatsAppOTP(toPhone, otpCode) {
  const message = `Halo dari *Ovation.app*! 🎟️\n\nKode verifikasi keamanan akun Anda adalah:\n👉 *${otpCode}*\n\nKode berlaku selama 5 menit. JANGAN bagikan kode ini kepada siapa pun termasuk staf Ovation demi keamanan tiket Anda.`;
  return await sendWhatsAppMessage(toPhone, message);
}

/**
 * Kirim Notifikasi Tiket Berhasil Terbit setelah Pembayaran Sukses
 */
export async function sendTicketIssuedWhatsApp(toPhone, { buyerName, eventTitle, orderNumber, ticketCount, ticketUrl }) {
  const message = `🎉 *PEMBAYARAN DIVERIFIKASI!* 🎉\n\nHalo Kak ${buyerName},\nPesanan tiket konser Anda di *Ovation.app* telah aktif!\n\n📋 *Detail Tiket:*\n• Event: *${eventTitle}*\n• No. Order: ${orderNumber}\n• Jumlah: ${ticketCount} E-Ticket\n\nBuka E-Ticket Dynamic QR Code Anda di:\n🔗 ${ticketUrl || "http://localhost:3000/account/tickets"}\n\n_Catatan: QR code berotasi dinamis setiap 30 detik untuk perlindungan dari calo. Tunjukkan langsung dari aplikasi saat masuk gate venue._`;
  return await sendWhatsAppMessage(toPhone, message);
}

/**
 * Kirim Notifikasi Pembaruan Status Refund
 */
export async function sendRefundUpdateWhatsApp(toPhone, { buyerName, orderNumber, status, amount }) {
  const formattedAmount = Number(amount).toLocaleString("id-ID");
  const message = `ℹ️ *UPDATE STATUS REFUND TIKET* ℹ️\n\nHalo Kak ${buyerName},\nPengajuan refund untuk pesanan *${orderNumber}* senilai Rp ${formattedAmount} saat ini berstatus: *${status}*.\n\nSilakan cek detail pengembalian dana melalui dashboard akun Ovation Anda.`;
  return await sendWhatsAppMessage(toPhone, message);
}

