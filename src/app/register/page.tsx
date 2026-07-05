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
import { Logo } from "@/components/logo";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Preselectează tipul de cont din `?type=` (ex. venit din „Pentru furnizori").
  const [accountType, setAccountType] = useState<AccountType>(() =>
    accountTypeFromParam(searchParams.get("type")),
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cod de referral (link primit de la un furnizor partener). Îl salvăm în
  // metadata contului; legarea la invitator se face la crearea profilului.
  const referralCode = searchParams.get("ref")?.trim() || null;

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
        data: {
          full_name: fullName,
          user_type: accountType,
          ...(referralCode ? { referred_by_code: referralCode } : {}),
        },
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
      const next = searchParams.get("next");
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
              <Link href={`/login?type=${accountType}`}>
                Mergi la autentificare
              </Link>
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
          {referralCode && accountType === "vendor" && (
            <p className="mb-4 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
              Ai fost invitat de un furnizor partener. Creează-ți contul și
              listează-te — partenerul tău primește o lună de abonament gratuită
              după ce ești verificat.
            </p>
          )}
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
            <Link
              href={`/login?type=${accountType}`}
              className="text-primary hover:underline"
            >
              Autentifică-te
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
