import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import {
  Button,
  Card,
  Field,
  Loading,
  Muted,
  Screen,
  SectionTitle,
  StatCard,
} from "../../components/ui";
import { formatNum } from "../../lib/format";
import { supabase } from "../../lib/supabase";
import type { RsvpRow } from "../../lib/types";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

const SITE = "https://nuntaplanner.vercel.app";
const DEFAULT_MESSAGE =
  "Cu drag vă invităm să fiți alături de noi în cea mai importantă zi din viața noastră.";

export default function InvitatieScreen() {
  const { loading, wedding, updateWedding } = useWedding();

  const [couple, setCouple] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);

  useEffect(() => {
    if (!wedding) return;
    setCouple(wedding.invitation_couple ?? wedding.name ?? "");
    setMessage(wedding.invitation_message ?? DEFAULT_MESSAGE);
    supabase
      .from("rsvps")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRsvps(data ?? []));
  }, [wedding]);

  if (loading) return <Loading />;
  if (!wedding) return <Onboarding />;

  const url = `${SITE}/i/${wedding.id}`;

  const save = async () => {
    setSaving(true);
    try {
      await updateWedding({
        invitation_couple: couple.trim() || null,
        invitation_message: message.trim() || null,
        invitation_published: true,
      });
      Alert.alert("Publicată", "Invitația a fost salvată și publicată.");
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const share = () =>
    Share.share({
      message: `Vă invităm cu drag la nunta noastră 💍\n${couple}\nVezi invitația: ${url}`,
    }).catch(() => {});

  const attending = rsvps.filter((r) => r.attending);
  const totalGuests = attending.reduce((s, r) => s + (r.guests_count || 0), 0);

  return (
    <Screen title="Invitație" subtitle="Invitația digitală cu RSVP online.">
      <Card style={{ gap: 12 }}>
        <Field
          label="Numele mirilor"
          value={couple}
          onChangeText={setCouple}
          placeholder="Ana & Andrei"
        />
        <Field
          label="Mesajul invitației"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: "top" }}
        />
        <Muted>Data, locația și programul se preiau automat din nunta ta.</Muted>
        <Button
          title={wedding.invitation_published ? "Salvează invitația" : "Publică invitația"}
          onPress={save}
          loading={saving}
          icon="megaphone-outline"
        />
      </Card>

      <Card style={{ gap: 10 }}>
        <SectionTitle>Partajează</SectionTitle>
        {wedding.invitation_published ? (
          <>
            <Muted>{url}</Muted>
            <Button title="Trimite invitația" onPress={share} icon="share-social-outline" />
            <Button
              title="Vezi invitația"
              onPress={() => WebBrowser.openBrowserAsync(url)}
              variant="outline"
              icon="open-outline"
            />
          </>
        ) : (
          <Muted>Publică invitația ca să primești linkul de partajat.</Muted>
        )}
      </Card>

      <StatCard
        icon="people-outline"
        label="Confirmări (RSVP)"
        value={`${formatNum(totalGuests)} invitați`}
        hint={`${attending.length} confirmări din ${rsvps.length} răspunsuri`}
      />

      {rsvps.length > 0 ? (
        <Card>
          <SectionTitle>Răspunsuri</SectionTitle>
          <View style={{ marginTop: 4 }}>
            {rsvps.map((r) => (
              <View
                key={r.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: theme.colors.foreground, fontWeight: "600" }}>
                    {r.guest_name}
                  </Text>
                  {r.message ? <Muted>{r.message}</Muted> : null}
                </View>
                <Ionicons
                  name={r.attending ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={r.attending ? theme.colors.success : theme.colors.destructive}
                />
                <Text style={{ marginLeft: 6, color: theme.colors.mutedForeground }}>
                  {r.attending ? `${r.guests_count}` : "—"}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
