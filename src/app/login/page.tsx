"use client";

import {
  AccountTypeToggle,
  accountTypeFromParam,
  type AccountType,
} from "@/components/auth/account-type-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Contextul (miri/furnizor) vine din `?type=`. Rutarea după login rămâne însă
  // după tipul REAL al contului (profiles.user_type), nu după comutator.
  const [accountType, setAccountType] = useState<AccountType>(() =>
    accountTypeFromParam(searchParams.get("type")),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const next = searchParams.get("next");
    if (next) {
      router.push(next);
    } else {
      // Rutare după tipul contului: furnizorii merg în dashboard-ul lor.
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .maybeSingle();
      router.push(profile?.user_type === "vendor" ? "/vendor" : "/dashboard");
    }
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Bine ai revenit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Tip cont</Label>
              <div className="mt-1">
                <AccountTypeToggle
                  value={accountType}
                  onChange={setAccountType}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {accountType === "vendor"
                  ? "Autentificare furnizor: gestionează-ți lead-urile și abonamentul."
                  : "Autentificare miri: continuă planificarea nunții."}
              </p>
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
              <Label htmlFor="password">Parolă</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Se conectează…" : "Autentificare"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Nu ai cont?{" "}
            <Link
              href={`/register?type=${accountType}`}
              className="text-primary hover:underline"
            >
              Creează unul
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <LoginForm />
      </Suspense>
      <SiteFooter />
    </>
  );
}
