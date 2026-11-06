import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { THEME } from "../../lib/theme";
import { useAuth } from "../../lib/auth-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Perhatian", "Mohon isi email dan password Anda.");
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        Alert.alert("Sukses", "Berhasil masuk ke akun Ovation!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    setEmail("dinda@example.com");
    setPassword("customer123");
    setTimeout(async () => {
      setLoading(true);
      await login("dinda@example.com", "customer123");
      setLoading(false);
      Alert.alert("Sukses Demo", "Masuk sebagai Dinda Ayu Saraswati (Customer)", [
        { text: "Lanjutkan", onPress: () => router.back() },
      ]);
    }, 150);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>OVATION</Text>
          <Text style={styles.brandSubtitle}>
            Masuk untuk war ticket & akses dynamic QR e-ticket
          </Text>
        </View>

        {/* Demo Fast Pass */}
        <TouchableOpacity style={styles.demoCard} onPress={handleDemoLogin}>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>⚡ 1-CLICK DEMO</Text>
          </View>
          <Text style={styles.demoTitle}>Masuk sebagai Dinda Ayu (Customer)</Text>
          <Text style={styles.demoSubtitle}>
            Akun terverifikasi NIK dengan e-ticket konser aktif
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>ATAU MASUK MANUAL</Text>
          <View style={styles.divLine} />
        </View>

        {/* Form Inputs */}
        <View style={styles.field}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            placeholderTextColor={THEME.colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={THEME.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Masuk ke Akun</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Belum punya akun?</Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={styles.footerLink}>Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    color: THEME.colors.text,
  },
  brandSubtitle: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  demoCard: {
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.35)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  demoBadge: {
    alignSelf: "flex-start",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  demoBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  demoTitle: {
    color: THEME.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  demoSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  divText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginHorizontal: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: THEME.colors.text,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  footerLink: {
    color: THEME.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
});

