export const GENRES = [
  "Festival",
  "Konser Tunggal",
  "Musik Elektronik",
  "Musik Indie",
  "Orkestra",
];

export function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const POSTER_PALETTE = ["#E4A92C", "#C9CDD3", "#8C6E2F", "#3A3A42"];

export function posterFor(seed) {
  const idx = Array.from(String(seed)).reduce((n, ch) => n + ch.charCodeAt(0), 0);
  return POSTER_PALETTE[idx % POSTER_PALETTE.length];
}

export function seedEvents() {
  return [
    {
      id: "evt_sheila",
      name: "Sheila on 7 — Tunggu Aku Di Jakarta",
      venue: "Stadion Utama Gelora Bung Karno",
      city: "Jakarta",
      date: "2026-11-28",
      time: "20:00",
      genre: "Konser Tunggal",
      status: "published",
      organizerId: "org_antara",
      highDemand: true,
      purchaseLimit: 4,
      poster: "/images/events/sheila_on_7.jpg",
      description: "Konser akbar stadion Sheila on 7 bertajuk 'Tunggu Aku Di Jakarta'. Merayakan nostalgia lebih dari dua dekade karya musik bersama puluhan ribu Sheila Gank di Stadion Utama Gelora Bung Karno.",
      categories: [
        { id: "cat_so7_festa", name: "Festival A (Standing)", price: 750000, quota: 15000, sold: 14800 },
        { id: "cat_so7_festb", name: "Festival B (Standing)", price: 550000, quota: 20000, sold: 19500 },
        { id: "cat_so7_cat1", name: "CAT 1 (Numbered Seating)", price: 1250000, quota: 8000, sold: 8000 },
        { id: "cat_so7_cat2", name: "CAT 2 (Numbered Seating)", price: 950000, quota: 12000, sold: 11200 },
        { id: "cat_so7_vip", name: "VIP Lounge (Hospitality)", price: 2500000, quota: 1500, sold: 1450 },
      ],
    },
    {
      id: "evt_dewa19",
      name: "Dewa 19 featuring All Stars Stadium Tour 2026",
      venue: "Stadion Gelora Bung Karno",
      city: "Jakarta",
      date: "2026-12-19",
      time: "19:30",
      genre: "Konser Tunggal",
      status: "published",
      organizerId: "org_otello",
      highDemand: true,
      purchaseLimit: 4,
      poster: "/images/events/dewa_19.jpg",
      description: "Pagelaran mahakarya rock terbesar persembahan Dewa 19 berkolaborasi dengan musisi legendaris All Stars dunia. Tata panggung megah, 300+ moving lights, dan sound stadium kelas internasional.",
      categories: [
        { id: "cat_dewa_fest", name: "Festival Standing", price: 650000, quota: 18000, sold: 15200 },
        { id: "cat_dewa_cat1", name: "CAT 1 Silver Seated", price: 950000, quota: 10000, sold: 8900 },
        { id: "cat_dewa_cat2", name: "CAT 2 Gold Seated", price: 1450000, quota: 6000, sold: 5600 },
        { id: "cat_dewa_vip", name: "Diamond VIP Seated", price: 2200000, quota: 2000, sold: 1850 },
      ],
    },
    {
      id: "evt_synchronize",
      name: "Synchronize Festival 2026",
      venue: "Gambir Expo Kemayoran",
      city: "Jakarta",
      date: "2026-10-02",
      time: "13:00",
      genre: "Festival",
      status: "published",
      organizerId: "org_demajors",
      highDemand: false,
      purchaseLimit: 6,
      poster: "/images/events/synchronize_fest.jpg",
      description: "Festival musik multi-genre tahunan berskala nasional yang merayakan keberagaman musik Indonesia dari era 70-an hingga era kiwari di 6 panggung spektakuler.",
      categories: [
        { id: "cat_sync_pre", name: "3-Day Pass Presale", price: 450000, quota: 4000, sold: 4000 },
        { id: "cat_sync_reg", name: "3-Day Pass Regular", price: 650000, quota: 15000, sold: 11300 },
        { id: "cat_sync_day", name: "Daily Pass (1 Hari)", price: 275000, quota: 8000, sold: 5400 },
      ],
    },
    {
      id: "evt_hindia",
      name: "Hindia — Lagipula Hidup Akan Berakhir Concert",
      venue: "Tennis Indoor Senayan",
      city: "Jakarta",
      date: "2026-09-26",
      time: "19:00",
      genre: "Musik Indie",
      status: "published",
      organizerId: "org_sariwani",
      highDemand: true,
      purchaseLimit: 4,
      poster: "/images/events/hindia.jpg",
      description: "Konser perayaan album kedua Hindia 'Lagipula Hidup Akan Berakhir'. Visual panggung sinematik, tata suara imersif, dan penampilan bintang tamu spesial.",
      categories: [
        { id: "cat_hin_fest", name: "Festival Standing", price: 425000, quota: 2500, sold: 2450 },
        { id: "cat_hin_trib_a", name: "Tribun A (Numbered Seating)", price: 575000, quota: 1200, sold: 1180 },
        { id: "cat_hin_trib_b", name: "Tribun B", price: 375000, quota: 1500, sold: 1200 },
      ],
    },
    {
      id: "evt_tulus",
      name: "Tulus — Tur Manusia Jakarta",
      venue: "Beach City International Stadium Ancol",
      city: "Jakarta",
      date: "2026-11-07",
      time: "19:30",
      genre: "Konser Tunggal",
      status: "published",
      organizerId: "org_juni",
      highDemand: false,
      purchaseLimit: 4,
      poster: "/images/events/tulus.jpg",
      description: "Perayaan 11 tahun berkarya dan perjalanan album Manusia. Disertai lantunan orkestra megah di tepi pantai Beach City International Stadium Ancol.",
      categories: [
        { id: "cat_tul_fest", name: "Festival Emas", price: 550000, quota: 3500, sold: 2900 },
        { id: "cat_tul_vip", name: "VIP Seated", price: 1150000, quota: 1500, sold: 1350 },
        { id: "cat_tul_trib", name: "Tribun Reguler", price: 350000, quota: 2500, sold: 1950 },
      ],
    },
    {
      id: "evt_joyland",
      name: "Joyland Festival Jakarta 2026",
      venue: "GBK Baseball Stadium Senayan",
      city: "Jakarta",
      date: "2026-11-20",
      time: "14:00",
      genre: "Festival",
      status: "published",
      organizerId: "org_plainsong",
      highDemand: false,
      purchaseLimit: 6,
      poster: "/images/events/joyland.jpg",
      description: "Festival musik multi-disiplin ramah keluarga dengan panggung musik intim, pemutaran film outdoor, lokakarya seni, dan stand-up comedy di area hijau Senayan.",
      categories: [
        { id: "cat_joy_early", name: "3-Day Pass Early Entry", price: 880000, quota: 2000, sold: 1600 },
        { id: "cat_joy_reg", name: "3-Day Pass Regular", price: 1180000, quota: 5000, sold: 3400 },
        { id: "cat_joy_daily", name: "1-Day Pass", price: 480000, quota: 3000, sold: 1800 },
      ],
    },
    {
      id: "evt_we_the_fest",
      name: "We The Fest (WTF) 2026",
      venue: "GBK Sports Complex Senayan",
      city: "Jakarta",
      date: "2026-12-11",
      time: "15:00",
      genre: "Festival",
      status: "draft",
      organizerId: "org_ismaya",
      highDemand: true,
      purchaseLimit: 4,
      poster: "/images/events/we_the_fest.jpg",
      description: "Festival musim panas seni, mode, makanan, dan musik terbesar di Asia Tenggara persembahan Ismaya Live. Menampilkan musisi internasional dan lokal teratas.",
      categories: [
        { id: "cat_wtf_ga", name: "3-Day GA Presale", price: 1400000, quota: 5000, sold: 0 },
        { id: "cat_wtf_vib", name: "3-Day VIB (Very Important Banana)", price: 3200000, quota: 1500, sold: 0 },
      ],
    },
  ];
}

export function seedOrganizers() {
  return [
    { id: "org_antara", name: "Antara Suara", email: "contact@antarasuara.com", company: "PT Antara Lintas Nusantara", status: "approved", submittedAt: "2026-01-15" },
    { id: "org_otello", name: "Otello Asia", email: "info@otelloasia.com", company: "PT Otello Asia Promosindo", status: "approved", submittedAt: "2026-02-10" },
    { id: "org_demajors", name: "demajors & Dyandra", email: "festival@synchronizefestival.com", company: "PT Demi Musik Indonesia", status: "approved", submittedAt: "2026-03-05" },
    { id: "org_sariwani", name: "Sun Eater / Sariwani", email: "management@suneatercph.com", company: "PT Sariwani Kreasi Musik", status: "approved", submittedAt: "2026-04-12" },
    { id: "org_juni", name: "JUNI Concerts", email: "contact@junicp.com", company: "PT Juni Suara Kreasi", status: "approved", submittedAt: "2026-05-18" },
    { id: "org_plainsong", name: "Plainsong Live", email: "hello@plainsonglive.com", company: "PT Plainsong Nusantara", status: "approved", submittedAt: "2026-06-22" },
    { id: "org_ismaya", name: "Ismaya Live", email: "events@ismayagroup.com", company: "PT Ismaya Live Internasional", status: "approved", submittedAt: "2026-07-08" },
    { id: "org_soundfest", name: "Soundfest Kreasi", email: "promoter@soundfest.id", company: "CV Nada Suara Baru", status: "pending", submittedAt: "2026-08-25" },
  ];
}

export function seedOrders() {
  return [
    {
      id: "ord_2001",
      eventId: "evt_sheila",
      categoryId: "cat_so7_festa",
      qty: 2,
      total: 1500000,
      buyerName: "Dinda Ayu Saraswati",
      buyerEmail: "dinda@example.com",
      status: "paid",
      createdAt: "2026-08-20T10:12:00",
      flagged: false,
    },
    {
      id: "ord_2002",
      eventId: "evt_sheila",
      categoryId: "cat_so7_vip",
      qty: 4,
      total: 10000000,
      buyerName: "Jasa Tiket Cepat Online",
      buyerEmail: "tiketkilat88@tempmail.id",
      status: "paid",
      createdAt: "2026-08-20T10:12:28",
      flagged: true,
      flagReason: "4 tiket VIP dibeli dalam waktu 28 detik pertama dari akun anonim baru — terindikasi bot calo.",
    },
    {
      id: "ord_2003",
      eventId: "evt_dewa19",
      categoryId: "cat_dewa_cat1",
      qty: 2,
      total: 1900000,
      buyerName: "Bimo Prakoso",
      buyerEmail: "bimo.p@example.com",
      status: "refund_requested",
      createdAt: "2026-08-22T14:05:00",
      flagged: false,
    },
    {
      id: "ord_2004",
      eventId: "evt_synchronize",
      categoryId: "cat_sync_reg",
      qty: 2,
      total: 1300000,
      buyerName: "Sri Wulandari",
      buyerEmail: "sriwulan@example.com",
      status: "paid",
      createdAt: "2026-08-25T09:30:00",
      flagged: false,
    },
    {
      id: "ord_2005",
      eventId: "evt_hindia",
      categoryId: "cat_hin_fest",
      qty: 2,
      total: 850000,
      buyerName: "Kevin Sanjaya",
      buyerEmail: "kevin.s@example.com",
      status: "paid",
      createdAt: "2026-08-26T11:45:00",
      flagged: false,
    },
    {
      id: "ord_2006",
      eventId: "evt_tulus",
      categoryId: "cat_tul_vip",
      qty: 1,
      total: 1150000,
      buyerName: "Nadia Putri",
      buyerEmail: "nadia.p@example.com",
      status: "paid",
      createdAt: "2026-08-28T16:20:00",
      flagged: false,
    },
  ];
}

export function seedRefundRequests() {
  return [
    {
      id: "rfd_1",
      orderId: "ord_2003",
      reason: "Ada penugasan dinas kantor ke luar kota pada tanggal konser Dewa 19.",
      status: "pending",
      createdAt: "2026-08-29T08:30:00",
    },
  ];
}

export function seedSupportTickets() {
  return [
    {
      id: "sup_1",
      buyerName: "Dinda Ayu Saraswati",
      buyerEmail: "dinda@example.com",
      subject: "Konfirmasi nama pemegang tiket Sheila on 7",
      status: "open",
      createdAt: "2026-08-27T11:00:00",
      messages: [
        { from: "customer", text: "Halo admin, apakah tiket Festival A bisa dipindahtangankan ke adik saya jika KTP berbeda?", at: "2026-08-27T11:00:00" },
      ],
    },
    {
      id: "sup_2",
      buyerName: "Bimo Prakoso",
      buyerEmail: "bimo.p@example.com",
      subject: "Pengajuan pembatalan & refund konser Dewa 19",
      status: "open",
      createdAt: "2026-08-29T08:35:00",
      messages: [
        { from: "customer", text: "Mohon informasi estimasi proses verifikasi refund saya. Terima kasih.", at: "2026-08-29T08:35:00" },
      ],
    },
    {
      id: "sup_3",
      buyerName: "Sri Wulandari",
      buyerEmail: "sriwulan@example.com",
      subject: "Akses penonton kursi roda di Synchronize Fest",
      status: "closed",
      createdAt: "2026-08-25T14:10:00",
      messages: [
        { from: "customer", text: "Apakah ada viewing area khusus disabilitas di panggung utama?", at: "2026-08-25T14:10:00" },
        { from: "admin", text: "Halo kak Sri, ya betul tersedia platform khusus ramah disabilitas di sebelah kanan FOH panggung utama.", at: "2026-08-25T15:20:00" },
      ],
    },
  ];
}
