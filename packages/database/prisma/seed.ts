import { PrismaClient, UserRole, UserStatus, OrganizerStatus, EventStatus, OrderStatus, PaymentProvider, PaymentChannel, PaymentStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Simple AES-256-CBC encryption simulation for NIK
const ENCRYPTION_KEY = (process.env.DATA_ENCRYPTION_KEY || "ovation_secret_key_32_bytes_nik").padEnd(32, "0").slice(0, 32);
const IV_LENGTH = 16;

function encryptNik(nik: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(nik, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function generateDynamicSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function main() {
  console.log("🚀 Starting database seeding for Ovation Concert Ticketing Platform...");

  // 1. Clean existing records in reverse dependency order
  console.log("🧹 Clearing previous records...");
  await prisma.checkinLog.deleteMany();
  await prisma.issuedTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.paymentWebhookLog.deleteMany();
  await prisma.refundRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.virtualQueue.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.organizer.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log("👤 Seeding system users & credentials...");
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@ovation.id",
      passwordHash: hashPassword("super123"),
      name: "Rangga Wibawa (Super Admin)",
      phone: "+6281198765432",
      isPhoneVerified: true,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      nikEncrypted: encryptNik("3171012304900001"),
      nikLast4: "0001",
    },
  });

  const organizerUser = await prisma.user.create({
    data: {
      email: "admin@ovation.id",
      passwordHash: hashPassword("admin123"),
      name: "Farhan Mahendra (Promotor)",
      phone: "+6281234567890",
      isPhoneVerified: true,
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
      nikEncrypted: encryptNik("3172021508880002"),
      nikLast4: "0002",
    },
  });

  const organizerUser2 = await prisma.user.create({
    data: {
      email: "ismaya@ovation.id",
      passwordHash: hashPassword("ismaya123"),
      name: "Christian Rijanto (Ismaya Live)",
      phone: "+6281299887766",
      isPhoneVerified: true,
      role: UserRole.ORGANIZER,
      status: UserStatus.ACTIVE,
      nikEncrypted: encryptNik("3173031006850003"),
      nikLast4: "0003",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "dinda@example.com",
      passwordHash: hashPassword("customer123"),
      name: "Dinda Ayu Saraswati",
      phone: "+6281311223344",
      isPhoneVerified: true,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      nikEncrypted: encryptNik("3276015509980004"),
      nikLast4: "0004",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "bimo.p@example.com",
      passwordHash: hashPassword("customer123"),
      name: "Bimo Prakoso",
      phone: "+6281388990011",
      isPhoneVerified: true,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      nikEncrypted: encryptNik("3174041212950005"),
      nikLast4: "0005",
    },
  });

  // 3. Seed Organizers
  console.log("🏢 Seeding organizer profiles...");
  const organizerAntara = await prisma.organizer.create({
    data: {
      userId: organizerUser.id,
      companyName: "PT Antara Lintas Nusantara",
      brandName: "Antara Suara",
      email: "contact@antarasuara.com",
      phone: "+622155667788",
      address: "Senopati Suites Tower 2, Kebayoran Baru, Jakarta Selatan",
      bankName: "BCA",
      bankAccountNumber: "8001239999",
      bankAccountHolder: "PT Antara Lintas Nusantara",
      npwp: "01.234.567.8-012.000",
      legalDocumentUrl: "/docs/legal/siup_antarasuara.pdf",
      verificationStatus: OrganizerStatus.APPROVED,
      feePercentage: 5.0,
      verifiedAt: new Date("2026-01-10"),
      verifiedByUserId: superAdmin.id,
    },
  });

  const organizerIsmaya = await prisma.organizer.create({
    data: {
      userId: organizerUser2.id,
      companyName: "PT Ismaya Live Indonesia",
      brandName: "Ismaya Live",
      email: "info@ismayalive.com",
      phone: "+622129008899",
      address: "Gandaria 8 Office Tower Lt. 25, Jakarta Selatan",
      bankName: "Mandiri",
      bankAccountNumber: "1370019283746",
      bankAccountHolder: "PT Ismaya Live Indonesia",
      npwp: "02.345.678.9-013.000",
      legalDocumentUrl: "/docs/legal/siup_ismaya.pdf",
      verificationStatus: OrganizerStatus.APPROVED,
      feePercentage: 4.5,
      verifiedAt: new Date("2026-01-12"),
      verifiedByUserId: superAdmin.id,
    },
  });

  // 4. Seed Event Categories
  console.log("🏷️ Seeding event categories...");
  const catPop = await prisma.eventCategory.create({
    data: { name: "Pop & R&B", slug: "pop", description: "Konser artis pop nasional dan internasional" },
  });
  const catRock = await prisma.eventCategory.create({
    data: { name: "Rock & Metal", slug: "rock", description: "Panggung musik rock legendaris dan berenergi tinggi" },
  });
  const catFestival = await prisma.eventCategory.create({
    data: { name: "Music Festival", slug: "festival", description: "Festival musik multi-stage berskala akbar" },
  });
  const catIndie = await prisma.eventCategory.create({
    data: { name: "Indie & Alternative", slug: "indie", description: "Karya musisi independen dan alternatif pilihan" },
  });

  // 5. Seed Events
  console.log("🎤 Seeding major concert events...");
  const eventDewa = await prisma.event.create({
    data: {
      organizerId: organizerAntara.id,
      categoryId: catRock.id,
      title: "Dewa 19 Featuring All Stars Stadium Tour 2026",
      slug: "dewa-19-all-stars-2026",
      description: "Konser megah perayaan perjalanan musik legendaris Dewa 19 berkolaborasi dengan musisi rock dunia di Stadion Utama Gelora Bung Karno.",
      termsAndConditions: "1. Wajib menunjukkan e-ticket QR Code dan KTP/SIM asli saat penukaran gelang.\n2. Anak di bawah usia 12 tahun wajib didampingi orang tua.\n3. Dilarang membawa kamera profesional, senjata, dan makanan dari luar.",
      bannerUrl: "/images/events/dewa_19.jpg",
      venueName: "Stadion Utama Gelora Bung Karno (GBK)",
      venueCity: "Jakarta Pusat",
      address: "Jl. Pintu Satu Senayan, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat",
      startDatetime: new Date("2026-12-19T19:00:00Z"),
      endDatetime: new Date("2026-12-19T23:30:00Z"),
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      warTicketActive: true,
      warTicketStartTime: new Date("2026-11-10T14:00:00Z"),
      maxTicketsPerNik: 4,
      maxTicketsPerTransaction: 4,
      platformFeePercent: 5.0,
      adminFeeFixed: 5000,
      approvedAt: new Date("2026-02-01"),
      approvedByUserId: superAdmin.id,
    },
  });

  const eventSheila = await prisma.event.create({
    data: {
      organizerId: organizerAntara.id,
      categoryId: catPop.id,
      title: "Sheila on 7 — Tunggu Aku Di Jakarta 2026",
      slug: "sheila-on-7-tunggu-aku-di-jakarta-2026",
      description: "Konser tunggal Sheila on 7 yang membawa nostalgia lagu-lagu hits terbaik bersama puluhan ribu Sheilagank di JIExpo Kemayoran.",
      termsAndConditions: "1. Tiket tidak dapat dipindahtangankan tanpa surat kuasa bermaterai.\n2. Pintu venue dibuka pukul 15.00 WIB.",
      bannerUrl: "/images/events/sheila_on_7.jpg",
      venueName: "JIExpo Kemayoran (Open Space)",
      venueCity: "Jakarta Pusat",
      address: "Gedung Pusat Niaga, Arena PRJ Kemayoran, Jakarta Pusat",
      startDatetime: new Date("2026-12-05T18:30:00Z"),
      endDatetime: new Date("2026-12-05T22:30:00Z"),
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      warTicketActive: true,
      warTicketStartTime: new Date("2026-11-15T13:00:00Z"),
      maxTicketsPerNik: 2,
      maxTicketsPerTransaction: 2,
      platformFeePercent: 5.0,
      adminFeeFixed: 5000,
      approvedAt: new Date("2026-02-05"),
      approvedByUserId: superAdmin.id,
    },
  });

  const eventWTF = await prisma.event.create({
    data: {
      organizerId: organizerIsmaya.id,
      categoryId: catFestival.id,
      title: "We The Fest 2026 — 3 Days of Music, Art, Fashion & Food",
      slug: "we-the-fest-2026",
      description: "Festival musik musim panas terbesar di Asia Tenggara menampilkan musisi internasional dan lokal terfavorit.",
      bannerUrl: "/images/events/we_the_fest.jpg",
      venueName: "GBK Sports Complex",
      venueCity: "Jakarta Selatan",
      address: "Kawasan Gelora Bung Karno, Senayan, Jakarta",
      startDatetime: new Date("2026-11-27T14:00:00Z"),
      endDatetime: new Date("2026-11-29T23:59:00Z"),
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      warTicketActive: false,
      maxTicketsPerNik: 4,
      maxTicketsPerTransaction: 4,
      platformFeePercent: 4.5,
      adminFeeFixed: 5000,
      approvedAt: new Date("2026-02-10"),
      approvedByUserId: superAdmin.id,
    },
  });

  const eventHindia = await prisma.event.create({
    data: {
      organizerId: organizerAntara.id,
      categoryId: catIndie.id,
      title: "Hindia: Blueboy Tour & Showcase 2026",
      slug: "hindia-blueboy-tour-2026",
      description: "Konser solo Hindia membawakan nomor-nomor introspektif dari album Menari dengan Bayangan dan Doves, Pitbulls & Eagles.",
      bannerUrl: "/images/events/hindia.jpg",
      venueName: "Tennis Indoor Senayan",
      venueCity: "Jakarta Pusat",
      address: "Jl. Pintu Satu Senayan No. 1, Gelora, Jakarta Pusat",
      startDatetime: new Date("2026-12-12T19:00:00Z"),
      endDatetime: new Date("2026-12-12T22:00:00Z"),
      status: EventStatus.PUBLISHED,
      isFeatured: false,
      warTicketActive: false,
      maxTicketsPerNik: 4,
      maxTicketsPerTransaction: 4,
      platformFeePercent: 5.0,
      adminFeeFixed: 5000,
      approvedAt: new Date("2026-02-12"),
      approvedByUserId: superAdmin.id,
    },
  });

  // 6. Seed Ticket Categories
  console.log("🎫 Seeding ticket categories & quotas...");
  const tktDewaVip = await prisma.ticketCategory.create({
    data: {
      eventId: eventDewa.id,
      name: "VIP All Stars (Numbered Seating)",
      description: "Kursi terbaik di depan panggung utama, exclusive merchandise pack, lounge access, dan snack box.",
      price: 2500000,
      totalQuota: 500,
      remainingQuota: 498,
      maxPerTransaction: 2,
      isVirtualQueueEnabled: true,
      isStanding: false,
      salesStartTime: new Date("2026-11-10T14:00:00Z"),
      salesEndTime: new Date("2026-12-19T12:00:00Z"),
    },
  });

  const tktDewaCat1 = await prisma.ticketCategory.create({
    data: {
      eventId: eventDewa.id,
      name: "CAT 1 (Festival Standing)",
      description: "Area berdiri tepat di depan FOH sound console dengan akustik audio terbaik.",
      price: 1500000,
      totalQuota: 2000,
      remainingQuota: 1980,
      maxPerTransaction: 4,
      isVirtualQueueEnabled: true,
      isStanding: true,
      salesStartTime: new Date("2026-11-10T14:00:00Z"),
      salesEndTime: new Date("2026-12-19T12:00:00Z"),
    },
  });

  const tktDewaCat2 = await prisma.ticketCategory.create({
    data: {
      eventId: eventDewa.id,
      name: "CAT 2 (Tribune Upper Seating)",
      description: "Tribun atas dengan pemandangan panggung menyeluruh dan tata cahaya spektakuler.",
      price: 850000,
      totalQuota: 3500,
      remainingQuota: 3450,
      maxPerTransaction: 4,
      isVirtualQueueEnabled: true,
      isStanding: false,
      salesStartTime: new Date("2026-11-10T14:00:00Z"),
      salesEndTime: new Date("2026-12-19T12:00:00Z"),
    },
  });

  await prisma.ticketCategory.create({
    data: {
      eventId: eventSheila.id,
      name: "Festival A (Front Row Standing)",
      description: "Zona festival berdiri paling dekat dengan panggung Duta dkk.",
      price: 750000,
      totalQuota: 2500,
      remainingQuota: 2500,
      maxPerTransaction: 2,
      isVirtualQueueEnabled: true,
      isStanding: true,
      salesStartTime: new Date("2026-11-15T13:00:00Z"),
      salesEndTime: new Date("2026-12-05T12:00:00Z"),
    },
  });

  await prisma.ticketCategory.create({
    data: {
      eventId: eventWTF.id,
      name: "3-Day Pass General Admission",
      description: "Akses 3 hari penuh ke seluruh panggung dan instalasi seni We The Fest.",
      price: 2100000,
      totalQuota: 3000,
      remainingQuota: 2890,
      maxPerTransaction: 4,
      isVirtualQueueEnabled: false,
      isStanding: true,
      salesStartTime: new Date("2026-10-01T00:00:00Z"),
      salesEndTime: new Date("2026-11-27T12:00:00Z"),
    },
  });

  // 7. Seed Sample Completed Order & E-Tickets
  console.log("💳 Seeding sample completed transaction & dynamic QR tickets...");
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "OVN-20261106-9A8B7C",
      userId: customer1.id,
      eventId: eventDewa.id,
      totalQuantity: 2,
      subtotal: 5000000,
      platformFee: 250000,
      adminFee: 5000,
      finalAmount: 5255000,
      status: OrderStatus.PAID,
      paymentMethod: "QRIS",
      expiredAt: new Date(Date.now() + 15 * 60 * 1000),
      paidAt: new Date(),
      idempotencyKey: "idemp_seed_order_001",
    },
  });

  const sampleOrderItem = await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      ticketCategoryId: tktDewaVip.id,
      quantity: 2,
      unitPrice: 2500000,
      subtotal: 5000000,
    },
  });

  // Create Issued Tickets with Dynamic HMAC Secrets
  const ticket1 = await prisma.issuedTicket.create({
    data: {
      orderItemId: sampleOrderItem.id,
      ticketCode: "TKT-D19-VIP-A001",
      attendeeName: "Dinda Ayu Saraswati",
      attendeeEmail: "dinda@example.com",
      attendeePhone: "+6281311223344",
      attendeeNikEncrypted: encryptNik("3276015509980004"),
      attendeeNikLast4: "0004",
      dynamicHmacSecret: generateDynamicSecret(),
      isCheckedIn: false,
    },
  });

  const ticket2 = await prisma.issuedTicket.create({
    data: {
      orderItemId: sampleOrderItem.id,
      ticketCode: "TKT-D19-VIP-A002",
      attendeeName: "Bimo Prakoso",
      attendeeEmail: "bimo.p@example.com",
      attendeePhone: "+6281388990011",
      attendeeNikEncrypted: encryptNik("3174041212950005"),
      attendeeNikLast4: "0005",
      dynamicHmacSecret: generateDynamicSecret(),
      isCheckedIn: false,
    },
  });

  // Create Payment Record (Midtrans QRIS)
  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      provider: PaymentProvider.MIDTRANS,
      channel: PaymentChannel.QRIS,
      paymentMethodDetail: "GOPAY_QRIS",
      referenceId: "mid_ref_seed_0019283",
      merchantOrderId: sampleOrder.orderNumber,
      amount: 5255000,
      status: PaymentStatus.SETTLEMENT,
      paidAt: new Date(),
      expiredAt: new Date(Date.now() + 15 * 60 * 1000),
      qrString: "00020101021226670016ID.CO.OVATION.WWW0118936009990000010002021500000192835204581253033605802ID5914OVATION TICKETS6007JAKARTA62070703A0163046B2F",
    },
  });

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: customer1.id,
      title: "Pembayaran Berhasil! E-Ticket Siap",
      message: "Transaksi Anda untuk Dewa 19 All Stars Stadium Tour senilai Rp 5.255.000 telah terkonfirmasi. Silakan cek menu My Tickets untuk melihat Dynamic QR Code.",
      type: NotificationType.PAYMENT_SUCCESS,
      isRead: false,
      linkUrl: `/ticket/${ticket1.id}`,
    },
  });

  // Add event to customer's wishlist
  await prisma.wishlist.create({
    data: {
      userId: customer1.id,
      eventId: eventSheila.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("----------------------------------------------------------------");
  console.log("📊 Summary:");
  console.log(" - Super Admin: superadmin@ovation.id (Pass: super123)");
  console.log(" - Organizer: admin@ovation.id (Pass: admin123)");
  console.log(" - Customer: dinda@example.com (Pass: customer123)");
  console.log(" - Seeded Events: Dewa 19, Sheila on 7, We The Fest, Hindia");
  console.log(" - Sample E-Tickets Created: TKT-D19-VIP-A001 & TKT-D19-VIP-A002");
  console.log("----------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

