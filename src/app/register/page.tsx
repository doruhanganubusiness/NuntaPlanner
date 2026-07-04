"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AccountType = "client" | "vendor";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [loading, setLoading] = useState(false);

  const home = accountType === "vendor" ? "/vendor" : "/dashboard";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, user_type: accountType },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}${home}`
            : undefined,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next || home);
      router.refresh();
    } else {
      setNeedsVerify(true);
      setLoading(false);
    }
  }

  if (needsVerify) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Verifică-ți emailul</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ți-am trimis un link de confirmare pe <b>{email}</b>. Deschide-l ca
              să-ți activezi contul.
            </p>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/login">Mergi la autentificare</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link href="/">
            <Logo />
          </Link>
          <CardTitle className="mt-2 text-xl">Creează-ți contul</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Tip cont</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {(
                  [
                    { v: "client", label: "Miri" },
                    { v: "vendor", label: "Furnizor" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setAccountType(opt.v)}
                    className={
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors " +
                      (accountType === opt.v
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted")
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {accountType === "vendor"
                  ? "Cont de furnizor: îți listezi serviciile și primești cereri de la miri."
                  : "Cont de miri: planifică-ți nunta și contactează furnizori."}
              </p>
            </div>

            <div>
              <Label htmlFor="full_name">
                {accountType === "vendor" ? "Persoană de contact" : "Nume complet"}
              </Label>
              <Input
                id="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Parolă (min. 8 caractere)</Label>
              <PasswordInput
                id="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se creează…" : "Creează cont"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ai deja cont?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Autentifică-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
