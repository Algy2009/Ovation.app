import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Users, Flame, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { api, API_BASE_URL } from "../../lib/api";
import { THEME } from "../../lib/theme";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.getEvent(id!),
    enabled: !!id,
  });

  if (isLoading || !event) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Memuat detail konser...</Text>
      </View>
    );
  }

  const activeCategory =
    event.categories?.find((c: any) => c.id === selectedCategoryId) || event.categories?.[0];

  const posterUrl = event.poster?.startsWith("http")
    ? event.poster
    : `${API_BASE_URL}${event.poster || "/images/events/dewa_19.jpg"}`;

  function handleProceedToBuy() {
    const targetUrl = `/checkout/${event.id}?category=${activeCategory?.id}`;
    if (event.highDemand || event.warTicketActive) {
      router.push(`/queue/${event.id}?next=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: posterUrl }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay} />
          {event.highDemand && (
            <View style={styles.warBannerBadge}>
              <Flame size={14} color="#FFF" />
              <Text style={styles.warBannerText}>VIRTUAL WAR ROOM AKTIF</Text>
            </View>
          )}
        </View>

        {/* Title & Metadata */}
        <View style={styles.titleSection}>
          <View style={styles.genreBadge}>
            <Text style={styles.genreBadgeText}>{event.genre}</Text>
          </View>
          <Text style={styles.titleText}>{event.title || event.name}</Text>

          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <MapPin size={15} color={THEME.colors.primaryLight} />
              <Text style={styles.metaText}>{event.venue}, {event.city}</Text>
            </View>
            <View style={styles.metaRow}>
              <Calendar size={15} color={THEME.colors.accent} />
              <Text style={styles.metaText}>{event.date} • {event.time || "19:00 WIB"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Users size={15} color={THEME.colors.success} />
              <Text style={styles.metaText}>Maksimal {event.purchaseLimit || 4} tiket per transaksi</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Tentang Konser</Text>
          <Text style={styles.bodyText}>
            {event.description || "Informasi konser resmi dipersembahkan oleh promotor terverifikasi."}
          </Text>
        </View>

        {/* Ticket Tier Category Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Pilih Kategori Tiket</Text>
          <Text style={styles.sectionSubtitle}>
            Pilih kategori tiket yang tersedia sebelum melanjutkan checkout.
          </Text>

          {event.categories?.map((cat: any) => {
            const isSelected = activeCategory?.id === cat.id;
            const remaining = cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota - (cat.sold || 0);
            const isSoldOut = remaining <= 0;

            return (
              <TouchableOpacity
                key={cat.id}
                disabled={isSoldOut}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.tierCard,
                  isSelected && styles.tierCardActive,
                  isSoldOut && styles.tierCardDisabled,
                ]}
              >
                <View style={styles.tierHeader}>
                  <View>
                    <Text style={styles.tierName}>{cat.name}</Text>
                    <Text style={styles.tierType}>
                      {cat.isStanding ? "Standing Festival" : "Numbered Seating"}
                    </Text>
                  </View>
                  <Text style={styles.tierPrice}>Rp {Number(cat.price).toLocaleString("id-ID")}</Text>
                </View>

                <View style={styles.tierFooter}>
                  <Text
                    style={[
                      styles.tierStock,
                      isSoldOut ? styles.stockSoldOut : styles.stockAvailable,
                    ]}
                  >
                    {isSoldOut ? "Habis Terjual" : `Tersisa ${remaining} tiket`}
                  </Text>
                  {isSelected && <CheckCircle2 size={16} color={THEME.colors.accent} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Kategori Terpilih</Text>
          <Text style={styles.bottomBarPrice}>
            Rp {Number(activeCategory?.price || 0).toLocaleString("id-ID")}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleProceedToBuy}
          style={styles.buyButton}
        >
          <Text style={styles.buyButtonText}>Pesan Tiket</Text>
          <ArrowRight size={16} color="#FFF" />
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
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  bannerContainer: {
    height: 220,
    width: "100%",
    position: "relative",
    backgroundColor: "#161926",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  warBannerBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  warBannerText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFF",
  },
  titleSection: {
    padding: THEME.spacing.md,
  },
  genreBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderColor: "rgba(124, 58, 237, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    marginBottom: 8,
  },
  genreBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.primaryLight,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.colors.text,
    lineHeight: 28,
  },
  metaBox: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginTop: 6,
  },
  tierCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: THEME.borderRadius.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  tierCardActive: {
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderColor: THEME.colors.primary,
  },
  tierCardDisabled: {
    opacity: 0.4,
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tierName: {
    fontSize: 13,
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  tierType: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.accent,
  },
  tierFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopColor: "rgba(255,255,255,0.04)",
    borderTopWidth: 1,
  },
  tierStock: {
    fontSize: 11,
    fontWeight: "600",
  },
  stockAvailable: {
    color: THEME.colors.success,
  },
  stockSoldOut: {
    color: THEME.colors.danger,
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
  bottomBarLabel: {
    fontSize: 9,
    color: THEME.colors.textDim,
    textTransform: "uppercase",
  },
  bottomBarPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.colors.accent,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFF",
  },
});

