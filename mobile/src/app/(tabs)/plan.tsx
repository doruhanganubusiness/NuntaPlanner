import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import {
  Button,
  Card,
  Chip,
  Field,
  KeyValue,
  Loading,
  Muted,
  Screen,
  SectionTitle,
  StatCard,
} from "../../components/ui";
import { formatNum, formatRON, musicLabel } from "../../lib/format";
import type { DrinkModeDb, MusicChoiceDb } from "../../lib/types";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

const DRINK_MODES: { value: DrinkModeDb; label: string }[] = [
  { value: "quantities", label: "Calculez cantitățile" },
  { value: "cost", label: "Băutura e inclusă în meniu" },
];

const MUSIC: { value: MusicChoiceDb; label: string }[] = [
  { value: "dj", label: "DJ" },
  { value: "band", label: "Formație" },
  { value: "band_and_dj", label: "Formație + DJ" },
];

export default function PlanScreen() {
  const { loading, wedding, slots, results } = useWedding();

  if (loading) return <Loading />;
  if (!wedding) return <Onboarding />;

  return (
    <Screen title="Plan" subtitle="Buget și calcule automate pentru nunta ta.">
      <BudgetEditor />
      <PlanResults hasSlots={slots.length > 0} results={results} />
    </Screen>
  );
}

/** Editorul de buget (mutat din fostul tab Buget). */
function BudgetEditor() {
  const { wedding, results, updateWedding } = useWedding();
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

  if (!wedding) return null;

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
    <>
      {results?.budget ? (
        <StatCard
          icon="wallet-outline"
          label="Buget"
          value={formatRON(results.budget.effectiveTotalRON)}
          hint={
            results.budget.usingRecommended
              ? "Recomandat automat (poți introduce al tău)"
              : "Bugetul introdus de tine"
          }
        />
      ) : null}

      <Card style={{ gap: 12 }}>
        <SectionTitle>Bugetul tău</SectionTitle>
        <Field
          label="Buget total (lei)"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          placeholder="ex. 80000"
        />
        <Muted>Lasă gol ca să folosim bugetul recomandat automat.</Muted>

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

        <Button title="Salvează bugetul" onPress={save} loading={saving} icon="save-outline" />
      </Card>
    </>
  );
}

function PlanResults({
  hasSlots,
  results,
}: {
  hasSlots: boolean;
  results: ReturnType<typeof useWedding>["results"];
}) {
  if (!results || !hasSlots) {
    return (
      <Card>
        <SectionTitle>Calcule automate</SectionTitle>
        <Muted>
          Adaugă evenimente și invitați (din tab-ul Detalii) ca să generăm planul:
          băutură, dulciuri, sală, muzică și defalcarea bugetului.
        </Muted>
      </Card>
    );
  }

  const { drinks, sweets, venue, music, budget, warnings } = results;

  return (
    <>
      {warnings?.length ? (
        <Card style={{ borderColor: theme.colors.warning, backgroundColor: theme.colors.accent }}>
          {warnings.map((w, i) => (
            <Muted key={i}>⚠ {w}</Muted>
          ))}
        </Card>
      ) : null}

      <Card>
        <SectionTitle>Băutură</SectionTitle>
        {drinks.mode === "quantities" && drinks.quantities ? (
          <View style={{ marginTop: 4 }}>
            <KeyValue label="Vin" value={`${formatNum(drinks.quantities.wine.bottles)} sticle`} />
            <KeyValue label="Bere" value={`${formatNum(drinks.quantities.beer.bottles)} sticle`} />
            <KeyValue label="Tărie" value={`${formatNum(drinks.quantities.spirits.bottles)} sticle`} />
            <KeyValue label="Șampanie" value={`${formatNum(drinks.quantities.champagne.bottles)} sticle`} />
            <KeyValue label="Apă" value={`${formatNum(drinks.quantities.water.liters)} L`} />
            <KeyValue label="Suc" value={`${formatNum(drinks.quantities.juice.liters)} L`} />
          </View>
        ) : drinks.cost ? (
          <View style={{ marginTop: 4 }}>
            <KeyValue label="Cost/persoană" value={formatRON(drinks.cost.perPersonRON)} />
            <KeyValue label="Cost total" value={formatRON(drinks.cost.totalRON)} />
          </View>
        ) : (
          <Muted>Băutura e inclusă în meniu.</Muted>
        )}
      </Card>

      <Card>
        <SectionTitle>Dulciuri</SectionTitle>
        <View style={{ marginTop: 4 }}>
          <KeyValue label="Tort" value={`${formatNum(sweets.totals.cakeKg)} kg`} />
          <KeyValue label="Candy bar" value={`${formatNum(sweets.totals.candyBarKg)} kg`} />
          <KeyValue label="Dulciuri cununie" value={`${formatNum(sweets.totals.civilSweetsKg)} kg`} />
          <KeyValue label="Șampanie" value={`${formatNum(sweets.totals.champagneBottles)} sticle`} />
          <KeyValue label="Mărturii" value={`${formatNum(sweets.totals.favors)} buc`} />
        </View>
      </Card>

      {venue ? (
        <Card>
          <SectionTitle>Sală</SectionTitle>
          <View style={{ marginTop: 4 }}>
            <KeyValue label="Suprafață recomandată" value={`~${formatNum(venue.recommendedSqm)} mp`} />
            <KeyValue label="Interval" value={`${formatNum(venue.minSqm)}–${formatNum(venue.maxSqm)} mp`} />
            <KeyValue label="Mese rotunde" value={`${formatNum(venue.roundTables)}`} />
          </View>
        </Card>
      ) : null}

      {music ? (
        <Card>
          <SectionTitle>Muzică</SectionTitle>
          <View style={{ marginTop: 4 }}>
            <KeyValue label="Recomandare" value={musicLabel(music.recommendation)} />
            <KeyValue label="Alegerea ta" value={musicLabel(music.selected)} />
            {music.musicBudgetRON != null ? (
              <KeyValue label="Buget muzică" value={formatRON(music.musicBudgetRON)} />
            ) : null}
          </View>
          {music.reason ? <Muted>{music.reason}</Muted> : null}
        </Card>
      ) : null}

      {budget && budget.allocations.length ? (
        <Card>
          <SectionTitle>Defalcarea bugetului</SectionTitle>
          <Muted>
            {budget.usingRecommended ? "Pe baza bugetului recomandat" : "Pe baza bugetului tău"} ·{" "}
            {formatRON(budget.effectiveTotalRON)}
          </Muted>
          <View style={{ marginTop: 6 }}>
            {budget.allocations.map((a) => (
              <KeyValue key={a.key} label={`${a.label} (${a.pct}%)`} value={formatRON(a.amountRON)} />
            ))}
          </View>
        </Card>
      ) : null}
    </>
  );
}
