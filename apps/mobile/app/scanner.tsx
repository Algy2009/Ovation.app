import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ScanLine,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Building2,
  Clock,
  User,
} from "lucide-react-native";
import { api } from "../lib/api";
import { THEME } from "../lib/theme";

interface ScanLogItem {
  id: string;
  code: string;
  name?: string;
  gate: string;
  status: string;
  valid: boolean;
  message: string;
  time: string;
}

const AVAILABLE_GATES = [
  "Main Gate VIP A",
  "Festival Gate Barat",
  "Reguler Gate Timur",
  "Tribun Gate Utara",
];

export default function MobileGateScannerScreen() {
  const router = useRouter();
  const [selectedGate, setSelectedGate] = useState(AVAILABLE_GATES[0]);
  const [ticketInput, setTicketInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScanLogItem | null>(null);
  const [history, setHistory] = useState<ScanLogItem[]>([]);

  async function handleValidate(rawCode?: string) {
    const code = (rawCode || ticketInput).trim();
    if (!code) {
      Alert.alert("Perhatian", "Harap masukkan atau pindai kode tiket.");
      return;
    }

    setLoading(true);

    let ticketCode = code;
    let dynamicQrToken = code;

    const parts = code.split("-");
    if (parts.length >= 4) {
      dynamicQrToken = code;
      ticketCode = parts.slice(0, parts.length - 1).join("-");
    }

    try {
      const res = await api.validateCheckIn({
        ticketCode,
        dynamicQrToken,
        gateName: selectedGate,
      });

      const logItem: ScanLogItem = {
        id: Date.now().toString(),
        code: ticketCode,
        name: res.ticket?.attendeeName || "Pengunjung",
        gate: selectedGate,
        status: res.status || (res.valid ? "ACCESS_GRANTED" : "REJECTED"),
        valid: Boolean(res.valid),
        message: res.message || "Tiket Terverifikasi",
        time: new Date().toLocaleTimeString("id-ID"),
      };

      setLastResult(logItem);
      setHistory((prev) => [logItem, ...prev.slice(0, 19)]);
      setTicketInput("");
    } catch (err: any) {
      const logItem: ScanLogItem = {
        id: Date.now().toString(),
        code: ticketCode,
        name: "-",
        gate: selectedGate,
        status: "REJECTED",
        valid: false,
        message: err.message || "Gagal memvalidasi tiket.",
        time: new Date().toLocaleTimeString("id-ID"),
      };
      setLastResult(logItem);
      setHistory((prev) => [logItem, ...prev.slice(0, 19)]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <ScanLine size={14} color={THEME.colors.primaryLight} />
          <Text style={styles.badgeText}>OFFICIAL GATE SCANNER APP</Text>
        </View>
        <Text style={styles.title}>Pemindai Gerbang Masuk</Text>
        <Text style={styles.subtitle}>
          Verifikasi dynamic rotating QR token tiket konser secara real-time di gerbang venue.
        </Text>
      </View>

      {/* Gate Selector */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Building2 size={16} color={THEME.colors.accent} />
          <Text style={styles.cardTitle}>Pilih Gerbang Masuk (Gate)</Text>
        </View>
        <View style={styles.gateRow}>
          {AVAILABLE_GATES.map((gate) => (
            <TouchableOpacity
              key={gate}
              onPress={() => setSelectedGate(gate)}
              style={[
                styles.gatePill,
                selectedGate === gate && styles.gatePillActive,
              ]}
            >
              <Text
                style={[
                  styles.gatePillText,
                  selectedGate === gate && styles.gatePillTextActive,
                ]}
              >
                {gate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Input Code / Scanner Area */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Input Barcode / Dynamic Token</Text>
        <Text style={styles.cardDesc}>
          Gunakan perangkat barcode gun scanner USB/Bluetooth atau masukkan kode tiket penonton.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="TKT-XXX-YYY-ZZZZZ-HMAC8..."
          placeholderTextColor={THEME.colors.textDim}
          value={ticketInput}
          onChangeText={setTicketInput}
          autoCapitalize="characters"
          onSubmitEditing={() => handleValidate()}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.validateBtn, loading && styles.disabledBtn]}
            onPress={() => handleValidate()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.validateBtnText}>Validasi Tiket</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Demo Simulator Buttons */}
        <View style={styles.simulatorRow}>
          <Text style={styles.simLabel}>Uji Cepat Demo:</Text>
          <TouchableOpacity
            style={styles.simBtn}
            onPress={() => handleValidate("TKT-SHE-FES-DEMO01-VALID123")}
          >
            <Text style={styles.simBtnText}>Uji Tiket Demo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Card */}
      {lastResult && (
        <View
          style={[
            styles.resultCard,
            lastResult.valid ? styles.resultSuccess : styles.resultError,
          ]}
        >
          <View style={styles.resultHeader}>
            {lastResult.valid ? (
              <CheckCircle2 size={24} color={THEME.colors.success} />
            ) : (
              <XCircle size={24} color={THEME.colors.danger} />
            )}
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text
                style={[
                  styles.resultStatus,
                  lastResult.valid ? styles.textSuccess : styles.textDanger,
                ]}
              >
                {lastResult.valid ? "AKSES DIIZINKAN" : "AKSES DITOLAK"}
              </Text>
              <Text style={styles.resultMessage}>{lastResult.message}</Text>
            </View>
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resLabel}>Kode Tiket</Text>
              <Text style={styles.resValMono}>{lastResult.code}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resLabel}>Pengunjung</Text>
              <Text style={styles.resVal}>{lastResult.name}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resLabel}>Gerbang</Text>
              <Text style={styles.resVal}>{lastResult.gate}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resLabel}>Waktu Scan</Text>
              <Text style={styles.resVal}>{lastResult.time}</Text>
            </View>
          </View>
        </View>
      )}

      {/* History Log */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock size={16} color={THEME.colors.textMuted} />
          <Text style={styles.cardTitle}>Riwayat Scan Sesi Ini ({history.length})</Text>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada riwayat pemindaian tiket.</Text>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View
                style={[
                  styles.historyDot,
                  item.valid ? styles.dotSuccess : styles.dotDanger,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyCode}>{item.code}</Text>
                <Text style={styles.historyMeta}>
                  {item.name} · {item.gate} · {item.time}
                </Text>
              </View>
              <Text
                style={[
                  styles.historyBadge,
                  item.valid ? styles.badgeSuccess : styles.badgeDanger,
                ]}
              >
                {item.valid ? "VALID" : "DITOLAK"}
              </Text>
            </View>
          ))
        )}
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
  header: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME.colors.primaryLight,
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
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  cardDesc: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginBottom: 12,
  },
  gateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gatePill: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: THEME.colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
  },
  gatePillActive: {
    backgroundColor: "rgba(124, 58, 237, 0.2)",
    borderColor: THEME.colors.primaryLight,
  },
  gatePillText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  gatePillTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.text,
    fontFamily: "monospace",
    fontSize: 13,
  },
  actionRow: {
    marginTop: 12,
  },
  validateBtn: {
    backgroundColor: THEME.colors.accent,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: "center",
  },
  validateBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  simulatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
  },
  simLabel: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  simBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  simBtnText: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontWeight: "600",
  },
  resultCard: {
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  resultError: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  resultStatus: {
    fontSize: 15,
    fontWeight: "900",
  },
  textSuccess: {
    color: THEME.colors.success,
  },
  textDanger: {
    color: THEME.colors.danger,
  },
  resultMessage: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  resultDetails: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: THEME.borderRadius.sm,
    gap: 6,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resLabel: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  resVal: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  resValMono: {
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  emptyText: {
    fontSize: 11,
    color: THEME.colors.textDim,
    textAlign: "center",
    marginVertical: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "rgba(255,255,255,0.05)",
    borderBottomWidth: 1,
    gap: 10,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSuccess: {
    backgroundColor: THEME.colors.success,
  },
  dotDanger: {
    backgroundColor: THEME.colors.danger,
  },
  historyCode: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: THEME.colors.text,
  },
  historyMeta: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  historyBadge: {
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: THEME.colors.success,
  },
  badgeDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: THEME.colors.danger,
  },
});

