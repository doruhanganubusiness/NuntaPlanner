/**
 * Trimitere email prin Resend (REST API, fără dependențe).
 * Best-effort: dacă lipsește cheia sau apar erori, nu aruncă — doar raportează.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

type SendResult = { sent: boolean; reason?: string };

async function send(payload: {
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

/** Email de invitare a unui membru la planificarea nunții. */
export function sendInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  weddingName: string;
}): Promise<SendResult> {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#2a2320">
    <h2 style="color:#b04a6f">Ai o invitație la o nuntă 💍</h2>
    <p>Ai fost invitat(ă) să te alături planificării <b>${escapeHtml(
      opts.weddingName,
    )}</b> pe NuntaPlanner.</p>
    <p style="margin:24px 0">
      <a href="${opts.inviteUrl}"
         style="background:#b04a6f;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block">
        Acceptă invitația
      </a>
    </p>
    <p style="font-size:13px;color:#7c6f68">
      Sau copiază acest link în browser:<br>
      <a href="${opts.inviteUrl}" style="color:#b04a6f">${opts.inviteUrl}</a>
    </p>
  </div>`;
  return send({
    to: opts.to,
    subject: `Invitație la planificarea nunții ${opts.weddingName}`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
