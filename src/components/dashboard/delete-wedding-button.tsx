"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CONFIRM =
  "Sigur ștergi această planificare? Se șterg toate detaliile, evenimentele și membrii. Acțiunea nu poate fi anulată.";

/**
 * Șterge o nuntă (owner-only prin RLS). Cere confirmare — acțiunea e ireversibilă.
 * `iconOnly` pentru cardul din listă; altfel buton complet (zona periculoasă).
 */
export function DeleteWeddingButton({
  weddingId,
  iconOnly = false,
  redirectTo,
  label = "Șterge planificarea",
}: {
  weddingId: string;
  iconOnly?: boolean;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function del() {
    if (!window.confirm(CONFIRM)) return;
    setDeleting(true);
    try {
      await api.del(`/weddings/${weddingId}`);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      setDeleting(false);
      window.alert("Nu am putut șterge planificarea. Încearcă din nou.");
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={del}
        disabled={deleting}
        aria-label="Șterge planificarea"
        title="Șterge planificarea"
        className="rounded-md border border-border bg-card/80 p-1.5 text-destructive backdrop-blur transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Button variant="destructive" onClick={del} disabled={deleting}>
      <Trash2 className="h-4 w-4" /> {deleting ? "Se șterge…" : label}
    </Button>
  );
}
