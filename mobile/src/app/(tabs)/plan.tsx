import { View } from "react-native";
import { Onboarding } from "../../components/onboarding";
import {
  Card,
  KeyValue,
  Loading,
  Muted,
  Screen,
  SectionTitle,
} from "../../components/ui";
import { formatNum, formatRON, musicLabel } from "../../lib/format";
import { useWedding } from "../../lib/wedding-context";
import { theme } from "../../theme";

export default function PlanScreen() {
  const { loading, wedding, slots, results } = useWedding();

  if (loading) return <Loading />;
  if (!wedding) return <Onboarding />;

  if (!results || slots.length === 0) {
    return (
      <Screen title="Plan" subtitle="Calcule automate pentru nunta ta.">
        <Card>
          <Muted>
            Adaugă evenimente și invitați (din site, tab-ul Evenimente) ca să
            generăm planul: băutură, dulciuri, sală, muzică și buget.
          </Muted>
        </Card>
      </Screen>
    );
  }

  const { drinks, sweets, venue, music, budget, warnings } = results;

  return (
    <Screen title="Plan" subtitle="Recalculat automat din datele nunții.">
      {warnings?.length ? (
        <Card style={{ borderColor: theme.colors.warning, backgroundColor: theme.colors.accent }}>
          {warnings.map((w, i) => (
            <Muted key={i}>⚠ {w}</Muted>
          ))}
        </Card>
      ) : null}

      {/* Băutură */}
      <Card>
        <SectionTitle>Băutură</SectionTitle>
        {drinks.mode === "quantities" && drinks.quantities ? (
          <View style={{ marginTop: 4 }}>
            <KeyValue label="Vin" value={`${formatNum(drinks.quantities.wine.bottles)} sticle`} />
            <KeyValue label="Bere" value={`${formatNum(drinks.quantities.beer.bottles)} sticle`} />
            <KeyValue
              label="Tărie"
              value={`${formatNum(drinks.quantities.spirits.bottles)} sticle`}
            />
            <KeyValue
              label="Șampanie"
              value={`${formatNum(drinks.quantities.champagne.bottles)} sticle`}
            />
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

      {/* Dulciuri */}
      <Card>
        <SectionTitle>Dulciuri</SectionTitle>
        <View style={{ marginTop: 4 }}>
          <KeyValue label="Tort" value={`${formatNum(sweets.totals.cakeKg)} kg`} />
          <KeyValue label="Candy bar" value={`${formatNum(sweets.totals.candyBarKg)} kg`} />
          <KeyValue
            label="Dulciuri cununie"
            value={`${formatNum(sweets.totals.civilSweetsKg)} kg`}
          />
          <KeyValue
            label="Șampanie"
            value={`${formatNum(sweets.totals.champagneBottles)} sticle`}
          />
          <KeyValue label="Mărturii" value={`${formatNum(sweets.totals.favors)} buc`} />
        </View>
      </Card>

      {/* Sală */}
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

      {/* Muzică */}
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

      {/* Buget defalcat */}
      {budget && budget.allocations.length ? (
        <Card>
          <SectionTitle>Defalcarea bugetului</SectionTitle>
          <Muted>
            {budget.usingRecommended ? "Pe baza bugetului recomandat" : "Pe baza bugetului tău"} ·{" "}
            {formatRON(budget.effectiveTotalRON)}
          </Muted>
          <View style={{ marginTop: 6 }}>
            {budget.allocations.map((a) => (
              <KeyValue
                key={a.key}
                label={`${a.label} (${a.pct}%)`}
                value={formatRON(a.amountRON)}
              />
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
