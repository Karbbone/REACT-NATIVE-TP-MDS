export const theme = {
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    primary: "#007AFF",
    primaryAlt: "#5856D6",
    success: "#34C759",
    danger: "#FF3B30",
    border: "#D0D4DA",
    borderLight: "#EEE",
    text: "#212121",
    textSecondary: "#666666",
    chipBorder: "#CCCCCC",
  },
  spacing: (factor: number) => factor * 8,
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    pill: 999,
    chip: 16,
  },
  typography: {
    titleLg: 22,
    titleMd: 18,
    body: 15,
    small: 12,
  },
};

// Styles communs réutilisables (optionnels)
export const common = {
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.typography.body,
    backgroundColor: theme.colors.surface,
  },
  buttonBase: {
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.chipBorder,
    borderRadius: theme.radius.chip,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
};
