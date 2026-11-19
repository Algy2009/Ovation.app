import nodemailer from "nodemailer";

/**
 * Configure Nodemailer SMTP Transporter
 * Falls back to console logger if SMTP credentials are not specified in .env
 */
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || '"Ovation Ticketing" <no-reply@ovation.id>';

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send Official E-Ticket confirmation email to buyer
 */
export async function sendETicketEmail({
  to,
  buyerName,
  orderNumber,
  eventName,
  eventDate,
  venue,
  tickets = [],
  totalAmount,
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalAmount || 0);

  const ticketRows = tickets
    .map(
      (t, index) => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 12px 16px; color: #E2E8F0; font-size: 13px;">
          <strong>#${index + 1} - ${t.categoryName || "General Admission"}</strong><br/>
          <span style="color: #94A3B8; font-size: 11px;">Atas Nama: ${t.attendeeName || buyerName}</span>
        </td>
        <td style="padding: 12px 16px; font-family: monospace; font-size: 13px; font-weight: bold; color: #F59E0B; text-align: right;">
          ${t.ticketCode}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>E-Ticket Resmi: ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0D17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B0D17; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #121422; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF;">OVATION TICKETS</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500;">Konfirmasi Pembayaran & E-Ticket Resmi</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 24px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #E2E8F0;">
                Halo <strong>${buyerName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #94A3B8; line-height: 1.6;">
                Pembayaran pesananmu via <strong>Midtrans</strong> telah berhasil diverifikasi. Berikut adalah rincian e-ticket konser resmi milikmu:
              </p>

              <!-- Event Card -->
              <table role="presentation" width="100%" style="background-color: #1A1D30; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 24px; padding: 16px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 6px; font-size: 17px; font-weight: 800; color: #FFFFFF;">${eventName}</h2>
                    <p style="margin: 0 0 4px; font-size: 12px; color: #F59E0B; font-weight: 600;">📅 ${eventDate || "Jadwal Konser"}</p>
                    <p style="margin: 0; font-size: 12px; color: #94A3B8;">📍 ${venue || "Lokasi Stadion"}</p>
                  </td>
                </tr>
              </table>

              <!-- Order Summary -->
              <table role="presentation" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 12px; color: #94A3B8;">Nomor Pesanan:</td>
                  <td align="right" style="font-family: monospace; font-size: 12px; font-weight: bold; color: #FFFFFF;">${orderNumber}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #94A3B8; padding-top: 6px;">Total Pembayaran:</td>
                  <td align="right" style="font-size: 13px; font-weight: 800; color: #34D399; padding-top: 6px;">${formattedAmount}</td>
                </tr>
              </table>

              <!-- Ticket Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #161828; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background-color: rgba(255,255,255,0.03);">
                    <th align="left" style="padding: 10px 16px; font-size: 11px; text-transform: uppercase; color: #94A3B8;">Kategori & Nama</th>
                    <th align="right" style="padding: 10px 16px; font-size: 11px; text-transform: uppercase; color: #94A3B8;">Kode Tiket</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRows}
                </tbody>
              </table>

              <!-- Dynamic QR Security Notice -->
              <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; color: #FCD34D; line-height: 1.5;">
                  <strong>PENTING:</strong> Di pintu masuk (*gate check-in*), petugas akan memindai <strong>Dynamic QR Code</strong> yang berotasi tiap 30 detik. Silakan buka tiket melalui website atau aplikasi mobile Ovation saat tiba di lokasi konser.
                </p>
              </div>

              <p style="margin: 0; font-size: 11px; color: #64748B; text-align: center;">
                Email ini dikirim otomatis oleh sistem resmi Ovation Enterprise Concert Ticketing Platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject: `[Ovation] E-Ticket Resmi: ${eventName} (${orderNumber})`,
        html,
      });
      console.log(`[Email Dispatcher] E-Ticket email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[Email Dispatcher] Failed to send email via SMTP:", err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(
      `[Email Dispatcher (Simulation/Dev)] SMTP not configured in .env. Email queued for ${to} (Order: ${orderNumber}).`
    );
    return { success: true, simulated: true };
  }
}
