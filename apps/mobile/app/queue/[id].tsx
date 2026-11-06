import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Flame, Clock, ShieldCheck, Users, RefreshCw } from "lucide-react-native";
import { api } from "../../lib/api";
import { THEME } from "../../lib/theme";

export default function MobileQueueScreen() {
  const { id, next } = useLocalSearchParams<{ id: string; next?: string }>();
  const router = useRouter();

  const [queueToken, setQueueToken] = useState<string | null>(null);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [waitTime, setWaitTime] = useState(30);
  const [status, setStatus] = useState("JOINING");

  const targetCheckoutUrl = next ? decodeURIComponent(next) : `/checkout/${id}`;

  useEffect(() => {
    api
      .joinQueue(id!)
      .then((data) => {
        setQueueToken(data.queueToken);
        setQueueNumber(data.queueNumber);
        setPosition(data.position);
        setWaitTime(data.estimatedWaitSeconds || 30);
        setStatus(data.status);

        if (data.status === "ADMITTED") {
          setTimeout(() => {
            router.replace(`${targetCheckoutUrl}&token=${data.queueToken}`);
          }, 1200);
        }
      })
      .catch((err) => console.error("Mobile queue join error:", err));
  }, [id]);

  useEffect(() => {
    if (!queueToken || status === "ADMITTED") return;

    const interval = setInterval(() => {
      api
        .getQueueStatus(queueToken)
        .then((data) => {
          setStatus(data.status);
          if (data.position !== undefined) setPosition(data.position);
          if (data.estimatedWaitSeconds !== undefined) setWaitTime(data.estimatedWaitSeconds);

          if (data.canCheckout || data.status === "ADMITTED") {
            clearInterval(interval);
            setTimeout(() => {
              router.replace(`${targetCheckoutUrl}&token=${queueToken}`);
            }, 1000);
          }
        })
        .catch((err) => console.error("Poll error:", err));
    }, 2500);

    return () => clearInterval(interval);
  }, [queueToken, status]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Flame size={32} color="#FFF" />
        </View>

        <View style={styles.warBadge}>
          <Text style={styles.warBadgeText}>VIRTUAL WAR ROOM AKTIF</Text>
        </View>

        <Text style={styles.title}>
          {status === "ADMITTED" ? "Giliranmu Tiba!" : "Dalam Antrean Pembelian"}
        </Text>
        <Text style={styles.subtitle}>
          {status === "ADMITTED"
            ? "Mengarahkan kamu ke sesi pembayaran aman..."
            : "Sistem antrean membatasi trafik serentak agar proses checkout berjalan mulus tanpa gangguan server."}
        </Text>

        <View style={styles.counterBox}>
          {status === "ADMITTED" ? (
            <View style={styles.admittedBox}>
              <ShieldCheck size={36} color={THEME.colors.success} />
              <Text style={styles.admittedText}>Akses Checkout Terverifikasi</Text>
            </View>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.rankLabel}>POSISI ANTREAN SAAT INI</Text>
              <Text style={styles.rankNumber}>{position !== null ? position : "..."}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Clock size={14} color={THEME.colors.accent} />
                  <Text style={styles.metaText}>Estimasi: ~{waitTime}s</Text>
                </View>
                <View style={styles.metaCol}>
                  <Users size={14} color={THEME.colors.primaryLight} />
                  <Text style={styles.metaText}>Tiket: #{queueNumber || 1}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.noticeRow}>
          <RefreshCw size={12} color={THEME.colors.textMuted} />
          <Text style={styles.noticeText}>
            Jangan menutup aplikasi agar posisimu tidak terulang dari awal.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: "center",
    padding: THEME.spacing.md,
  },
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: THEME.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  warBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    marginBottom: 12,
  },
  warBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  counterBox: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    marginVertical: 20,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  admittedBox: {
    alignItems: "center",
    gap: 8,
  },
  admittedText: {
    fontSize: 13,
    fontWeight: "bold",
    color: THEME.colors.success,
  },
  rankLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.textDim,
    letterSpacing: 1,
  },
  rankNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: THEME.colors.accent,
    marginVertical: 6,
    fontFamily: "monospace",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noticeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: "center",
  },
});

