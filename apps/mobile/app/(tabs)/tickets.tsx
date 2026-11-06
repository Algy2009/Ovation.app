import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ticket, QrCode, MapPin, Calendar, ArrowRight, ShieldCheck } from "lucide-react-native";
import { api } from "../../lib/api";
import { THEME } from "../../lib/theme";

export default function MyTicketsScreen() {
  const router = useRouter();

  const { data: tickets = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: api.getMyTickets,
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={THEME.colors.primary} />
      }
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <ShieldCheck size={14} color={THEME.colors.success} />
          <Text style={styles.badgeText}>Anti-Calo & Dynamic Token</Text>
        </View>
        <Text style={styles.title}>E-Ticket Konser</Text>
        <Text style={styles.subtitle}>
          Tunjukkan dynamic QR code saat memasuki venue. Token berotasi tiap 30 detik.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Memuat e-ticket...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ticket size={48} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>Belum Ada Tiket</Text>
          <Text style={styles.emptySubtitle}>
            Kamu belum memiliki tiket konser aktif. Pesan tiket sekarang di menu Jelajahi!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.exploreButtonText}>Jelajahi Konser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        tickets.map((t) => (
          <View key={t.id} style={styles.ticketCard}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{t.category.name}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  t.isCheckedIn ? styles.statusBadgeUsed : styles.statusBadgeValid,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    t.isCheckedIn ? styles.statusTextUsed : styles.statusTextValid,
                  ]}
                >
                  {t.isCheckedIn ? "Sudah Digunakan" : "Siap Masuk"}
                </Text>
              </View>
            </View>

            <Text style={styles.eventTitle} numberOfLines={1}>
              {t.event.title}
            </Text>

            <View style={styles.infoRow}>
              <MapPin size={13} color={THEME.colors.primaryLight} />
              <Text style={styles.infoText} numberOfLines={1}>
                {t.event.venueName}, {t.event.venueCity}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Calendar size={13} color={THEME.colors.accent} />
              <Text style={styles.infoText}>{t.event.startDatetime.slice(0, 10)}</Text>
            </View>

            <View style={styles.ticketMeta}>
              <View>
                <Text style={styles.metaLabel}>Kode Tiket</Text>
                <Text style={styles.metaCode}>{t.ticketCode}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.metaLabel}>Atas Nama</Text>
                <Text style={styles.metaName}>{t.attendeeName}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.openQrButton}
              onPress={() => router.push(`/ticket/${t.id}`)}
            >
              <View style={styles.qrIconRow}>
                <QrCode size={16} color="#FFF" />
                <Text style={styles.openQrText}>Buka Dynamic QR Code</Text>
              </View>
              <ArrowRight size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))
      )}
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
  header: {
    marginBottom: THEME.spacing.lg,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: THEME.colors.success,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  centerContainer: {
    padding: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  exploreButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    marginTop: 20,
  },
  exploreButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  ticketCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.accent,
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  statusBadgeValid: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
  },
  statusBadgeUsed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statusTextValid: {
    color: THEME.colors.success,
  },
  statusTextUsed: {
    color: THEME.colors.textDim,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    flex: 1,
  },
  ticketMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
  },
  metaLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: THEME.colors.textDim,
  },
  metaCode: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: THEME.colors.text,
    marginTop: 2,
  },
  metaName: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.text,
    marginTop: 2,
  },
  openQrButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  qrIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  openQrText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
});

