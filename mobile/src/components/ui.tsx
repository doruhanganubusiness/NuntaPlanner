import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { theme } from "../theme";

const c = theme.colors;

/** Container standard de ecran: fundal cald + scroll + padding. */
export function Screen({
  children,
  title,
  subtitle,
  refreshing,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  refreshing?: boolean;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      {title ? (
        <View style={styles.header}>
          <Text style={styles.h1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {refreshing ? (
        <ActivityIndicator color={c.primary} style={{ marginBottom: 12 }} />
      ) : null}
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={18} color={c.primary} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </Card>
  );
}

export function Field({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={c.mutedForeground}
        style={styles.input}
        {...props}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const bg = isPrimary ? c.primary : isDanger ? c.destructive : "transparent";
  const fg = isPrimary || isDanger ? "#ffffff" : c.foreground;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor: isPrimary || isDanger ? bg : c.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Rând etichetă/valoare (recomandări). */
export function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

/** Chip selectabil (multi-select pentru tip nuntă / stil). */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.accent : c.card,
          borderColor: selected ? c.primary : c.border,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? c.accentForeground : c.foreground,
          fontWeight: selected ? "700" : "500",
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={c.primary} size="large" />
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  screenContent: { padding: 16, paddingBottom: 40, gap: 14 },
  header: { marginBottom: 2 },
  h1: { fontSize: 24, fontWeight: "800", color: c.foreground },
  subtitle: { marginTop: 4, fontSize: 14, color: c.mutedForeground },
  card: {
    backgroundColor: c.card,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: c.border,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: c.foreground,
    marginBottom: 4,
  },
  muted: { color: c.mutedForeground, fontSize: 14, lineHeight: 20 },
  statCard: { flex: 1, gap: 6, padding: 14 },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: { color: c.mutedForeground, fontSize: 12, flexShrink: 1 },
  statValue: { fontSize: 20, fontWeight: "800", color: c.foreground },
  statHint: { fontSize: 11, color: c.mutedForeground },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: c.foreground },
  fieldHint: { fontSize: 12, color: c.mutedForeground },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: c.foreground,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
    paddingVertical: 10,
  },
  kvLabel: { color: c.mutedForeground, fontSize: 14 },
  kvValue: { color: c.foreground, fontSize: 14, fontWeight: "700" },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.background,
  },
});
