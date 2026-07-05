/**
 * Trimitere email prin Resend (REST API, fără dependențe).
 * Best-effort: dacă lipsește cheia sau apar erori, nu aruncă — doar raportează.
 * NOTĂ: fără un domeniu verificat în Resend, livrarea reușește DOAR către adresa
 * contului Resend; către alți destinatari întoarce 403 (dar nu blochează fluxul).
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendResult = { sent: boolean; reason?: string };

export async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "RESEND_API_KEY lipsește" };
  const from =
    process.env.EMAIL_FROM || "NuntaPlanner <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!res.ok) {
      return { sent: false, reason: await res.text() };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: String(e) };
  }
}

/** Învelișul HTML comun al email-urilor (branding NuntaPlanner). */
export function emailShell(inner: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#2a2320">
    ${inner}
    <hr style="border:none;border-top:1px solid #e8ddd6;margin:28px 0" />
    <p style="font-size:12px;color:#7c6f68">NuntaPlanner — planifică-ți nunta de la zero.</p>
  </div>`;
}

/** Buton CTA reutilizabil pentru email-uri. */
export function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0">
    <a href="${href}"
       style="background:#b04a6f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

/** Email de invitare a unui membru la planificarea nunții. */
export function sendInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  weddingName: string;
}): Promise<SendResult> {
  const html = emailShell(`
    <h2 style="color:#b04a6f">Ai o invitație la o nuntă 💍</h2>
    <p>Ai fost invitat(ă) să te alături planificării <b>${escapeHtml(
      opts.weddingName,
    )}</b> pe NuntaPlanner.</p>
    ${emailButton(opts.inviteUrl, "Acceptă invitația")}
    <p style="font-size:13px;color:#7c6f68">
      Sau copiază acest link în browser:<br>
      <a href="${opts.inviteUrl}" style="color:#b04a6f">${opts.inviteUrl}</a>
    </p>`);
  return sendEmail({
    to: opts.to,
    subject: `Invitație la planificarea nunții ${opts.weddingName}`,
    html,
  });
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
