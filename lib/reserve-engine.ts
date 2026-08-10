"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * GATE 5B — the flow's only data access. The reservation engine lives in
 * the shared Supabase backend; this page may touch it through a handful
 * of anon-callable functions and nothing else. The anon (publishable)
 * key holds no table permissions.
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export interface Availability {
  available: boolean;
  /** Internal assignment details — never rendered to guests. */
  tables?: string[];
  table_ids?: string[];
  zone?: string;
  reason?:
    | "no_fit"
    | "party_too_large"
    | "party_needs_arrangement"
    | "blocked"
    | "outside_service_window"
    | "past"
    | "beyond_horizon"
    | "invalid_party";
  /** Nearest same-day hours that CAN seat the party (engine-provided). */
  alternatives?: string[];
  /** True on no_fit when only R or an arranged run could seat this size —
      the refusal must invite a call, never read "fully seated". */
  arrange?: boolean;
}

/**
 * GATE 9 (Amendment 5): THE slot lists, derived in the database from the
 * service_windows setting — the same source the staff dashboard uses, so
 * an owner's settings edit moves both flows with no code change.
 */
export async function listServiceSlots(): Promise<{ lunch: string[]; dinner: string[] }> {
  const { data, error } = await supabase.rpc("list_service_slots");
  if (error) throw new Error(error.message);
  return data as { lunch: string[]; dinner: string[] };
}

export async function checkAvailability(
  date: string,
  time: string,
  party: number,
  seatingPref: string | null = null,
): Promise<Availability> {
  const { data, error } = await supabase.rpc("check_availability", {
    p_date: date,
    p_time: time,
    p_party: party,
    p_seating_pref: seatingPref,
  });
  if (error) throw new Error(error.message);
  return data as Availability;
}

export type CreateResult =
  | {
      success: true;
      reservation_id: string;
      /** The guest's only access to this booking — carried to /reservation/[token]. */
      manage_token: string;
      tables: string[];
      zone: string;
    }
  | { success: false; reason?: string; alternatives?: string[]; arrange?: boolean };

export async function createReservation(args: {
  date: string;
  time: string;
  party: number;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  seatingPref: string | null;
}): Promise<CreateResult> {
  const { data, error } = await supabase.rpc("create_reservation", {
    p_date: args.date,
    p_time: args.time,
    p_party: args.party,
    p_guest_name: args.name,
    p_phone: args.phone,
    p_email: args.email,
    p_channel: "web",
    p_note: args.note,
    p_seating_pref: args.seatingPref,
  });
  if (error) throw new Error(error.message);
  return data as CreateResult;
}

/**
 * Phone is identity (doctrine): compose the normalized international
 * form the engine's identity key expects — +, country code, national
 * digits with any leading trunk zero dropped (081… → +6681…).
 */
export function normalizePhone(code: string, national: string): string {
  const digits = national.replace(/\D/g, "").replace(/^0/, "");
  return `${code}${digits}`;
}

/* ── the manage page's two calls (Amendment 2) ─────────────────────── */

export type ManagedReservation =
  | { found: false }
  | {
      found: true;
      status: "confirmed" | "seated" | "done" | "no_show" | "cancelled";
      res_date: string;
      res_time: string;
      party_size: number;
      seating_pref: string | null;
      first_name: string | null;
      reference: string;
    };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getReservationByToken(token: string): Promise<ManagedReservation> {
  // A malformed token is simply an unknown one — never a different answer.
  if (!UUID_RE.test(token)) return { found: false };
  const { data, error } = await supabase.rpc("get_reservation_by_token", {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  return data as ManagedReservation;
}

export async function cancelReservationByToken(
  token: string,
): Promise<{ success: boolean; reason?: string }> {
  if (!UUID_RE.test(token)) return { success: false, reason: "unknown" };
  const { data, error } = await supabase.rpc("cancel_reservation_by_token", {
    p_token: token,
  });
  if (error) throw new Error(error.message);
  return data as { success: boolean; reason?: string };
}
