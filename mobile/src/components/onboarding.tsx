import { useState } from "react";
import { Alert, View } from "react-native";
import { useWedding } from "../lib/wedding-context";
import { Button, Card, Field, Muted, Screen } from "./ui";

/**
 * Ecran de start când mirii nu au încă o nuntă: creează prima nuntă (folosind
 * RPC-ul `create_wedding`, la fel ca site-ul). Restul detaliilor se completează
 * apoi din tab-uri.
 */
export function Onboarding() {
  const { createWedding } = useWedding();
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert("Adaugă un nume", "ex. „Nunta Ana & Mihai”.");
      return;
    }
    setLoading(true);
    try {
      await createWedding(name.trim(), region.trim() || null);
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title="Să începem planificarea"
      subtitle="Completează ce știi acum — restul îl ajustezi oricând din tab-uri."
    >
      <Card style={{ gap: 14 }}>
        <Field
          label="Numele nunții"
          value={name}
          onChangeText={setName}
          placeholder="Nunta Ana & Mihai"
        />
        <Field
          label="Regiune (opțional)"
          value={region}
          onChangeText={setRegion}
          placeholder="ex. Moldova, Transilvania"
        />
        <Muted>
          Regiunea ajustează calculele (prețuri, cantități) după specificul zonei.
        </Muted>
        <View style={{ height: 4 }} />
        <Button title="Creează nunta" onPress={submit} loading={loading} icon="add" />
      </Card>
    </Screen>
  );
}
