import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, Share, Text, View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import {
  Button,
  Card,
  Chip,
  Field,
  Loading,
  Muted,
  Screen,
  SectionTitle,
} from "../../components/ui";
import {
  MEMBER_PERMISSION_OPTIONS,
  MEMBER_ROLE_OPTIONS,
  roleLabel,
} from "../../lib/format";
import { supabase } from "../../lib/supabase";
import type { WeddingMemberRow } from "../../lib/types";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

const SITE = "https://nuntaplanner.vercel.app";

export default function MembriScreen() {
  const { wedding, loading: wLoading } = useWedding();
  const [members, setMembers] = useState<WeddingMemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("parent");
  const [permission, setPermission] = useState("viewer");
  const [inviting, setInviting] = useState(false);

  const reload = async (weddingId: string) => {
    const { data } = await supabase
      .from("wedding_members")
      .select("*")
      .eq("wedding_id", weddingId)
      .order("invited_at");
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (wedding) reload(wedding.id);
  }, [wedding]);

  if (wLoading) return <Loading />;
  if (!wedding) return <Onboarding />;

  const invite = async () => {
    if (!email.trim()) {
      Alert.alert("Email lipsă", "Introdu adresa de email a persoanei invitate.");
      return;
    }
    setInviting(true);
    try {
      const { data, error } = await supabase
        .from("wedding_members")
        .insert({
          wedding_id: wedding.id,
          email: email.trim().toLowerCase(),
          role: role as WeddingMemberRow["role"],
          permission: permission as WeddingMemberRow["permission"],
        })
        .select("*")
        .single();
      if (error) throw error;
      setEmail("");
      await reload(wedding.id);
      if (data) {
        const link = `${SITE}/invite/${data.invite_token}`;
        Alert.alert("Membru adăugat", "Trimite-i linkul de invitație.", [
          { text: "Închide", style: "cancel" },
          { text: "Trimite link", onPress: () => Share.share({ message: link }) },
        ]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Încearcă din nou.";
      Alert.alert(
        "Eroare",
        msg.includes("duplicate") ? "Există deja un membru cu acest email." : msg,
      );
    } finally {
      setInviting(false);
    }
  };

  const shareLink = (m: WeddingMemberRow) =>
    Share.share({ message: `${SITE}/invite/${m.invite_token}` }).catch(() => {});

  const remove = (m: WeddingMemberRow) =>
    Alert.alert("Șterge membrul", `Elimini ${m.email}?`, [
      { text: "Anulează", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: async () => {
          await supabase.from("wedding_members").delete().eq("id", m.id);
          reload(wedding.id);
        },
      },
    ]);

  return (
    <Screen title="Membri" subtitle="Invită mireasă, mire, părinți și nași." back>
      <Card style={{ gap: 12 }}>
        <SectionTitle>Invită o persoană</SectionTitle>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nume@email.ro"
        />
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.foreground }}>Rol</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MEMBER_ROLE_OPTIONS.map((r) => (
            <Chip key={r.value} label={r.label} selected={role === r.value} onPress={() => setRole(r.value)} />
          ))}
        </View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.foreground }}>Drepturi</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MEMBER_PERMISSION_OPTIONS.map((p) => (
            <Chip
              key={p.value}
              label={p.label}
              selected={permission === p.value}
              onPress={() => setPermission(p.value)}
            />
          ))}
        </View>
        <Button title="Adaugă membru" onPress={invite} loading={inviting} icon="person-add-outline" />
      </Card>

      {loading ? (
        <Loading />
      ) : members.length === 0 ? (
        <Card>
          <Muted>Niciun membru încă.</Muted>
        </Card>
      ) : (
        <Card>
          <SectionTitle>Membri</SectionTitle>
          <View style={{ marginTop: 4 }}>
            {members.map((m, i) => (
              <View
                key={m.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 12,
                  borderBottomWidth: i === members.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colors.foreground }}>
                    {m.email}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.mutedForeground }}>
                    {roleLabel(m.role)} · {m.status === "active" ? "Activ" : "În așteptare"}
                  </Text>
                </View>
                <Pressable onPress={() => shareLink(m)} hitSlop={8}>
                  <Ionicons name="share-social-outline" size={20} color={theme.colors.primary} />
                </Pressable>
                <Pressable onPress={() => remove(m)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      )}
    </Screen>
  );
}
