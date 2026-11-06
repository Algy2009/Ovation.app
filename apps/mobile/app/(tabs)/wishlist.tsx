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
import { Heart, MapPin, Calendar, ArrowRight } from "lucide-react-native";
import { api } from "../../lib/api";
import { THEME } from "../../lib/theme";

export default function WishlistScreen() {
  const router = useRouter();

  const { data: wishlist = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["wishlist"],
    queryFn: api.getWishlist,
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
        <Text style={styles.title}>Wishlist Konser</Text>
        <Text style={styles.subtitle}>
          Daftar konser favorit yang kamu simpan untuk dipantau jadwal tiketnya.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={44} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>Wishlist Masih Kosong</Text>
          <Text style={styles.emptySubtitle}>
            Tekan ikon hati pada konser yang kamu sukai untuk menyimpannya di sini.
          </Text>
        </View>
      ) : (
        wishlist.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => router.push(`/event/${item.event?.id || item.eventId}`)}
            style={styles.wishlistCard}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {item.event?.title || "Konser Favorit"}
              </Text>
              <View style={styles.metaRow}>
                <MapPin size={12} color={THEME.colors.primaryLight} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.event?.venueName}, {item.event?.venueCity}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Calendar size={12} color={THEME.colors.accent} />
                <Text style={styles.metaText}>
                  {item.event?.startDatetime ? item.event.startDatetime.slice(0, 10) : "Segera"}
                </Text>
              </View>
            </View>

            <View style={styles.actionIcon}>
              <ArrowRight size={16} color={THEME.colors.accent} />
            </View>
          </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  centerContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    marginTop: 30,
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
  },
  wishlistCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: THEME.spacing.sm,
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
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
    marginBottom: 3,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
});

