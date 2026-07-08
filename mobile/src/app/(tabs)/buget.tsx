import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
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
  StatCard,
} from "../../components/ui";
import { formatRON, musicLabel } from "../../lib/format";
import type { DrinkModeDb, MusicChoiceDb } from "../../lib/types";
import { useWedding } from "../../lib/wedding-context";

const DRINK_MODES: { value: DrinkModeDb; label: string }[] = [
  { value: "quantities", label: "Calculez cantitățile" },
  { value: "cost", label: "Băutura e inclusă în meniu" },
];

const MUSIC: { value: MusicChoiceDb; label: string }[] = [
  { value: "dj", label: "DJ" },
  { value: "band", label: "Formație" },
  { value: "band_and_dj", label: "Formație + DJ" },
];

export default function BugetScreen() {
  const { loading, wedding, results, updateWedding } = useWedding();

  const [budget, setBudget] = useState("");
  const [drinkMode, setDrinkMode] = useState<DrinkModeDb>("quantities");
  const [music, setMusic] = useState<MusicChoiceDb | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wedding) return;
    setBudget(wedding.total_budget != null ? String(wedding.total_budget) : "");
    setDrinkMode(wedding.drink_mode);
    setMusic(wedding.music_choice);
  }, [wedding]);

  if (loading) return <Loading />;
  if (!wedding) return <Onboarding />;

  const save = async () => {
    const parsed = budget.trim() ? Number(budget.replace(/[^\d]/g, "")) : null;
    if (budget.trim() && (parsed == null || Number.isNaN(parsed))) {
      Alert.alert("Buget invalid", "Introdu o sumă în lei, doar cifre.");
      return;
    }
    setSaving(true);
    try {
      await updateWedding({
        total_budget: parsed,
        drink_mode: drinkMode,
        music_choice: music,
      });
      Alert.alert("Salvat", "Bugetul a fost actualizat.");
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Buget" subtitle="Bugetul, băutura și muzica nunții.">
      {results?.budget ? (
        <StatCard
          icon="sparkles-outline"
          label="Buget recomandat"
          value={formatRON(results.budget.effectiveTotalRON)}
          hint={
            results.budget.usingRecommended
              ? "Estimare pe baza invitaților și evenimentelor"
              : "Folosim bugetul introdus de tine"
          }
        />
      ) : null}

      <Card style={{ gap: 12 }}>
        <Field
          label="Bugetul tău total (lei)"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          placeholder="ex. 80000"
        />
        <Muted>Lasă gol ca să folosim bugetul recomandat automat.</Muted>
      </Card>

      <Card style={{ gap: 10 }}>
        <SectionTitle>Băutură</SectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {DRINK_MODES.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              selected={drinkMode === d.value}
              onPress={() => setDrinkMode(d.value)}
            />
          ))}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <SectionTitle>Muzică</SectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MUSIC.map((m) => (
            <Chip
              key={m.value}
              label={m.label}
              selected={music === m.value}
              onPress={() => setMusic(music === m.value ? null : m.value)}
            />
          ))}
        </View>
        {results?.music ? (
          <Muted>Recomandat pentru nunta ta: {musicLabel(results.music.selected)}</Muted>
        ) : null}
      </Card>

      <Button title="Salvează bugetul" onPress={save} loading={saving} icon="save-outline" />
    </Screen>
  );
}
