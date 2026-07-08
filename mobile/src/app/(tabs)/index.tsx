import { View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import {
  Card,
  KeyValue,
  Loading,
  Muted,
  Screen,
  SectionTitle,
  StatCard,
} from "../../components/ui";
import { formatNum, formatRON, musicLabel } from "../../lib/format";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

export default function PanouScreen() {
  const { loading, wedding, slots, results } = useWedding();

  if (loading) return <Loading />;
  if (!wedding) return <Onboarding />;

  const totalGuests = slots.reduce(
    (s, x) => s + x.guests_adults + x.guests_children,
    0,
  );
  const daysLeft = wedding.wedding_date ? daysUntil(wedding.wedding_date) : null;

  const checks = [
    !!wedding.region,
    wedding.date_status !== "undecided",
    (wedding.wedding_type?.length ?? 0) > 0,
    !!wedding.style,
    slots.length > 0,
    slots.some((s) => s.slot_type === "reception"),
    totalGuests > 0,
    wedding.total_budget != null,
  ];
  const progress = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );

  return (
    <Screen title={wedding.name} subtitle="Panou general">
      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <SectionTitle>Progres planificare</SectionTitle>
          <Muted>{progress}%</Muted>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: theme.colors.muted,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: theme.colors.primary,
            }}
          />
        </View>
      </Card>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatCard
          icon="calendar-outline"
          label="Data nunții"
          value={
            daysLeft != null
              ? daysLeft >= 0
                ? `${daysLeft} zile`
                : "A trecut"
              : "Nestabilită"
          }
          hint={wedding.wedding_date ?? "Adaugă în Detalii"}
        />
        <StatCard
          icon="people-outline"
          label="Invitați"
          value={formatNum(totalGuests)}
          hint={`${slots.length} evenimente`}
        />
      </View>

      <StatCard
        icon="wallet-outline"
        label="Buget total"
        value={formatRON(
          results?.budget?.effectiveTotalRON ?? wedding.total_budget ?? null,
        )}
        hint={
          results?.budget?.usingRecommended
            ? "Buget recomandat (poți introduce al tău)"
            : "Din bugetul tău"
        }
      />

      <Card>
        <SectionTitle>Recomandări rapide</SectionTitle>
        {results ? (
          <View style={{ marginTop: 4 }}>
            {results.music ? (
              <KeyValue label="Muzică" value={musicLabel(results.music.selected)} />
            ) : null}
            {results.venue ? (
              <KeyValue
                label="Sală"
                value={`~${formatNum(results.venue.recommendedSqm)} mp · ${results.venue.roundTables} mese`}
              />
            ) : null}
            {results.drinks?.mode === "quantities" &&
            results.drinks.quantities ? (
              <KeyValue
                label="Vin"
                value={`${results.drinks.quantities.wine.bottles} sticle`}
              />
            ) : null}
            {results.warnings?.length ? (
              <Muted>{results.warnings.join(" · ")}</Muted>
            ) : null}
          </View>
        ) : (
          <Muted>Adaugă evenimente și invitați ca să primești recomandări.</Muted>
        )}
      </Card>
    </Screen>
  );
}
