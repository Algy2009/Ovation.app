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
import { api } from "../../lib/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !phone || !nik || !password) {
      Alert.alert("Perhatian", "Semua kolom wajib diisi.");
      return;
    }

    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      Alert.alert("Validasi NIK", "NIK KTP harus tepat 16 digit angka.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Validasi Password", "Password minimal harus 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validasi Password", "Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name,
        email,
        phone,
        nik,
        password,
      });

      // Update auth context state
      setUser({
        id: res.user?.id || `usr_${Date.now()}`,
        name: res.user?.name || name,
        email: res.user?.email || email,
        phone: res.user?.phone || phone,
        nikLast4: res.user?.nikLast4 || nik.slice(-4),
      });

      Alert.alert(
        "Registrasi Sukses",
        "Akun Anda berhasil didaftarkan dan NIK telah diamankan dengan enkripsi AES-256.",
        [{ text: "Mulai Jelajah", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (err: any) {
      Alert.alert("Gagal Registrasi", err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Buat Akun Baru</Text>
          <Text style={styles.subtitle}>
            Daftarkan identitas resmi untuk verifikasi anti-calo dan e-ticket konser
          </Text>
        </View>

        {/* Security Banner */}
        <View style={styles.secCard}>
          <Text style={styles.secIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.secTitle}>Perlindungan Identitas NIK</Text>
            <Text style={styles.secDesc}>
              NIK dienkripsi menggunakan AES-256-GCM. Hanya 4 digit terakhir yang dapat dilihat oleh staf gate check-in.
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.field}>
          <Text style={styles.label}>NAMA LENGKAP SESUAI KTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Dinda Ayu Saraswati"
            placeholderTextColor={THEME.colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>EMAIL RESMI</Text>
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
          <Text style={styles.label}>NO. WHATSAPP AKTIF</Text>
          <TextInput
            style={styles.input}
            placeholder="081234567890"
            placeholderTextColor={THEME.colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>NOMOR INDUK KEPENDUDUKAN (16 DIGIT NIK)</Text>
          <TextInput
            style={styles.input}
            placeholder="3171012345670004"
            placeholderTextColor={THEME.colors.textMuted}
            value={nik}
            onChangeText={setNik}
            keyboardType="numeric"
            maxLength={16}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD (MIN. 8 KARAKTER)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={THEME.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>KONFIRMASI PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={THEME.colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Daftar & Amankan Akun</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Sudah memiliki akun?</Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.footerLink}>Masuk di Sini</Text>
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
    paddingBottom: 50,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  secCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 12,
  },
  secIcon: {
    fontSize: 22,
  },
  secTitle: {
    color: THEME.colors.success,
    fontSize: 13,
    fontWeight: "700",
  },
  secDesc: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: THEME.colors.text,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
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
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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

