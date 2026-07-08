import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Button, Card, Field, Muted, Screen, SectionTitle } from "../../components/ui";
import { useSession } from "../../lib/session";
import { supabase } from "../../lib/supabase";
import { theme } from "../../theme";

const SITE = "https://nuntaplanner.vercel.app";

const SITE_LINKS: {
  label: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Pentru miri", path: "/pentru-miri", icon: "heart-outline" },
  { label: "Director furnizori", path: "/furnizori", icon: "storefront-outline" },
  { label: "Zone", path: "/zone", icon: "map-outline" },
  { label: "Blog", path: "/blog", icon: "newspaper-outline" },
  { label: "Termeni și condiții", path: "/termeni-si-conditii", icon: "document-text-outline" },
  { label: "Confidențialitate", path: "/confidentialitate", icon: "shield-checkmark-outline" },
  { label: "Politica de cookies", path: "/politica-cookies", icon: "settings-outline" },
];

function LinkRow({
  label,
  path,
  icon,
  last,
}: {
  label: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={() => WebBrowser.openBrowserAsync(`${SITE}${path}`)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.border,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Text style={{ flex: 1, fontSize: 15, color: theme.colors.foreground }}>
        {label}
      </Text>
      <Ionicons name="open-outline" size={16} color={theme.colors.mutedForeground} />
    </Pressable>
  );
}

export default function GeneralScreen() {
  const { session, signOut } = useSession();
  const email = session?.user?.email ?? "";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    let active = true;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const saveProfile = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null, phone: phone.trim() || null })
      .eq("id", userId);
    setSaving(false);
    if (error) Alert.alert("Eroare", error.message);
    else Alert.alert("Salvat", "Profilul a fost actualizat.");
  };

  const confirmLogout = () =>
    Alert.alert("Deconectare", "Sigur vrei să te deconectezi?", [
      { text: "Anulează", style: "cancel" },
      { text: "Deconectează-mă", style: "destructive", onPress: () => signOut() },
    ]);

  return (
    <Screen title="General" subtitle="Profilul tău și paginile de pe site.">
      {/* Profil */}
      <Card>
        <View style={{ alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Ionicons name="person-circle" size={64} color={theme.colors.primary} />
          <Text style={{ fontSize: 18, fontWeight: "800", color: theme.colors.foreground }}>
            {fullName || "Contul meu"}
          </Text>
          <Muted>{email}</Muted>
        </View>
        <View style={{ gap: 12 }}>
          <Field label="Nume complet" value={fullName} onChangeText={setFullName} />
          <Field
            label="Telefon"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Button
            title="Salvează profilul"
            onPress={saveProfile}
            loading={saving}
            variant="outline"
            icon="save-outline"
          />
        </View>
      </Card>

      {/* Linkuri către site */}
      <Card>
        <SectionTitle>Pagini de pe site</SectionTitle>
        <Muted>Se deschid în browser.</Muted>
        <View style={{ marginTop: 6 }}>
          {SITE_LINKS.map((l, i) => (
            <LinkRow
              key={l.path}
              label={l.label}
              path={l.path}
              icon={l.icon}
              last={i === SITE_LINKS.length - 1}
            />
          ))}
        </View>
      </Card>

      <Button title="Deconectare" onPress={confirmLogout} variant="danger" icon="log-out-outline" />

      <Muted>NuntaPlanner · v1.0.0</Muted>
    </Screen>
  );
}
