import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * The confirmation letter — the guest's only durable copy of the manage link.
 *
 * The booking itself is written from the browser; this route exists because
 * the Resend key is a secret and must never reach the bundle. It is written
 * defensively: the house would rather send no letter than let this endpoint
 * become a relay for someone else's mail.
 *
 * What it trusts, and what it does not:
 *   - the token must name a real reservation (verified against the engine)
 *   - every detail in the letter — evening, hour, party, reference — is read
 *     back from the engine, never taken from the caller
 *   - only the address is caller-supplied, because the engine's token lookup
 *     does not return it; a real token is the price of sending anything
 */

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ledalat.com";
const FROM = process.env.RESEND_FROM ?? "Le Dalat <reservations@ledalat.com>";
const PHONE_DISPLAY = "+66 2 259 9593";

/* Built on first use, never at import — a missing key must not take the route
   down before it can answer. (Same lesson as lib/reserve-engine.ts.) */
let mailer: Resend | null = null;
function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!mailer) mailer = new Resend(key);
  return mailer;
}

interface ManagedReservation {
  found: boolean;
  status?: string;
  res_date?: string;
  res_time?: string;
  party_size?: number;
  seating_pref?: string | null;
  first_name?: string | null;
  reference?: string;
}

async function lookup(token: string): Promise<ManagedReservation | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const res = await fetch(`${url}/rest/v1/rpc/get_reservation_by_token`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as ManagedReservation;
}

/* ── the letter ──────────────────────────────────────────────────────── */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function speakDate(key: string): string {
  const d = new Date(`${key}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function speakHour(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function speakParty(n: number): string {
  const words = ["", "one guest", "two guests", "three guests", "four guests", "five guests",
    "six guests", "seven guests", "eight guests", "nine guests", "ten guests"];
  return words[n] ?? `${n} guests`;
}

function letter(r: ManagedReservation, manageUrl: string): string {
  const row = (k: string, v: string) => `
    <tr>
      <td style="padding:6px 0;font:400 10px/1.6 Helvetica,Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#16335C80;">${k}</td>
      <td style="padding:6px 0;font:400 17px/1.5 Georgia,'Times New Roman',serif;color:#16335C;text-align:right;">${v}</td>
    </tr>`;

  const greeting = r.first_name ? `${r.first_name}, the` : "The";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>Your table at Le Dalat</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE6;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FBF8F2;border:1px solid #C8A86B40;">
        <tr><td style="padding:40px 36px 0;text-align:center;">
          <img src="${SITE}/web_assets/LD-logo-email.png" width="72" height="72" alt="Le Dalat" style="display:block;margin:0 auto 28px;" />
          <p style="margin:0;font:400 10px/1.6 Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#C8A86B;">Reservation confirmed</p>
          <h1 style="margin:14px 0 0;font:500 34px/1.15 Georgia,'Times New Roman',serif;color:#16335C;">The table is set.</h1>
          <p style="margin:12px 0 0;font:italic 400 17px/1.6 Georgia,'Times New Roman',serif;color:#2C8F5C;">${greeting} house is expecting you.</p>
        </td></tr>

        <tr><td style="padding:30px 36px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #16335C1A;border-bottom:1px solid #16335C1A;">
            ${row("Reference", r.reference ?? "—")}
            ${row("Evening", r.res_date ? speakDate(r.res_date) : "—")}
            ${row("Hour", r.res_time ? speakHour(r.res_time.slice(0, 5)) : "—")}
            ${row("Party", r.party_size ? speakParty(r.party_size) : "—")}
            ${row("Seating", r.seating_pref === "madams_room" ? "Madam's Room" : "Chosen by the house")}
          </table>
        </td></tr>

        <tr><td style="padding:26px 36px 0;">
          <p style="margin:0;font:400 14px/1.75 Helvetica,Arial,sans-serif;color:#16335CB3;">
            Nothing is asked of you. The family holds this table for two hours from your
            chosen hour. If your evening changes, release it with the link below — or
            telephone the house on ${PHONE_DISPLAY}.
          </p>
        </td></tr>

        <tr><td style="padding:26px 36px 40px;text-align:center;">
          <a href="${manageUrl}" style="display:inline-block;padding:14px 30px;background:#2C8F5C;color:#FBF8F2;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.25em;text-transform:uppercase;text-decoration:none;border-radius:999px;">Manage this reservation</a>
          <p style="margin:18px 0 0;font:400 11px/1.6 Helvetica,Arial,sans-serif;color:#16335C66;word-break:break-all;">${manageUrl}</p>
        </td></tr>

        <tr><td style="padding:0 36px 36px;text-align:center;border-top:1px solid #16335C14;">
          <p style="margin:22px 0 0;font:italic 400 14px/1.6 Georgia,'Times New Roman',serif;color:#16335C80;">
            Sukhumvit Soi 23, Bangkok — family run since 1983.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ── the route ───────────────────────────────────────────────────────── */

export async function POST(request: Request) {
  let body: { token?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ sent: false, reason: "bad_request" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!UUID_RE.test(token) || !EMAIL_RE.test(email)) {
    return NextResponse.json({ sent: false, reason: "bad_request" }, { status: 400 });
  }

  const mail = resend();
  if (!mail) {
    // No key configured: the booking still stands, the letter simply is not written.
    return NextResponse.json({ sent: false, reason: "not_configured" }, { status: 503 });
  }

  const booking = await lookup(token);
  if (!booking?.found) {
    return NextResponse.json({ sent: false, reason: "unknown_token" }, { status: 404 });
  }

  const manageUrl = `${SITE}/reservation/${token}`;
  const when = booking.res_date ? speakDate(booking.res_date) : "your evening";

  try {
    const { error } = await mail.emails.send({
      from: FROM,
      to: email,
      subject: `Your table at Le Dalat — ${when}`,
      html: letter(booking, manageUrl),
      text:
        `The table is set.\n\n` +
        `Reference: ${booking.reference ?? "—"}\n` +
        `Evening: ${when}\n` +
        `Hour: ${booking.res_time ? speakHour(booking.res_time.slice(0, 5)) : "—"}\n` +
        `Party: ${booking.party_size ? speakParty(booking.party_size) : "—"}\n` +
        `Seating: ${booking.seating_pref === "madams_room" ? "Madam's Room" : "Chosen by the house"}\n\n` +
        `The family holds this table for two hours from your chosen hour.\n` +
        `To change or release it: ${manageUrl}\n` +
        `Or telephone the house on ${PHONE_DISPLAY}.\n\n` +
        `Le Dalat — Sukhumvit Soi 23, Bangkok. Family run since 1983.`,
    });
    if (error) {
      console.error("[reservation/confirm] resend refused:", error);
      return NextResponse.json({ sent: false, reason: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[reservation/confirm] resend threw:", err);
    return NextResponse.json({ sent: false, reason: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
