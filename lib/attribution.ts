"use client";

/**
 * Where did this guest find the house? Captured once, on the first page of
 * the visit, and handed to create_reservation so the monthly report can
 * count LINE, Google, Instagram and Facebook bookings.
 *
 * Share links carry it explicitly. The short links /line, /google and /fb
 * (next.config.ts) open /reservation tagged; Instagram's /ig opens the
 * homepage as "instagram-home" and /reserve the booking flow as
 * "instagram-reserve". src, ref or
 * utm_source on any page work too. Once read, those tags are tidied out of
 * the address bar so a guest who copies the link doesn't pass the tag on. Without a tag, the referrer's host is a fair
 * second guess; with neither, the visit is "direct".
 *
 * Works on any page, not only /reservation: a guest can land on the homepage
 * from Instagram, wander, and book days later. The label is kept for 30 days
 * on this device. A tagged visit (src/utm/referrer) replaces an older label;
 * a plain direct visit never overwrites one. Storage can be blocked (private
 * mode, in-app browsers), so every access is guarded and a failure only
 * costs the label, never the booking.
 */

const KEY = "ld_attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface Attribution {
  source: string;
  utm: Record<string, string> | null;
  /** epoch ms when captured */
  at?: number;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

function clean(v: string | null): string | null {
  if (!v) return null;
  const s = v.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
  return s || null;
}

function fromReferrer(ref: string): string | null {
  let host: string;
  try {
    host = new URL(ref).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "www.ledalat.com" || host === "ledalat.com" || host === location.hostname) return null;
  if (/(^|\.)line\.me$|(^|\.)line-apps\.com$/.test(host)) return "line";
  if (/(^|\.)google\./.test(host)) return "google";
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  if (/(^|\.)(facebook\.com|fb\.com|messenger\.com)$/.test(host)) return "facebook";
  if (/(^|\.)tripadvisor\./.test(host)) return "tripadvisor";
  return "referral";
}

/** Read the landing URL once per session. Safe to call on every page. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) utm[k] = v.slice(0, 100);
    }
    const tagged =
      clean(params.get("src")) ??
      clean(params.get("ref")) ??
      clean(params.get("utm_source")) ??
      fromReferrer(document.referrer);
    // An untagged visit keeps whatever label is already on this device.
    if (!tagged && readAttribution()) return;
    const value: Attribution = {
      source: tagged ?? "direct",
      utm: Object.keys(utm).length ? utm : null,
      at: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage blocked: the booking still goes through, unlabelled */
  }
  tidyUrl();
}

const TAG_KEYS = ["src", "ref", ...UTM_KEYS];

/** Drop the tracking tags from the address bar, keeping every other param. */
function tidyUrl(): void {
  try {
    const url = new URL(location.href);
    let changed = false;
    for (const k of TAG_KEYS) {
      if (url.searchParams.has(k)) {
        url.searchParams.delete(k);
        changed = true;
      }
    }
    if (changed) history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  } catch {
    /* cosmetic only */
  }
}

export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Attribution;
    if (!value.at || Date.now() - value.at > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}
