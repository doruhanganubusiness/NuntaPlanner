import { OnboardingForm } from "@/components/dashboard/onboarding-form";

export default function NewWeddingPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold">Nuntă nouă</h1>
      <p className="mt-1 text-muted-foreground">
        Completează detaliile — le poți ajusta oricând din tab-uri.
      </p>
      <div className="mt-6">
        <OnboardingForm />
      </div>
    </main>
  );
}
