import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ShieldCheck, QrCode, Building2, Wallet, CreditCard, ArrowRight } from "lucide-react-native";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { THEME } from "../../lib/theme";

const PAYMENT_METHODS = [
  { id: "QRIS", name: "QRIS (GoPay, OVO, Dana, Semua Bank)", icon: QrCode },
  { id: "BCA_VA", name: "BCA Virtual Account", icon: Building2 },
  { id: "MANDIRI_VA", name: "Mandiri Virtual Account", icon: Building2 },
  { id: "BNI_VA", name: "BNI Virtual Account", icon: Building2 },
  { id: "GOPAY", name: "GoPay / E-Wallet", icon: Wallet },
  { id: "CREDIT_CARD", name: "Kartu Kredit / Debit Visa", icon: CreditCard },
];

export default function MobileCheckoutScreen() {
  const { id, category: categoryIdParam, token: queueToken } = useLocalSearchParams<{
    id: string;
    category?: string;
    token?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [qty, setQty] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("QRIS");
  const [attendeeName, setAttendeeName] = useState(user?.name || "Dinda Ayu Saraswati");
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || "dinda@example.com");
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || "081311223344");
  const [attendeeNik, setAttendeeNik] = useState("3171012304900001");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.getEvent(id!),
    enabled: !!id,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isLoading || !event) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  const category =
    event.categories?.find((c: any) => c.id === categoryIdParam) || event.categories?.[0];

  const unitPrice = category ? Number(category.price) : 0;
  const subtotal = unitPrice * qty;
  const platformFee = Math.round(subtotal * 0.05);
  const adminFee = 5000;
  const finalAmount = subtotal + platformFee + adminFee;

  async function handleCheckout() {
    setSubmitting(true);
    try {
      const payload = {
        eventId: event.id,
        categoryId: category.id,
        qty,
        paymentMethod: selectedPayment,
        queueToken,
        attendees: [
          {
            name: attendeeName,
            email: attendeeEmail,
            phone: attendeePhone,
            nik: attendeeNik,
          },
        ],
      };

      const result = await api.checkout(payload);
      // Navigate to tickets tab
      router.replace("/(tabs)/tickets");
    } catch (err: any) {
      Alert.alert("Checkout Gagal", err.message || "Terjadi kesalahan saat memproses pesanan.");
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Timer Holding Alert */}
        <View style={styles.timerBar}>
          <Clock size={14} color={THEME.colors.accent} />
          <Text style={styles.timerText}>
            Waktu Reservasi Kuota: <Text style={styles.timerValue}>{formatTimer(timeLeft)}</Text>
          </Text>
        </View>

        {/* Event & Category Card */}
        <View style={styles.card}>
          <Text style={styles.eventTitle}>{event.title || event.name}</Text>
          <Text style={styles.eventMeta}>{event.venue}, {event.city}</Text>

          <View style={styles.tierPill}>
            <Text style={styles.tierPillText}>{category?.name}</Text>
            <Text style={styles.tierPillPrice}>
              Rp {unitPrice.toLocaleString("id-ID")} / tiket
            </Text>
          </View>

          {/* Quantity Controls */}
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Jumlah Tiket (Maks. 4)</Text>
            <View style={styles.qtyButtons}>
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setQty(num)}
                  style={[styles.qtyBtn, qty === num && styles.qtyBtnActive]}
                >
                  <Text style={[styles.qtyBtnText, qty === num && styles.qtyBtnTextActive]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Attendee Info Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Identitas Penonton</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap (Sesuai KTP)</Text>
            <TextInput
              style={styles.input}
              value={attendeeName}
              onChangeText={setAttendeeName}
              placeholderTextColor={THEME.colors.textDim}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NIK KTP (16 Digit - Enkripsi AES)</Text>
            <TextInput
              style={[styles.input, { fontFamily: "monospace" }]}
              value={attendeeNik}
              onChangeText={setAttendeeNik}
              keyboardType="numeric"
              maxLength={16}
              placeholderTextColor={THEME.colors.textDim}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={attendeePhone}
              onChangeText={setAttendeePhone}
              keyboardType="phone-pad"
              placeholderTextColor={THEME.colors.textDim}
            />
          </View>
        </View>

        {/* Payment Channel Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Metode Pembayaran</Text>

          {PAYMENT_METHODS.map((pm) => {
            const Icon = pm.icon;
            const isSelected = selectedPayment === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelectedPayment(pm.id)}
                style={[styles.paymentRow, isSelected && styles.paymentRowActive]}
              >
                <View style={styles.paymentIcon}>
                  <Icon size={16} color={isSelected ? THEME.colors.accent : THEME.colors.textMuted} />
                </View>
                <Text style={[styles.paymentName, isSelected && styles.paymentNameActive]}>
                  {pm.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rincian Tagihan</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceItemLabel}>{category?.name} ({qty}x)</Text>
            <Text style={styles.priceItemVal}>Rp {subtotal.toLocaleString("id-ID")}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceItemLabel}>Platform Fee (5%)</Text>
            <Text style={styles.priceItemVal}>Rp {platformFee.toLocaleString("id-ID")}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceItemLabel}>Biaya Layanan Gerbang</Text>
            <Text style={styles.priceItemVal}>Rp {adminFee.toLocaleString("id-ID")}</Text>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>Rp {finalAmount.toLocaleString("id-ID")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Pay Button */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalCaption}>Total Tagihan</Text>
          <Text style={styles.totalAmount}>Rp {finalAmount.toLocaleString("id-ID")}</Text>
        </View>

        <TouchableOpacity
          disabled={submitting}
          activeOpacity={0.88}
          onPress={handleCheckout}
          style={styles.payButton}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Bayar Tiket</Text>
              <ArrowRight size={16} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.md,
    paddingBottom: 110,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
  },
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  timerText: {
    fontSize: 11,
    color: THEME.colors.accent,
  },
  timerValue: {
    fontWeight: "bold",
    fontFamily: "monospace",
    color: "#FFF",
  },
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.colors.text,
  },
  eventMeta: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  tierPill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    borderColor: "rgba(124, 58, 237, 0.25)",
    borderWidth: 1,
  },
  tierPillText: {
    fontSize: 12,
    fontWeight: "bold",
    color: THEME.colors.primaryLight,
  },
  tierPillPrice: {
    fontSize: 12,
    fontWeight: "900",
    color: THEME.colors.accent,
  },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
  },
  qtyLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  qtyButtons: {
    flexDirection: "row",
    gap: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  qtyBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: THEME.colors.textMuted,
  },
  qtyBtnTextActive: {
    color: "#FFF",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.textDim,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: THEME.borderRadius.sm,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: THEME.colors.text,
    fontSize: 12,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: 6,
    gap: 10,
  },
  paymentRowActive: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: THEME.colors.accent,
  },
  paymentIcon: {
    width: 28,
    height: 28,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentName: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textMuted,
    flex: 1,
  },
  paymentNameActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  priceItemLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  priceItemVal: {
    fontSize: 11,
    color: THEME.colors.text,
    fontWeight: "600",
  },
  totalRow: {
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.colors.accent,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.card,
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalCaption: {
    fontSize: 9,
    color: THEME.colors.textDim,
    textTransform: "uppercase",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.colors.accent,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
});

