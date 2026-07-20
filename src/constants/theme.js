// Colors/spacing sampled from design/ mockups (medium phone reference).
export const colors = {
  background: "#F7F5F0",
  surface: "#FFFFFF",
  surfaceMuted: "#F0EEE8",
  primary: "#1E5631",
  primaryLight: "#EAF3EA",
  text: "#1B1B18",
  textMuted: "#6B6B63",
  border: "#E4E1D8",
  danger: "#C0392B",

  difficulty: {
    Easy: "#3E8E4F",
    Moderate: "#E0A526",
    Hard: "#D9622B",
    Expert: "#C0392B",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700", color: colors.text },
  h2: { fontSize: 20, fontWeight: "700", color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
};
