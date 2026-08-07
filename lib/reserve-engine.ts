"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * GATE 5B — the flow's only data access. The reservation engine lives in
 * the shared Supabase backend; this page may touch it through exactly two
 * anon-callable functions and nothing else. The anon (publishable) key
 * holds no table permissions.
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
  | { success: true; reservation_id: string; tables: string[]; zone: string }
  | { success: false; reason?: string; alternatives?: string[] };

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
