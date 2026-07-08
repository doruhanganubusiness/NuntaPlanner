import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button, Card, Field, Muted, Screen } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import { theme } from "../../theme";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const signUp = async () => {
    if (!email || password.length < 8) {
      Alert.alert("Verifică datele", "Email valid și parolă de minim 8 caractere.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Cont de miri — aplicația e doar planificatorul pentru miri.
        data: {
          full_name: fullName.trim(),
          user_type: "client",
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Înregistrare eșuată", error.message);
      return;
    }
    // Fără sesiune => e nevoie de confirmare pe email.
    if (!data.session) setNeedsVerify(true);
  };

  if (needsVerify) {
    return (
      <Screen title="Verifică-ți emailul">
        <Card>
          <Muted>
            Ți-am trimis un link de confirmare pe {email}. Deschide-l ca să-ți
            activezi contul, apoi autentifică-te.
          </Muted>
          <View style={{ height: 12 }} />
          <Link
            href="/(auth)/login"
            style={{ color: theme.colors.primary, fontWeight: "700" }}
          >
            Mergi la autentificare
          </Link>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 16, marginBottom: 8 }}>
        <Ionicons name="heart" size={36} color={theme.colors.primary} />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: theme.colors.foreground,
            marginTop: 8,
          }}
        >
          Creează-ți contul de miri
        </Text>
      </View>

      <Card style={{ gap: 14 }}>
        <Field label="Nume complet" value={fullName} onChangeText={setFullName} />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nume@email.ro"
        />
        <Field
          label="Telefon (opțional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Field
          label="Parolă (min. 8 caractere)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        <Button title="Creează cont" onPress={signUp} loading={loading} />
      </Card>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <Muted>Ai deja cont?</Muted>
        <Link
          href="/(auth)/login"
          style={{ color: theme.colors.primary, fontWeight: "700" }}
        >
          Autentifică-te
        </Link>
      </View>
    </Screen>
  );
}
