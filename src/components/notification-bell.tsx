"use client";

import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Clopoțel de notificări in-app. Citește notificările proprii (RLS) și ascultă
 * live inserările prin Supabase Realtime. Marchează citit la deschidere/click.
 */
export function NotificationBell() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (!active) return;
      setItems((data ?? []) as NotificationRow[]);

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) =>
            setItems((prev) =>
              prev.some((n) => n.id === (payload.new as NotificationRow).id)
                ? prev
                : [payload.new as NotificationRow, ...prev].slice(0, 30),
            ),
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.read_at).length;

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id && !n.read_at
          ? { ...n, read_at: new Date().toISOString() }
          : n,
      ),
    );
    await createClient()
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .is("read_at", null);
  }

  async function markAllRead() {
    const now = new Date().toISOString();
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await createClient()
      .from("notifications")
      .update({ read_at: now })
      .in("id", ids);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notificări"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">Notificări</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Marchează toate citite
              </button>
            )}
          </div>

          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nicio notificare încă.
              </li>
            ) : (
              items.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "flex gap-2 px-3 py-2.5 transition-colors hover:bg-muted",
                      !n.read_at && "bg-accent/40",
                    )}
                  >
                    {!n.read_at && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className={cn("min-w-0", n.read_at && "pl-4")}>
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && (
                        <p className="truncate text-xs text-muted-foreground">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString("ro-RO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          markRead(n.id);
                          setOpen(false);
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => markRead(n.id)}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
