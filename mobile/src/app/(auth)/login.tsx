import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import {
  Button,
  Card,
  Field,
  Muted,
  PasswordField,
  Screen,
} from "../../components/ui";
import { supabase } from "../../lib/supabase";
import { theme } from "../../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) {
      Alert.alert("Completează", "Introdu emailul și parola.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) Alert.alert("Autentificare eșuată", error.message);
    // La succes, sesiunea se schimbă și navigatorul comută pe (tabs).
  };

  return (
    <Screen>
      <View style={{ alignItems: "center", marginTop: 24, marginBottom: 8 }}>
        <Ionicons name="heart" size={40} color={theme.colors.primary} />
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: theme.colors.foreground,
            marginTop: 8,
          }}
        >
          NuntaPlanner
        </Text>
        <Muted>Planificatorul nunții tale</Muted>
      </View>

      <Card style={{ gap: 14 }}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nume@email.ro"
          autoComplete="email"
        />
        <PasswordField
          label="Parolă"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        <Button title="Autentificare" onPress={signIn} loading={loading} />
      </Card>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <Muted>Nu ai cont?</Muted>
        <Link href="/(auth)/register" style={{ color: theme.colors.primary, fontWeight: "700" }}>
          Creează gratuit
        </Link>
      </View>
    </Screen>
  );
}
