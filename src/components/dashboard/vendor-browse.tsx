"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { categoryLabel } from "@/lib/vendors/categories";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type BrowseVendor = {
  id: string;
  business_name: string;
  category: string;
  regions: string[];
  description: string | null;
  logo_url: string | null;
  rating: number;
};

export function VendorBrowse({
  weddingId,
  vendors,
  contactedIds,
}: {
  weddingId: string;
  vendors: BrowseVendor[];
  contactedIds: string[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [contacted, setContacted] = useState<string[]>(contactedIds);
  const [error, setError] = useState<string | null>(null);

  const categoriesPresent = [...new Set(vendors.map((v) => v.category))];
  const shown = category
    ? vendors.filter((v) => v.category === category)
    : vendors;

  async function send(vendorId: string) {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/weddings/${weddingId}/leads`, {
        vendor_id: vendorId,
        message: message || null,
        client_phone: phone || null,
      });
      setContacted((c) => [...c, vendorId]);
      setOpenId(null);
      setMessage("");
      setPhone("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setBusy(false);
    }
  }

  if (vendors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Momentan nu există furnizori disponibili pentru regiunea nunții tale.
        Revino curând — adăugăm furnizori noi mereu.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toate categoriile</option>
          {categoriesPresent.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shown.map((v) => {
          const done = contacted.includes(v.id);
          return (
            <div
              key={v.id}
              className="flex flex-col rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                {v.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.logo_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md bg-muted" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.business_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel(v.category)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-current text-warning" />
                    {v.rating.toFixed(1)}
                  </p>
                </div>
              </div>

              {v.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {v.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/furnizori/${v.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Vezi profil
                </Link>
                <div className="ml-auto">
                  {done ? (
                    <Badge tone="success">Cerere trimisă</Badge>
                  ) : (
                    <Button size="sm" onClick={() => setOpenId(v.id)}>
                      Contactează
                    </Button>
                  )}
                </div>
              </div>

              {openId === v.id && !done && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <Textarea
                    rows={3}
                    placeholder="Mesaj (opțional): detalii despre nunta ta"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Input
                    placeholder="Telefon (opțional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => send(v.id)}
                    >
                      {busy ? "Se trimite…" : "Trimite cererea"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setOpenId(null)}
                    >
                      Anulează
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
