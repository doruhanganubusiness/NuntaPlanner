import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import type { MessageRow } from "../../lib/types";
import { theme } from "../../theme";

const c = theme.colors;

export default function ChatScreen() {
  const params = useLocalSearchParams<{ leadId: string; vendor?: string }>();
  const leadId = params.leadId;
  const vendor = params.vendor ?? "Furnizor";
  const router = useRouter();

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    if (!leadId) return;
    let active = true;
    supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at")
      .then(({ data }) => {
        if (!active) return;
        setMessages(data ?? []);
        setLoading(false);
        scrollToEnd();
      });

    // Realtime: mesaje noi (inclusiv de la furnizor).
    const channel = supabase
      .channel(`messages:${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row],
          );
          scrollToEnd();
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [leadId, scrollToEnd]);

  const send = async () => {
    const text = body.trim();
    if (!text || !leadId) return;
    setSending(true);
    setBody("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ lead_id: leadId, sender_role: "couple", body: text })
      .select("*")
      .single();
    setSending(false);
    if (error) {
      setBody(text);
      return;
    }
    if (data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data],
      );
      scrollToEnd();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
          backgroundColor: c.card,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={c.primary} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: "700", color: c.foreground }}>{vendor}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={c.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, gap: 8 }}
          onContentSizeChange={scrollToEnd}
        >
          {messages.length === 0 ? (
            <Text style={{ color: c.mutedForeground, textAlign: "center", marginTop: 20 }}>
              Scrie primul mesaj către furnizor.
            </Text>
          ) : (
            messages.map((m) => {
              const mine = m.sender_role === "couple";
              return (
                <View
                  key={m.id}
                  style={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    backgroundColor: mine ? c.primary : c.card,
                    borderWidth: mine ? 0 : 1,
                    borderColor: c.border,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    maxWidth: "82%",
                  }}
                >
                  <Text style={{ color: mine ? "#fff" : c.foreground, fontSize: 15 }}>
                    {m.body}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          padding: 10,
          borderTopWidth: 1,
          borderTopColor: c.border,
          backgroundColor: c.card,
        }}
      >
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Scrie un mesaj…"
          placeholderTextColor={c.mutedForeground}
          multiline
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 9,
            fontSize: 15,
            color: c.foreground,
            backgroundColor: c.background,
            maxHeight: 120,
          }}
        />
        <Pressable
          onPress={send}
          disabled={sending || !body.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: c.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: sending || !body.trim() ? 0.5 : 1,
          }}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
