import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Flame, MapPin, Calendar, Sparkles } from "lucide-react-native";
import { api, API_BASE_URL } from "../../lib/api";
import { THEME } from "../../lib/theme";

const GENRES = ["Semua", "Pop & R&B", "Rock & Metal", "Music Festival", "Indie & Alternative"];

export default function DiscoverScreen() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["events"],
    queryFn: api.getEvents,
  });

  const filteredEvents = events.filter((e) => {
    const matchesGenre = selectedGenre === "Semua" || e.genre === selectedGenre;
    const matchesSearch =
      `${e.title || e.name} ${e.venue} ${e.city}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={THEME.colors.primary} />
      }
    >
      {/* Hero Welcome Banner */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <Sparkles size={14} color={THEME.colors.accent} />
          <Text style={styles.badgeText}>Platform Resmi Tiket Konser</Text>
        </View>
        <Text style={styles.heroTitle}>Beli Tiket Resmi, Bebas Calo & Antre</Text>
        <Text style={styles.heroSubtitle}>
          Dilengkapi antrean virtual war room & Dynamic QR code berotasi 30 detik.
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={18} color={THEME.colors.textMuted} />
        <TextInput
          placeholder="Cari artis, konser, atau venue..."
          placeholderTextColor={THEME.colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Genre Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setSelectedGenre(g)}
            style={[styles.genrePill, selectedGenre === g && styles.genrePillActive]}
          >
            <Text style={[styles.genreText, selectedGenre === g && styles.genreTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Event Cards Listing */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Konser Pilihan</Text>
        <Text style={styles.sectionSubtitle}>{filteredEvents.length} Event Aktif</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Memuat konser...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada konser yang cocok dengan pencarian.</Text>
        </View>
      ) : (
        filteredEvents.map((item) => {
          const lowestPrice = item.categories?.reduce(
            (min: number, c: any) => (c.price < min ? c.price : min),
            item.categories?.[0]?.price || 0
          ) || 0;

          const posterUrl = item.poster?.startsWith("http")
            ? item.poster
            : `${API_BASE_URL}${item.poster || "/images/events/dewa_19.jpg"}`;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => router.push(`/event/${item.id}`)}
              style={styles.eventCard}
            >
              {/* Event Poster Banner */}
              <View style={styles.posterWrapper}>
                <Image source={{ uri: posterUrl }} style={styles.posterImage} resizeMode="cover" />
                <View style={styles.posterOverlay} />

                <View style={styles.posterBadges}>
                  {item.highDemand && (
                    <View style={styles.warBadge}>
                      <Flame size={12} color="#FFF" />
                      <Text style={styles.warBadgeText}>WAR TICKET</Text>
                    </View>
                  )}
                  <View style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{item.genre}</Text>
                  </View>
                </View>
              </View>

              {/* Event Content Info */}
              <View style={styles.cardContent}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {item.title || item.name}
                </Text>

                <View style={styles.metaRow}>
                  <MapPin size={13} color={THEME.colors.primaryLight} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.venue}, {item.city}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Calendar size={13} color={THEME.colors.accent} />
                  <Text style={styles.metaText}>{item.date}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Mulai Dari</Text>
                    <Text style={styles.priceValue}>
                      Rp {lowestPrice.toLocaleString("id-ID")}
                    </Text>
                  </View>

                  <View style={styles.ctaButton}>
                    <Text style={styles.ctaText}>Beli Tiket</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
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
  heroCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: THEME.colors.accent,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.colors.text,
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    gap: 10,
    marginBottom: THEME.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
  },
  genreScroll: {
    marginBottom: THEME.spacing.md,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginRight: 8,
  },
  genrePillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  genreText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  genreTextActive: {
    color: "#FFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 40,
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
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    overflow: "hidden",
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  posterWrapper: {
    height: 160,
    width: "100%",
    position: "relative",
    backgroundColor: "#161926",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  posterBadges: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  warBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  warBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFF",
  },
  genreBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  genreBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  cardContent: {
    padding: 14,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
  },
  priceLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: THEME.colors.textDim,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "900",
    color: THEME.colors.accent,
  },
  ctaButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFF",
  },
});

