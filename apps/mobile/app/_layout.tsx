import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/auth-context";
import { THEME } from "../lib/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: THEME.colors.background,
              },
              headerTintColor: THEME.colors.text,
              headerTitleStyle: {
                fontWeight: "bold",
              },
              contentStyle: {
                backgroundColor: THEME.colors.background,
              },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="event/[id]"
              options={{
                title: "Detail Konser",
                headerBackTitle: "Kembali",
              }}
            />
            <Stack.Screen
              name="queue/[id]"
              options={{
                title: "Virtual War Room",
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="checkout/[id]"
              options={{
                title: "Checkout Tiket",
              }}
            />
            <Stack.Screen
              name="ticket/[id]"
              options={{
                title: "E-Ticket Dynamic QR",
              }}
            />
            <Stack.Screen
              name="scanner"
              options={{
                title: "Gate Scanner Petugas",
                headerBackTitle: "Kembali",
              }}
            />
            <Stack.Screen
              name="(auth)/login"
              options={{
                title: "Masuk Akun",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="(auth)/register"
              options={{
                title: "Daftar Akun Baru",
                presentation: "modal",
              }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

