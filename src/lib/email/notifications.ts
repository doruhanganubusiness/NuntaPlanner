/**
 * Notificări email către furnizori la evenimentele cheie ale marketplace-ului
 * (spec §9): lead nou, chitanță la deblocare CPL, aprobare profil.
 * Toate sunt best-effort (nu blochează fluxul principal la eșec) și rezolvă
 * adresa furnizorului prin admin client (email public sau emailul contului).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { emailButton, emailShell, escapeHtml, sendEmail } from "@/lib/email/resend";
import { SITE_URL } from "@/lib/seo";

type VendorContact = { email: string; businessName: string };

async function vendorContact(vendorId: string): Promise<VendorContact | null> {
  const admin = createAdminClient();
  const { data: v } = await admin
    .from("vendors")
    .select("email, business_name, user_id")
    .eq("id", vendorId)
    .maybeSingle();
  if (!v) return null;

  let email = v.email ?? null;
  if (!email) {
    const { data } = await admin.auth.admin.getUserById(v.user_id);
    email = data.user?.email ?? null;
  }
  if (!email) return null;
  return { email, businessName: v.business_name };
}

/** Furnizorul a primit o cerere nouă de la un cuplu. */
export async function notifyVendorNewLead(
  vendorId: string,
  opts: { region: string | null; message: string | null },
): Promise<void> {
  const c = await vendorContact(vendorId);
  if (!c) return;
  const html = emailShell(`
    <h2 style="color:#b04a6f">Ai o cerere nouă 🎉</h2>
    <p>Un cuplu te-a contactat pe NuntaPlanner${
      opts.region ? ` din <b>${escapeHtml(opts.region)}</b>` : ""
    }.</p>
    ${
      opts.message
        ? `<blockquote style="border-left:3px solid #e8ddd6;margin:12px 0;padding:4px 12px;color:#7c6f68">${escapeHtml(
            opts.message,
          )}</blockquote>`
        : ""
    }
    <p>Intră în cont ca să vezi cererea și să deblochezi contactul cuplului.</p>
    ${emailButton(`${SITE_URL}/vendor/leads`, "Vezi cererea")}`);
  await sendEmail({
    to: c.email,
    subject: "Cerere nouă pe NuntaPlanner",
    html,
  });
}

/** Furnizorul a fost aprobat de platformă și e acum public. */
export async function notifyVendorApproved(vendorId: string): Promise<void> {
  const c = await vendorContact(vendorId);
  if (!c) return;
  const html = emailShell(`
    <h2 style="color:#b04a6f">Ești listat în platformă! 🎉</h2>
    <p>Profilul tău <b>${escapeHtml(
      c.businessName,
    )}</b> a fost verificat și e acum public în directorul NuntaPlanner. Cuplurile te pot găsi și contacta.</p>
    ${emailButton(`${SITE_URL}/vendor`, "Deschide contul")}`);
  await sendEmail({
    to: c.email,
    subject: "Ești listat pe NuntaPlanner",
    html,
  });
}

/** Chitanță după deblocarea unui lead prin plată CPL. */
export async function notifyVendorLeadReceipt(
  vendorId: string,
  amountRON: number,
): Promise<void> {
  const c = await vendorContact(vendorId);
  if (!c) return;
  const html = emailShell(`
    <h2 style="color:#b04a6f">Chitanță — deblocare lead</h2>
    <p>Ai deblocat contactul unui cuplu pe NuntaPlanner.</p>
    <p>Sumă plătită: <b>${amountRON} RON</b>.</p>
    ${emailButton(`${SITE_URL}/vendor/leads`, "Vezi lead-urile")}`);
  await sendEmail({
    to: c.email,
    subject: `Chitanță NuntaPlanner — ${amountRON} RON`,
    html,
  });
}
