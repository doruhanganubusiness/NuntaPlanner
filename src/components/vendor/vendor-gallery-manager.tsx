"use client";

import { createClient } from "@/lib/supabase/client";
import type { VendorMediaRow } from "@/lib/supabase/database.types";
import { MAX_VENDOR_IMAGES, MAX_VENDOR_VIDEOS } from "@/lib/vendors/media";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function VendorGalleryManager({
  vendorId,
  userId,
  initial,
}: {
  vendorId: string;
  userId: string;
  initial: VendorMediaRow[];
}) {
  const [media, setMedia] = useState<VendorMediaRow[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  async function add(file: File, type: "image" | "video") {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || (type === "image" ? "jpg" : "mp4");
      const path = `${userId}/${type}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("vendor-media")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage
        .from("vendor-media")
        .getPublicUrl(path);

      const { data, error: insErr } = await supabase
        .from("vendor_media")
        .insert({ vendor_id: vendorId, type, url: pub.publicUrl })
        .select("*")
        .single();
      if (insErr) throw insErr;
      setMedia((m) => [...m, data as VendorMediaRow]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Încărcare eșuată");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: delErr } = await supabase
        .from("vendor_media")
        .delete()
        .eq("id", id);
      if (delErr) throw delErr;
      setMedia((m) => m.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ștergere eșuată");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Imagini */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">
            Imagini{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({images.length}/{MAX_VENDOR_IMAGES})
            </span>
          </h2>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy || images.length >= MAX_VENDOR_IMAGES}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) add(f, "image");
                e.target.value = "";
              }}
            />
            <span
              className={
                "inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium " +
                (busy || images.length >= MAX_VENDOR_IMAGES
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-muted")
              }
            >
              Adaugă imagine
            </span>
          </label>
        </div>
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nicio imagine încă. Adaugă până la {MAX_VENDOR_IMAGES}.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((m) => (
              <div key={m.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt=""
                  className="aspect-square w-full rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  disabled={busy}
                  aria-label="Șterge"
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Videoclipuri */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">
            Videoclipuri{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({videos.length}/{MAX_VENDOR_VIDEOS})
            </span>
          </h2>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={busy || videos.length >= MAX_VENDOR_VIDEOS}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) add(f, "video");
                e.target.value = "";
              }}
            />
            <span
              className={
                "inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium " +
                (busy || videos.length >= MAX_VENDOR_VIDEOS
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-muted")
              }
            >
              Adaugă videoclip
            </span>
          </label>
        </div>
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Niciun videoclip încă. Adaugă până la {MAX_VENDOR_VIDEOS}.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {videos.map((m) => (
              <div key={m.id} className="relative">
                <video
                  src={m.url}
                  controls
                  className="w-full rounded-md border border-border"
                />
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  disabled={busy}
                  aria-label="Șterge"
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
