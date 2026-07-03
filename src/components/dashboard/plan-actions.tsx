"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { Printer, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PlanActions({ weddingId }: { weddingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function recompute() {
    setBusy(true);
    try {
      await api.post(`/weddings/${weddingId}/calculations/recompute`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={recompute} disabled={busy}>
        <RefreshCw className="h-4 w-4" /> Recalculează
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Export PDF
      </Button>
    </div>
  );
}
