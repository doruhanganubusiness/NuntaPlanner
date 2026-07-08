import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Loading } from "../components/ui";
import { SessionProvider, useSession } from "../lib/session";
import { WeddingProvider } from "../lib/wedding-context";
import { theme } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <WeddingProvider>
          <Shell />
        </WeddingProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

/**
 * „Shell"-ul vizual: forțează bara de status pe fundal ALB (un spacer alb de
 * înălțimea inset-ului de sus) cu iconițe/text NEGRE (`style="dark"`), apoi
 * randează navigatorul sub ea. Gating-ul de autentificare e declarativ, cu
 * `Stack.Protected`.
 */
function Shell() {
  const { session, loading } = useSession();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  const isAuthed = !!session;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.statusBarBg }}>
      <StatusBar style="dark" />
      {/* Fundal alb forțat în spatele barei de status. */}
      <View
        style={{ height: insets.top, backgroundColor: theme.colors.statusBarBg }}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {loading ? (
          <Loading />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isAuthed}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthed}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
        )}
      </View>
    </View>
  );
}
