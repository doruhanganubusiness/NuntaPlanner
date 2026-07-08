import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { EventsSection } from "../../components/events-section";
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
import { STYLE_LABELS, WEDDING_TYPE_OPTIONS } from "../../lib/format";
import { useWedding } from "../../lib/wedding-context";
import type { DateStatus, WeddingStyle } from "../../lib/types";

const DATE_STATUS: { value: DateStatus; label: string }[] = [
  { value: "set", label: "Dată fixată" },
  { value: "estimated", label: "Estimată" },
  { value: "undecided", label: "Nestabilită" },
];

export default function DetaliiScreen() {
  const { loading, wedding, updateWedding } = useWedding();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [dateStatus, setDateStatus] = useState<DateStatus>("undecided");
  const [region, setRegion] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [style, setStyle] = useState<WeddingStyle | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!wedding) return;
    setName(wedding.name);
    setDate(wedding.wedding_date ?? "");
    setDateStatus(wedding.date_status);
    setRegion(wedding.region ?? "");
    setTypes(wedding.wedding_type ?? []);
    setStyle(wedding.style);
  }, [wedding]);

  if (loading) return <Loading />;
  if (!wedding) return <Onboarding />;

  const toggleType = (v: string) =>
    setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));

  const save = async () => {
    setSaving(true);
    try {
      await updateWedding({
        name: name.trim() || wedding.name,
        wedding_date: date.trim() || null,
        date_status: dateStatus,
        region: region.trim() || null,
        wedding_type: types,
        style,
      });
      Alert.alert("Salvat", "Detaliile nunții au fost actualizate.");
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen title="Detalii" subtitle="Numele, data, tipul și stilul nunții.">
      <Card style={{ gap: 14 }}>
        <Field label="Numele nunții" value={name} onChangeText={setName} />
        <Field
          label="Data (AAAA-LL-ZZ)"
          value={date}
          onChangeText={setDate}
          placeholder="2027-08-21"
          autoCapitalize="none"
        />
        <View style={{ gap: 8 }}>
          <SectionTitle>Statusul datei</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DATE_STATUS.map((d) => (
              <Chip
                key={d.value}
                label={d.label}
                selected={dateStatus === d.value}
                onPress={() => setDateStatus(d.value)}
              />
            ))}
          </View>
        </View>
        <Field label="Regiune" value={region} onChangeText={setRegion} />
      </Card>

      <Card style={{ gap: 10 }}>
        <SectionTitle>Tipul nunții</SectionTitle>
        <Muted>Poți alege mai multe.</Muted>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {WEDDING_TYPE_OPTIONS.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              selected={types.includes(o.value)}
              onPress={() => toggleType(o.value)}
            />
          ))}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <SectionTitle>Stil</SectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(STYLE_LABELS) as WeddingStyle[]).map((k) => (
            <Chip
              key={k}
              label={STYLE_LABELS[k]}
              selected={style === k}
              onPress={() => setStyle(style === k ? null : k)}
            />
          ))}
        </View>
      </Card>

      <Button title="Salvează detaliile" onPress={save} loading={saving} icon="save-outline" />

      <View style={{ height: 8 }} />
      <EventsSection />
    </Screen>
  );
}
