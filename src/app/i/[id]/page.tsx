import { RsvpForm } from "@/components/dashboard/rsvp-form";
import { scriptFont, serifFont } from "@/lib/fonts";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EventSlotRow } from "@/lib/supabase/database.types";
import {
  DEFAULT_INVITATION_MESSAGE,
  defaultCouple,
  formatLongDate,
} from "@/lib/wedding/invitation";
import { slotTypeLabel } from "@/lib/wedding/labels";
import { Heart, MapPin, Navigation } from "lucide-react";
import type { Metadata } from "next";

async function getWedding(id: string) {
  const sb = createAdminClient();
  const { data } = await sb
    .from("weddings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const wedding = await getWedding(id);
  if (!wedding || !wedding.invitation_published) {
    return { title: "Invitație" };
  }
  const couple = wedding.invitation_couple || defaultCouple(wedding.name);
  const title = `Invitație la nunta ${couple}`;
  const description =
    formatLongDate(wedding.wedding_date) ?? "Vă invităm cu drag la nunta noastră";
  return {
    title,
    description,
    openGraph: { title, description, images: ["/logo.png"] },
  };
}

function Ornament() {
  return (
    <div className="my-8 flex items-center justify-center gap-3 text-[var(--primary)]/50">
      <span className="h-px w-16 bg-current" />
      <Heart className="h-4 w-4 fill-current" />
      <span className="h-px w-16 bg-current" />
    </div>
  );
}

function SlotBlock({ slot }: { slot: EventSlotRow }) {
  const title = slot.title || slotTypeLabel(slot.slot_type);
  const time = slot.slot_time ? slot.slot_time.slice(0, 5) : null;
  const place = [slot.locality, slot.county]
    .filter(Boolean)
    .join(", ");
  const mapsQuery = [slot.location_name, slot.location_address, place]
    .filter(Boolean)
    .join(", ");
  const q = encodeURIComponent(mapsQuery);
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const wazeUrl = `https://waze.com/ul?q=${q}&navigate=yes`;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--accent)]/50 px-5 py-4">
      <p className="text-2xl text-[var(--primary)]" style={script}>
        {title}
      </p>
      {time && <p className="mt-1 text-lg">ora {time}</p>}
      {slot.location_name && <p className="text-base">{slot.location_name}</p>}
      {slot.location_address && (
        <p className="text-sm text-[var(--muted-foreground)]">
          {slot.location_address}
        </p>
      )}
      {place && (
        <p className="text-sm text-[var(--muted-foreground)]">{place}</p>
      )}
      {mapsQuery && (
        <div className="mt-2 flex flex-wrap gap-4">
          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" /> Google Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
          >
            <Navigation className="h-3.5 w-3.5" /> Waze
          </a>
        </div>
      )}
    </div>
  );
}

const script = { fontFamily: "var(--font-script)" };

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wedding = await getWedding(id);

  if (!wedding || !wedding.invitation_published) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
        <div>
          <Heart className="mx-auto h-8 w-8 text-[var(--primary)]/50" />
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Invitația nu este disponibilă momentan.
          </p>
        </div>
      </main>
    );
  }

  const sb = createAdminClient();
  const { data: slots } = await sb
    .from("event_slots")
    .select("*")
    .eq("wedding_id", id)
    .order("order_index", { ascending: true });

  const couple = wedding.invitation_couple || defaultCouple(wedding.name);
  const message = wedding.invitation_message || DEFAULT_INVITATION_MESSAGE;
  const dateStr = formatLongDate(wedding.wedding_date);

  return (
    <main
      className={`${scriptFont.variable} ${serifFont.variable} flex-1`}
      style={{
        fontFamily: "var(--font-serif)",
        background: "linear-gradient(180deg,#fbf7f4 0%,#f6e9ee 100%)",
      }}
    >
      <div className="mx-auto max-w-xl px-5 py-12">
        <div className="rounded-3xl border border-[var(--border)] bg-white/70 px-6 py-12 text-center shadow-sm backdrop-blur-sm">
          <Ornament />
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
            Vă invităm la nunta noastră
          </p>
          <h1
            className="mt-5 text-6xl leading-tight text-[var(--primary)] sm:text-7xl"
            style={script}
          >
            {couple}
          </h1>
          {dateStr && <p className="mt-5 text-2xl">{dateStr}</p>}

          <Ornament />

          <p className="mx-auto max-w-md text-xl leading-relaxed">{message}</p>

          {slots && slots.length > 0 && (
            <div className="mt-10">
              <h2 className="text-4xl text-[var(--primary)]" style={script}>
                Programul zilei
              </h2>
              <div className="mt-6 space-y-4 text-left">
                {slots.map((s) => (
                  <SlotBlock key={s.id} slot={s} />
                ))}
              </div>
            </div>
          )}

          <Ornament />

          <p className="text-4xl text-[var(--primary)]" style={script}>
            Vă așteptăm cu drag!
          </p>
        </div>

        <div className="mt-6 print:hidden">
          <RsvpForm weddingId={id} />
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Creat cu NuntaPlanner
        </p>
      </div>
    </main>
  );
}
