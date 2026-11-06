import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ShieldCheck, User, Phone, Mail, CreditCard, LogOut, FileText, ChevronRight } from "lucide-react-native";
import { useAuth } from "../../lib/auth-context";
import { THEME } from "../../lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "C"}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || "Customer Ovation"}</Text>
        <Text style={styles.userEmail}>{user?.email || "dinda@example.com"}</Text>

        <View style={styles.verifiedPill}>
          <ShieldCheck size={13} color={THEME.colors.success} />
          <Text style={styles.verifiedText}>Identitas NIK Terikat Resmi</Text>
        </View>
      </View>

      {/* Identity & KTP Security Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Identitas & Keamanan Akun</Text>
        <Text style={styles.sectionSubtitle}>
          Data KTP/NIK kamu dienkripsi menggunakan AES-256 untuk mematuhi regulasi anti-calo konser.
        </Text>

        <View style={styles.dataRow}>
          <View style={styles.dataIconWrapper}>
            <FileText size={16} color={THEME.colors.accent} />
          </View>
          <View style={styles.dataTextWrapper}>
            <Text style={styles.dataLabel}>Nomor KTP (NIK)</Text>
            <Text style={styles.dataValue}>
              ************{user?.nikLast4 || "0004"}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>Valid</Text>
          </View>
        </View>

        <View style={styles.dataRow}>
          <View style={styles.dataIconWrapper}>
            <Phone size={16} color={THEME.colors.primaryLight} />
          </View>
          <View style={styles.dataTextWrapper}>
            <Text style={styles.dataLabel}>Nomor WhatsApp</Text>
            <Text style={styles.dataValue}>{user?.phone || "+6281311223344"}</Text>
          </View>
        </View>

        <View style={styles.dataRow}>
          <View style={styles.dataIconWrapper}>
            <Mail size={16} color={THEME.colors.primaryLight} />
          </View>
          <View style={styles.dataTextWrapper}>
            <Text style={styles.dataLabel}>Email E-Ticket</Text>
            <Text style={styles.dataValue}>{user?.email || "dinda@example.com"}</Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          logout();
          router.replace("/(auth)/login");
        }}
        style={styles.logoutButton}
      >
        <LogOut size={16} color={THEME.colors.danger} />
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </TouchableOpacity>
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
  profileHeader: {
    alignItems: "center",
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    marginTop: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.success,
  },
  sectionCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 14,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
  },
  dataIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dataTextWrapper: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 10,
    color: THEME.colors.textDim,
    textTransform: "uppercase",
  },
  dataValue: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "bold",
    color: THEME.colors.success,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderRadius: THEME.borderRadius.md,
    borderColor: "rgba(244, 63, 94, 0.3)",
    borderWidth: 1,
    paddingVertical: 14,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: "bold",
    color: THEME.colors.danger,
  },
});

