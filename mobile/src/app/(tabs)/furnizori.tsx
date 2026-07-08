import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import {
  Button,
  Card,
  Chip,
  Loading,
  Muted,
  Screen,
  SectionTitle,
} from "../../components/ui";
import { categoryLabel } from "../../lib/format";
import { supabase } from "../../lib/supabase";
import type { VendorRow } from "../../lib/types";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

export default function FurnizoriScreen() {
  const { wedding, loading: wLoading } = useWedding();
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("vendors")
      .select(
        "id, business_name, category, regions, description, logo_url, rating, status, verified, county, locality",
      )
      .eq("status", "active")
      .eq("verified", true)
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setVendors(data ?? []);
        setLoading(false);
      });
  }, []);

  if (wLoading) return <Loading />;
  if (!wedding) return <Onboarding />;

  const categories = [...new Set(vendors.map((v) => v.category))];
  const shown = category ? vendors.filter((v) => v.category === category) : vendors;

  const contact = async (vendor: VendorRow) => {
    setContacting(vendor.id);
    try {
      const { error } = await supabase.rpc("create_lead", {
        p_wedding_id: wedding.id,
        p_vendor_id: vendor.id,
      });
      if (error) throw error;
      Alert.alert(
        "Cerere trimisă",
        `Am trimis o cerere către ${vendor.business_name}. Continuă conversația în Mesaje.`,
        [
          { text: "Rămân aici", style: "cancel" },
          { text: "Mesaje", onPress: () => router.push("/mesaje") },
        ],
      );
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setContacting(null);
    }
  };

  return (
    <Screen title="Furnizori" subtitle="Găsește și contactează furnizori verificați." back>
      {loading ? (
        <Loading />
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Chip label="Toate" selected={category === ""} onPress={() => setCategory("")} />
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={categoryLabel(cat)}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </View>

          {shown.length === 0 ? (
            <Card>
              <Muted>Niciun furnizor disponibil momentan.</Muted>
            </Card>
          ) : (
            shown.map((v) => (
              <Card key={v.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <SectionTitle>{v.business_name}</SectionTitle>
                    <Muted>{categoryLabel(v.category)}</Muted>
                  </View>
                  {v.rating > 0 ? (
                    <Text style={{ color: theme.colors.warning, fontWeight: "700" }}>
                      ★ {v.rating.toFixed(1)}
                    </Text>
                  ) : null}
                </View>
                {v.description ? <Muted>{v.description}</Muted> : null}
                {v.locality || v.county ? (
                  <Muted>{[v.locality, v.county].filter(Boolean).join(", ")}</Muted>
                ) : null}
                <Button
                  title="Contactează"
                  onPress={() => contact(v)}
                  loading={contacting === v.id}
                  icon="paper-plane-outline"
                />
              </Card>
            ))
          )}
        </>
      )}
    </Screen>
  );
}
