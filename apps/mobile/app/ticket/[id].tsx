import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import QRCode from "react-native-qrcode-svg";
import { ShieldCheck, Clock, MapPin, Calendar, AlertTriangle, Share2 } from "lucide-react-native";
import { api } from "../../lib/api";
import { THEME } from "../../lib/theme";

export default function MobileTicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [countdown, setCountdown] = useState(30);

  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api.getTicketDetail(id!),
    enabled: !!id,
  });

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
});

