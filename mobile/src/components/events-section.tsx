import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { SLOT_TYPE_OPTIONS, slotDefaults } from "../lib/format";
import type { EventSlotRow, SlotTypeDb } from "../lib/types";
import { useWedding } from "../lib/wedding-context";
import { theme } from "../theme";
import { Button, Card, Chip, Field, Muted, SectionTitle } from "./ui";

const c = theme.colors;

/** Secțiunea „Evenimente" — CRUD pe event_slots, folosită în tab-ul Detalii. */
export function EventsSection() {
  const { slots, addSlot } = useWedding();
  const [adding, setAdding] = useState(false);

  const add = async (type: SlotTypeDb) => {
    setAdding(true);
    try {
      await addSlot(type);
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <View>
        <SectionTitle>Evenimente</SectionTitle>
        <Muted>
          Programul zilei: cununie, botez, petrecere — cu oră, invitați și locație.
        </Muted>
      </View>

      {slots.length === 0 ? (
        <Card>
          <Muted>Niciun eveniment încă. Adaugă-l pe primul mai jos.</Muted>
        </Card>
      ) : (
        slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SLOT_TYPE_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            label={`+ ${o.label}`}
            selected={false}
            onPress={() => !adding && add(o.value)}
          />
        ))}
      </View>
    </View>
  );
}

function SlotCard({ slot }: { slot: EventSlotRow }) {
  const { updateSlot, deleteSlot } = useWedding();
  const [type, setType] = useState<SlotTypeDb>(slot.slot_type);
  const [title, setTitle] = useState(slot.title ?? "");
  const [time, setTime] = useState(slot.slot_time ? slot.slot_time.slice(0, 5) : "");
  const [adults, setAdults] = useState(String(slot.guests_adults));
  const [children, setChildren] = useState(String(slot.guests_children));
  const [hours, setHours] = useState(
    slot.duration_minutes != null ? String(slot.duration_minutes / 60) : "",
  );
  const [locationName, setLocationName] = useState(slot.location_name ?? "");
  const [locality, setLocality] = useState(slot.locality ?? "");
  const [alcohol, setAlcohol] = useState(slot.serves_alcohol);
  const [fullMeal, setFullMeal] = useState(slot.serves_full_meal);
  const [saving, setSaving] = useState(false);

  const isReception = type === "reception";

  const changeType = (t: SlotTypeDb) => {
    setType(t);
    const d = slotDefaults(t);
    setTitle(d.title);
    setAlcohol(d.serves_alcohol);
    setFullMeal(d.serves_full_meal);
    setHours(d.duration_minutes != null ? String(d.duration_minutes / 60) : "");
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateSlot(slot.id, {
        slot_type: type,
        title: title.trim() || null,
        slot_time: time.trim() ? `${time.trim()}:00` : null,
        duration_minutes: hours.trim() ? Math.round(Number(hours) * 60) : null,
        guests_adults: Number(adults) || 0,
        guests_children: Number(children) || 0,
        location_name: locationName.trim() || null,
        locality: locality.trim() || null,
        serves_alcohol: alcohol,
        serves_full_meal: fullMeal,
      });
      Alert.alert("Salvat", "Evenimentul a fost salvat.");
    } catch (e) {
      Alert.alert("Eroare", e instanceof Error ? e.message : "Încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert("Șterge evenimentul", "Sigur?", [
      { text: "Anulează", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: () => deleteSlot(slot.id).catch(() => {}),
      },
    ]);

  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <SectionTitle>{title || "Eveniment"}</SectionTitle>
        <Pressable onPress={confirmDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={c.destructive} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SLOT_TYPE_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            label={o.label}
            selected={type === o.value}
            onPress={() => changeType(o.value)}
          />
        ))}
      </View>

      <Field label="Titlu" value={title} onChangeText={setTitle} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field
            label="Ora (HH:MM)"
            value={time}
            onChangeText={setTime}
            placeholder="16:00"
            autoCapitalize="none"
          />
        </View>
        {isReception ? (
          <View style={{ flex: 1 }}>
            <Field
              label="Durată (ore)"
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              placeholder="10"
            />
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field
            label="Adulți"
            value={adults}
            onChangeText={setAdults}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Copii"
            value={children}
            onChangeText={setChildren}
            keyboardType="numeric"
          />
        </View>
      </View>
      <Field
        label="Locație (nume)"
        value={locationName}
        onChangeText={setLocationName}
        placeholder="ex. Biserica Sf. Nicolae"
      />
      <Field
        label="Localitate"
        value={locality}
        onChangeText={setLocality}
        placeholder="ex. Cluj-Napoca"
      />

      <ToggleRow label="Se servește alcool" value={alcohol} onChange={setAlcohol} />
      <ToggleRow label="Masă completă" value={fullMeal} onChange={setFullMeal} />

      <Button title="Salvează evenimentul" onPress={save} loading={saving} icon="save-outline" />
    </Card>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontSize: 14, color: c.foreground }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: c.primary, false: c.border }}
        thumbColor="#fff"
      />
    </View>
  );
}
