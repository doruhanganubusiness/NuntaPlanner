/**
 * Paleta și spacing-ul aplicației — aliniate cu site-ul NuntaPlanner.
 * Aplicația rulează forțat în modul light (vezi app.json → userInterfaceStyle),
 * deci avem un singur set de culori.
 */
export const theme = {
  colors: {
    background: "#fbf7f4",
    card: "#ffffff",
    foreground: "#2a2320",
    muted: "#f3ece7",
    mutedForeground: "#7c6f68",
    border: "#e8ddd6",
    primary: "#b04a6f",
    primaryForeground: "#ffffff",
    accent: "#f6e9ee",
    accentForeground: "#7a2f49",
    success: "#3f7d58",
    warning: "#b4791f",
    destructive: "#c0392b",
    // Bara de status: fundal alb + text/iconițe negre (cerință de proiect).
    statusBarBg: "#ffffff",
  },
  radius: 14,
  spacing: (n: number) => n * 4,
} as const;
