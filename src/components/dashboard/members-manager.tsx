"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import type { WeddingMemberRow } from "@/lib/supabase/database.types";
import { Check, Link as LinkIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_LABEL: Record<string, string> = {
  groom: "Mire",
  bride: "Mireasă",
  parent: "Părinte",
  godparent: "Naș",
  viewer: "Vizitator",
};

export function MembersManager({
  weddingId,
  initialMembers,
}: {
  weddingId: string;
  initialMembers: WeddingMemberRow[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("parent");
  const [permission, setPermission] = useState("viewer");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(memberId: string, token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copiază linkul de invitație:", url);
    }
    setCopiedId(memberId);
    setTimeout(() => setCopiedId((c) => (c === memberId ? null : c)), 2000);
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { member } = await api.post<{ member: WeddingMemberRow }>(
        `/weddings/${weddingId}/members`,
        { email, role, permission },
      );
      setMembers((m) => [...m, member]);
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setBusy(false);
    }
  }

  async function remove(mid: string) {
    await api.del(`/weddings/${weddingId}/members/${mid}`);
    setMembers((m) => m.filter((x) => x.id !== mid));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border rounded-md border border-border">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between px-3 py-2.5 text-sm"
          >
            <div>
              <p className="font-medium">{m.email}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABEL[m.role] ?? m.role} · {m.permission} ·{" "}
                {m.status === "active" ? "activ" : "în așteptare"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {m.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(m.id, m.invite_token)}
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="h-4 w-4" /> Copiat
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" /> Copiază link
                    </>
                  )}
                </Button>
              )}
              {m.permission !== "owner" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(m.id)}
                  aria-label="Elimină"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={invite} className="space-y-3">
        <h3 className="font-medium">Invită un membru</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Label htmlFor="m-email">Email</Label>
            <Input
              id="m-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="m-role">Rol</Label>
            <Select
              id="m-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="groom">Mire</option>
              <option value="bride">Mireasă</option>
              <option value="parent">Părinte</option>
              <option value="godparent">Naș</option>
              <option value="viewer">Vizitator</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="m-perm">Permisiune</Label>
            <Select
              id="m-perm"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="viewer">Vizualizare</option>
              <option value="editor">Editare</option>
            </Select>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? "Se trimite…" : "Trimite invitația"}
        </Button>
      </form>
    </div>
  );
}
