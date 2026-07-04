"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { VendorRow, VendorStatus } from "@/lib/supabase/database.types";
import { categoryLabel } from "@/lib/vendors/categories";
import { useState } from "react";

const STATUS_TONE: Record<VendorStatus, "success" | "warning" | "muted"> = {
  active: "success",
  pending: "warning",
  suspended: "muted",
  inactive: "muted",
};

export function AdminVendorList({ initial }: { initial: VendorRow[] }) {
  const [vendors, setVendors] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function update(
    id: string,
    patch: { status?: VendorStatus; verified?: boolean },
  ) {
    setBusyId(id);
    try {
      const { vendor } = await api.patch<{ vendor: VendorRow }>(
        `/admin/vendors/${id}`,
        patch,
      );
      setVendors((vs) => vs.map((v) => (v.id === id ? vendor : v)));
    } finally {
      setBusyId(null);
    }
  }

  if (vendors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Niciun furnizor înregistrat.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {vendors.map((v) => (
        <li key={v.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{v.business_name}</p>
              <p className="text-xs text-muted-foreground">
                {categoryLabel(v.category)} · {v.regions.join(", ") || "—"}
              </p>
              {v.description && (
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  {v.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {v.email ?? "fără email"}
                {v.phone ? ` · ${v.phone}` : ""}
                {v.website ? ` · ${v.website}` : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge>
              {v.verified && <Badge tone="success">verificat</Badge>}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!(v.status === "active" && v.verified) && (
              <Button
                size="sm"
                disabled={busyId === v.id}
                onClick={() => update(v.id, { status: "active", verified: true })}
              >
                Aprobă & publică
              </Button>
            )}
            {v.status !== "suspended" && (
              <Button
                variant="outline"
                size="sm"
                disabled={busyId === v.id}
                onClick={() => update(v.id, { status: "suspended" })}
              >
                Suspendă
              </Button>
            )}
            {v.status === "suspended" && (
              <Button
                variant="outline"
                size="sm"
                disabled={busyId === v.id}
                onClick={() => update(v.id, { status: "active" })}
              >
                Reactivează
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
