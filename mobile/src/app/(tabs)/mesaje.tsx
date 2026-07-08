import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import { Card, Loading, Muted, Screen } from "../../components/ui";
import { categoryLabel } from "../../lib/format";
import { supabase } from "../../lib/supabase";
import type { LeadStatus } from "../../lib/types";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

type Conversation = {
  id: string;
  status: LeadStatus;
  created_at: string;
  vendors: { business_name: string; category: string } | null;
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Trimisă",
  unlocked: "Văzută de furnizor",
  contacted: "Contactat",
  converted: "Confirmat",
  lost: "Închisă",
};

export default function MesajeScreen() {
  const { wedding, loading: wLoading } = useWedding();
  const router = useRouter();
  const [leads, setLeads] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wedding) return;
    supabase
      .from("leads")
      .select("id, status, created_at, vendors(business_name, category)")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads((data as unknown as Conversation[]) ?? []);
        setLoading(false);
      });
  }, [wedding]);

  if (wLoading) return <Loading />;
  if (!wedding) return <Onboarding />;

  return (
    <Screen title="Mesaje" subtitle="Conversațiile tale cu furnizorii." back>
      {loading ? (
        <Loading />
      ) : leads.length === 0 ? (
        <Card>
          <Muted>
            Nicio conversație încă. Deschide „Furnizori" din Panou și contactează un
            furnizor.
          </Muted>
        </Card>
      ) : (
        <Card>
          {leads.map((l, i) => (
            <Pressable
              key={l.id}
              onPress={() =>
                router.push({
                  pathname: "/chat",
                  params: {
                    leadId: l.id,
                    vendor: l.vendors?.business_name ?? "Furnizor",
                  },
                })
              }
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                borderBottomWidth: i === leads.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="chatbubbles-outline" size={22} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.foreground }}>
                  {l.vendors?.business_name ?? "Furnizor"}
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.mutedForeground }}>
                  {l.vendors ? categoryLabel(l.vendors.category) : ""} · {STATUS_LABEL[l.status]}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.mutedForeground} />
            </Pressable>
          ))}
        </Card>
      )}
    </Screen>
  );
}
