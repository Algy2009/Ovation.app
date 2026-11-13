import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-native-qrcode-svg";
import { ShieldCheck, Clock, MapPin, Calendar, AlertTriangle, Share2, RotateCcw, X, CheckCircle } from "lucide-react-native";
import { api } from "../../lib/api";
import { THEME } from "../../lib/theme";

export default function MobileTicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [countdown, setCountdown] = useState(30);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundStatusMessage, setRefundStatusMessage] = useState("");

  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api.getTicketDetail(id!),
    enabled: !!id,
  });

  async function handleSubmitRefund() {
    if (!refundReason.trim()) {
      Alert.alert("Perhatian", "Alasan refund wajib diisi.");
      return;
    }
    if (!bankName.trim() || !bankAccountNo.trim() || !bankAccountName.trim()) {
      Alert.alert("Perhatian", "Data rekening pengembalian dana wajib dilengkapi.");
      return;
    }

    setSubmittingRefund(true);
    try {
      await api.requestRefund(ticket.orderId, {
        reason: refundReason,
        bankName,
        bankAccountNo,
        bankAccountName,
      });
      setRefundStatusMessage("Permohonan refund berhasil dikirim. Menunggu verifikasi promotor.");
      setShowRefundModal(false);
      Alert.alert("Sukses", "Permohonan refund Anda berhasil diajukan.");
      refetch();
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Gagal mengajukan permohonan refund.");
    } finally {
      setSubmittingRefund(false);
    }
  }

  // 30-second token rotation countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refetch();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading || !ticket) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Memuat Dynamic QR Ticket...</Text>
      </View>
    );
  }

  const qrValue = ticket.dynamicQrToken || `${ticket.ticketCode}-DEMO`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Main Ticket Card */}
      <View style={styles.ticketCard}>
        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.badgeRow}>
            <ShieldCheck size={12} color={THEME.colors.success} />
            <Text style={styles.badgeText}>E-TICKET RESMI TERVERIFIKASI</Text>
          </View>
          <Text style={styles.eventTitle}>{ticket.event.title}</Text>
          <Text style={styles.eventVenue}>{ticket.event.venueName}, {ticket.event.venueCity}</Text>
          <Text style={styles.eventDate}>{ticket.event.startDatetime.slice(0, 10)}</Text>
        </View>

        {/* QR Code Canvas Area */}
        <View style={styles.qrSection}>
          <View style={styles.qrFrame}>
            <QRCode
              value={qrValue}
              size={180}
              color="#090A0F"
              backgroundColor="#FFFFFF"
            />
          </View>

          {/* Rotating Timer Badge */}
          <View style={styles.timerPill}>
            <Clock size={13} color={THEME.colors.accent} />
            <Text style={styles.timerPillText}>
              Berotasi otomatis: <Text style={styles.timerSec}>{countdown} detik</Text>
            </Text>
          </View>

          <Text style={styles.qrCaption}>
            Tunjukkan QR Code ini di gerbang masuk gate venue.
          </Text>
        </View>

        {/* Anti-screenshot Warning */}
        <View style={styles.warningBox}>
          <AlertTriangle size={14} color={THEME.colors.accent} />
          <Text style={styles.warningText}>
            Tangkapan layar (screenshot) tidak dapat dipindai oleh scanner resmi.
          </Text>
        </View>

        {/* Ticket Attributes */}
        <View style={styles.detailsTable}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kategori</Text>
            <Text style={styles.detailValueAccent}>{ticket.category.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kode Tiket</Text>
            <Text style={styles.detailValueMono}>{ticket.ticketCode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Atas Nama</Text>
            <Text style={styles.detailValue}>{ticket.attendeeName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>NIK KTP</Text>
            <Text style={styles.detailValueMono}>************{ticket.attendeeNikLast4}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status Pintu</Text>
            <Text
              style={[
                styles.statusValue,
                ticket.isCheckedIn ? styles.statusValueUsed : styles.statusValueValid,
              ]}
            >
              {ticket.isCheckedIn ? "Sudah Digunakan" : "Valid (Siap Scan)"}
            </Text>
          </View>
        </View>
      </View>

      {/* Refund Success Banner */}
      {refundStatusMessage ? (
        <View style={styles.successBanner}>
          <CheckCircle size={16} color={THEME.colors.success} />
          <Text style={styles.successBannerText}>{refundStatusMessage}</Text>
        </View>
      ) : null}

      {/* Refund Action Card (Only if ticket is unused and orderId is present) */}
      {!ticket.isCheckedIn && ticket.orderId && !refundStatusMessage ? (
        <View style={styles.refundCard}>
          <View style={styles.refundCardHeader}>
            <RotateCcw size={16} color={THEME.colors.accent} />
            <Text style={styles.refundTitle}>Pengembalian Dana (Refund)</Text>
          </View>
          <Text style={styles.refundDescription}>
            Berhalangan hadir sebelum konser dimulai? Anda dapat mengajukan permohonan refund dengan menyertakan alasan dan data rekening pencairan.
          </Text>
          <TouchableOpacity
            style={styles.refundButton}
            onPress={() => setShowRefundModal(true)}
          >
            <Text style={styles.refundButtonText}>Ajukan Refund Tiket</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Refund Request Modal */}
      <Modal
        visible={showRefundModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRefundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RotateCcw size={18} color={THEME.colors.accent} />
                <Text style={styles.modalTitle}>Form Pengajuan Refund</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRefundModal(false)}>
                <X size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Alasan Pembatalan / Refund *</Text>
              <TextInput
                style={[styles.inputField, { height: 70, textAlignVertical: "top" }]}
                placeholder="Contoh: Kondisi medis mendesak, berhalangan dinas..."
                placeholderTextColor={THEME.colors.textDim}
                multiline
                value={refundReason}
                onChangeText={setRefundReason}
              />

              <Text style={styles.inputLabel}>Nama Bank / e-Wallet *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="BCA / Mandiri / BNI / BRI / GoPay"
                placeholderTextColor={THEME.colors.textDim}
                value={bankName}
                onChangeText={setBankName}
              />

              <Text style={styles.inputLabel}>Nomor Rekening / No. HP e-Wallet *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="1234567890"
                keyboardType="numeric"
                placeholderTextColor={THEME.colors.textDim}
                value={bankAccountNo}
                onChangeText={setBankAccountNo}
              />

              <Text style={styles.inputLabel}>Nama Pemilik Rekening *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Nama sesuai buku tabungan"
                placeholderTextColor={THEME.colors.textDim}
                value={bankAccountName}
                onChangeText={setBankAccountName}
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowRefundModal(false)}
                  disabled={submittingRefund}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submittingRefund && styles.disabledBtn]}
                  onPress={handleSubmitRefund}
                  disabled={submittingRefund}
                >
                  {submittingRefund ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Kirim Permohonan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.md,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  ticketCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    overflow: "hidden",
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  ticketHeader: {
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    padding: THEME.spacing.md,
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.06)",
    borderBottomWidth: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: THEME.colors.success,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.colors.text,
    textAlign: "center",
  },
  eventVenue: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  eventDate: {
    fontSize: 11,
    fontWeight: "bold",
    color: THEME.colors.accent,
    marginTop: 2,
  },
  qrSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  qrFrame: {
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: THEME.borderRadius.md,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    marginTop: 16,
  },
  timerPillText: {
    fontSize: 11,
    color: THEME.colors.accent,
  },
  timerSec: {
    fontWeight: "bold",
    fontFamily: "monospace",
    color: "#FFF",
  },
  qrCaption: {
    fontSize: 10,
    color: THEME.colors.textDim,
    textAlign: "center",
    marginTop: 8,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    padding: 10,
    marginHorizontal: 14,
    borderRadius: THEME.borderRadius.sm,
    borderColor: "rgba(245, 158, 11, 0.2)",
    borderWidth: 1,
  },
  warningText: {
    fontSize: 10,
    color: THEME.colors.accent,
    flex: 1,
    lineHeight: 14,
  },
  detailsTable: {
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  detailValueAccent: {
    fontSize: 12,
    fontWeight: "bold",
    color: THEME.colors.accent,
  },
  detailValueMono: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  statusValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  statusValueValid: {
    color: THEME.colors.success,
  },
  statusValueUsed: {
    color: THEME.colors.textDim,
  },
  refundCard: {
    marginTop: 16,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    borderColor: "rgba(245, 158, 11, 0.25)",
    borderWidth: 1,
  },
  refundCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  refundTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  refundDescription: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 16,
    marginBottom: 12,
  },
  refundButton: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: THEME.colors.accent,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  refundButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: THEME.colors.accent,
  },
  successBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    padding: 12,
    borderRadius: THEME.borderRadius.md,
  },
  successBannerText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.success,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textMuted,
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.text,
    fontSize: 12,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: THEME.colors.accent,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

