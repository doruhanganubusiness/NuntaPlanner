"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { BUDGET_LABELS, type BudgetCategoryKey } from "@/lib/engine";
import type { WeddingRow } from "@/lib/supabase/database.types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ALL_CATEGORIES: BudgetCategoryKey[] = [
  "venue_catering",
  "photo_video",
  "music",
  "decor_flowers",
  "attire",
  "drinks",
  "invitations_favors_cake",
  "misc",
];

export function BudgetForm({ wedding }: { wedding: WeddingRow }) {
  const router = useRouter();
  const [total, setTotal] = useState(
    wedding.total_budget != null ? String(wedding.total_budget) : "",
  );
  const [drinkMode, setDrinkMode] = useState(wedding.drink_mode);
  const [priorities, setPriorities] = useState<BudgetCategoryKey[]>(
    (wedding.budget_priorities as BudgetCategoryKey[] | null) ?? ALL_CATEGORIES,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  function move(idx: number, dir: -1 | 1) {
    const next = [...priorities];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setPriorities(next);
  }

  async function save() {
    setStatus("saving");
    await api.patch(`/weddings/${wedding.id}`, {
      total_budget: total ? Number(total) : null,
      drink_mode: drinkMode,
      budget_priorities: priorities,
    });
    setStatus("saved");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="total">Buget total (RON)</Label>
          <Input
            id="total"
            type="number"
            min={0}
            placeholder="ex. 120000"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="drink_mode">Băutură</Label>
          <Select
            id="drink_mode"
            value={drinkMode}
            onChange={(e) =>
              setDrinkMode(e.target.value as WeddingRow["drink_mode"])
            }
          >
            <option value="quantities">Calculează cantități (mirii aduc)</option>
            <option value="cost">Calculează cost (inclusă în meniu)</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Prioritizează categoriile (cea mai importantă sus)</Label>
        <ul className="divide-y divide-border rounded-md border border-border">
          {priorities.map((key, idx) => (
            <li
              key={key}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span>
                {idx + 1}. {BUDGET_LABELS[key]}
              </span>
              <span className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Mai sus"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(idx, 1)}
                  disabled={idx === priorities.length - 1}
                  aria-label="Mai jos"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Se salvează…" : "Salvează bugetul"}
        </Button>
        {status === "saved" && (
          <span className="text-sm text-success">Salvat ✓</span>
        )}
      </div>
    </div>
  );
}
