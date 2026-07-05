"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  LocalityPicker,
  type LocalityValue,
} from "@/components/dashboard/locality-picker";
import { api } from "@/lib/api/client";
import { COUNTIES } from "@/lib/localities/counties";
import { createClient } from "@/lib/supabase/client";
import type { VendorRow } from "@/lib/supabase/database.types";
import {
  TIER_PRICING,
  VENDOR_CATEGORIES_SORTED,
  tierForCategory,
} from "@/lib/vendors/categories";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function VendorForm({
  userId,
  defaultEmail,
  initial,
}: {
  userId: string;
  defaultEmail: string | null;
  initial?: VendorRow;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const [businessName, setBusinessName] = useState(initial?.business_name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [regions, setRegions] = useState<string[]>(initial?.regions ?? []);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? defaultEmail ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initial?.logo_url ?? null);
  const [address, setAddress] = useState<LocalityValue>({
    county_code: initial?.county_code ?? null,
    county: initial?.county ?? null,
    locality: initial?.locality ?? null,
  });

  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionQuery, setRegionQuery] = useState("");

  const tier = category ? tierForCategory(category) : null;

  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  const filteredCounties = regionQuery
    ? COUNTIES.filter((c) => norm(c.name).includes(norm(regionQuery)))
    : COUNTIES;

  function toggleRegion(name: string) {
    setRegions((r) =>
      r.includes(name) ? r.filter((x) => x !== name) : [...r, name],
    );
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("vendor-logos")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("vendor-logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Încărcare eșuată");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!businessName.trim()) return setError("Completează numele afacerii.");
    if (!category) return setError("Alege o categorie.");
    if (regions.length === 0) return setError("Alege cel puțin o regiune.");

    setBusy(true);
    const payload = {
      business_name: businessName.trim(),
      category,
      regions,
      description: description || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      logo_url: logoUrl,
      county_code: address.county_code,
      county: address.county,
      locality: address.locality,
    };
    try {
      if (isEdit) {
        await api.patch(`/vendors/${initial!.id}`, payload);
      } else {
        await api.post("/vendors", payload);
      }
      router.push("/vendor");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <div>
        <Label htmlFor="business_name">Numele afacerii</Label>
        <Input
          id="business_name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="ex. Studio Foto Lumina"
        />
      </div>

      <div>
        <Label htmlFor="category">Categorie</Label>
        <Select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Alege categoria…</option>
          {VENDOR_CATEGORIES_SORTED.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>
        {tier && (
          <p className="mt-1 text-xs text-muted-foreground">
            Tier {TIER_PRICING[tier].label}: {TIER_PRICING[tier].cplRON} RON/lead
            sau {TIER_PRICING[tier].monthlyRON} RON/lună.
          </p>
        )}
      </div>

      <div>
        <Label>Regiuni acoperite</Label>
        <Input
          value={regionQuery}
          onChange={(e) => setRegionQuery(e.target.value)}
          placeholder="Caută județ…"
          className="mt-1"
        />
        <div className="mt-2 max-h-52 overflow-y-auto rounded-md border border-border p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
            {filteredCounties.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                Niciun județ găsit.
              </p>
            )}
            {filteredCounties.map((c) => (
              <label key={c.code} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={regions.includes(c.name)}
                  onChange={() => toggleRegion(c.name)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        {regions.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {regions.length} regiuni selectate.
          </p>
        )}
      </div>

      <div>
        <Label className="mb-1 block">Adresa ta (județ / localitate)</Label>
        <LocalityPicker
          idPrefix="vendor-addr-"
          value={address}
          onChange={setAddress}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Unde ești localizat — apare pe profilul tău și ajută mirii să știe cât
          de aproape ești.
        </p>
      </div>

      <div>
        <Label htmlFor="description">Descriere</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Spune mirilor ce oferi și de ce să te aleagă."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email public</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div>
        <Label htmlFor="logo">Logo</Label>
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="h-14 w-14 rounded-md border border-border object-cover"
            />
          )}
          <Input
            id="logo"
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadLogo(f);
            }}
          />
        </div>
        {uploading && (
          <p className="mt-1 text-xs text-muted-foreground">Se încarcă…</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy || uploading}>
          {busy
            ? "Se salvează…"
            : isEdit
              ? "Salvează modificările"
              : "Trimite spre verificare"}
        </Button>
        {!isEdit && (
          <p className="text-xs text-muted-foreground">
            Profilul e verificat manual înainte de a apărea public.
          </p>
        )}
      </div>
    </form>
  );
}
