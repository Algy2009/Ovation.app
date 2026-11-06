export const THEME = {
  colors: {
    background: "#090A0F",
    surface: "#12141F",
    card: "#12141F",
    cardRaised: "#1A1D2E",
    border: "rgba(255, 255, 255, 0.08)",
    borderActive: "rgba(124, 58, 237, 0.4)",

    primary: "#7C3AED",
    primaryHover: "#6D28D9",
    primaryLight: "#A78BFA",

    accent: "#F59E0B",
    accentLight: "#FBBF24",

    success: "#10B981",
    danger: "#F43F5E",

    text: "#F8FAFC",
    textMuted: "#94A3B8",
    textDim: "#64748B",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    full: 9999,
  },
} as const;
